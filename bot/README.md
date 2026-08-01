# Telegram bot (Railway)

Mini App'ni ochib beruvchi Telegram bot.

## Railway'ga deploy

1. Railway → New Project → Deploy from GitHub repo → bu reponi tanlang
2. Settings → **Root Directory** = `bot`
3. Variables:
   - `BOT_TOKEN` — @BotFather bergan token
   - `WEBAPP_URL` — Mini App'ning https linki (masalan `https://xxx.lovable.app`)
4. Deploy → Logs'da `Bot started` chiqishi kerak
5. Telegramda botga `/start` yozing

Eslatma: Mini App tugmasi faqat **https** linkda ishlaydi.
