import { Bot, InlineKeyboard } from "grammy";

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN yo'q. Railway > Variables ga BOT_TOKEN qo'shing.");
  process.exit(1);
}
if (!WEBAPP_URL) {
  console.error("WEBAPP_URL yo'q. Railway > Variables ga https://... linkni qo'shing.");
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

const shopKeyboard = new InlineKeyboard()
  .webApp("🛍 Do'konni ochish", WEBAPP_URL);

bot.command("start", async (ctx) => {
  const name = ctx.from?.first_name ?? "do'st";
  await ctx.reply(
    `Salom, ${name}! 👋\n\nBu bot orqali do'konimizga kirasiz.\nPastdagi tugmani bosing va xarid qilishni boshlang.`,
    { reply_markup: shopKeyboard },
  );
});

bot.command("shop", async (ctx) => {
  await ctx.reply("Do'kon:", { reply_markup: shopKeyboard });
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "Buyruqlar:\n/start — botni boshlash\n/shop — do'konni ochish\n/help — yordam",
  );
});

// Mini App ichidan yuborilgan ma'lumot (buyurtma va h.k.)
bot.on("message:web_app_data", async (ctx) => {
  const raw = ctx.message.web_app_data?.data ?? "";
  console.log("web_app_data:", raw);
  await ctx.reply("Rahmat! Ma'lumotingiz qabul qilindi ✅");
});

bot.on("message", async (ctx) => {
  await ctx.reply("Do'konni ochish uchun tugmani bosing 👇", {
    reply_markup: shopKeyboard,
  });
});

bot.catch((err) => {
  console.error("Bot xatosi:", err);
});

await bot.api.setMyCommands([
  { command: "start", description: "Botni boshlash" },
  { command: "shop", description: "Do'konni ochish" },
  { command: "help", description: "Yordam" },
]);

console.log("Bot started");
bot.start();
