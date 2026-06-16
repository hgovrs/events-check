// Rock in Rio 2026 (Ticketmaster BR) — checa se o "12 de Setembro" voltou.
// Roda HEADLESS no GitHub Actions. Notifica via Telegram quando achar (ou se bloquear).
const { chromium } = require('playwright');

const URL = 'https://www.ticketmaster.com.br/event/rock-in-rio-2026-venda-geral';
const TARGET = /12\s*de\s*setembro/i;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;

const log = (m) => console.log(`[${new Date().toISOString()}] ${m}`);

async function tg(text) {
  if (!TOKEN || !CHAT) { log('Telegram nao configurado (secrets faltando): ' + text); return; }
  try {
    const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT, text, disable_web_page_preview: true }),
    });
    log('telegram status ' + r.status);
  } catch (e) { log('erro telegram: ' + e.message); }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
  });
  const ctx = await browser.newContext({
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 900 },
  });
  const page = await ctx.newPage();

  let dates = [], has12 = false, blocked = false;
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);
    try { const c = page.getByRole('button', { name: /aceitar todos/i }).first(); if (await c.count()) await c.click({ timeout: 2500 }); } catch (_) {}

    let clicked = false;
    for (let i = 0; i < 15 && !clicked; i++) {
      try {
        const ing = page.getByRole('button', { name: /^ingressos$/i }).or(page.getByRole('link', { name: /^ingressos$/i })).first();
        if (await ing.count()) { await ing.scrollIntoViewIfNeeded().catch(() => {}); await ing.click({ timeout: 3000 }); clicked = true; }
      } catch (_) {}
      if (!clicked) await page.waitForTimeout(1500);
    }
    try { await page.getByText(/selecionar ingressos|de setembro/i).first().waitFor({ timeout: 12000 }); } catch (_) {}
    await page.waitForTimeout(2000);

    const txt = await page.evaluate(() => (document.body ? document.body.innerText : ''));
    dates = [...new Set([...txt.matchAll(/\b(0?\d|1\d)\s*de\s*setembro/gi)].map((m) => m[0].replace(/\s+/g, ' ')))];
    has12 = TARGET.test(txt);
    // se nao conseguiu ler NENHUMA data e nao achou o botao, provavel bloqueio
    blocked = !clicked && dates.length === 0;
  } catch (e) {
    log('erro: ' + e.message);
    blocked = true;
  } finally {
    await browser.close().catch(() => {});
  }

  log(`datas=[${dates.join(' | ')}] has12=${has12} blocked=${blocked}`);

  if (has12) {
    await tg(`🎟️ ROCK IN RIO: o DIA 12 DE SETEMBRO APARECEU!\nCorra: ${URL}\nDatas vistas: ${dates.join(', ')}`);
  } else if (blocked) {
    await tg(`⚠️ Monitor RiR: não consegui ler a página (possível bloqueio do Ticketmaster no IP do GitHub). Datas lidas: nenhuma.`);
  }
  // sucesso lendo mas sem dia 12 => silencio (so log)
})();
