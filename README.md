# Monitor Rock in Rio 2026 — dia 12 de Setembro

Roda no **GitHub Actions** (grátis em repositório público) a cada ~5 min, abre a página do
Ticketmaster BR, clica em "Ingressos" e checa se o **12 de Setembro** voltou à lista.
Quando aparecer (ou se a página for bloqueada), manda mensagem no **Telegram**.

## Setup (uma vez)

### 1. Criar o bot do Telegram
1. No Telegram, fale com **@BotFather** → `/newbot` → escolha um nome. Ele te dá um **token**
   (ex: `8123456:AAH...`).
2. Pegue seu **chat_id**: fale com **@userinfobot** (ele responde seu `Id`), ou mande uma
   mensagem pro seu bot e abra
   `https://api.telegram.org/bot<TOKEN>/getUpdates` pra ver o `chat.id`.

### 2. Criar o repositório
- Crie um repo **público** no GitHub e suba estes arquivos (`check.js`, `package.json`,
  `.github/workflows/monitor.yml`).

### 3. Configurar os secrets
No repo: **Settings → Secrets and variables → Actions → New repository secret**:
- `TELEGRAM_BOT_TOKEN` = o token do BotFather
- `TELEGRAM_CHAT_ID` = seu chat_id

### 4. Testar
- Aba **Actions → rir-dia12 → Run workflow** (botão).
- Veja o log: se aparecer `datas=[04 de Setembro | 05 ... | 13 de Setembro] has12=false blocked=false`,
  **passou** (o GitHub conseguiu ler). Se vier `blocked=true`, o Ticketmaster bloqueou o IP do
  GitHub — aí migramos pra rodar num aparelho seu / com proxy BR.

## Notas
- Repo **público** = minutos de Actions ilimitados (grátis). Os secrets ficam criptografados.
- O cron do GitHub é "best effort": pode atrasar alguns minutos sob carga.
- Enquanto não achar o dia 12, fica em silêncio (só loga). Avisa quando achar OU se bloquear.
