import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // 👈 подключаем .env

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 👈 берём ключ из .env
});

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  console.log("📩 Получено сообщение от клиента:", message);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices?.[0]?.message?.content || "⚠️ Не удалось получить ответ от модели.";
    console.log("🤖 Ответ модели:", reply);

    res.json({ reply });
  } catch (err) {
    console.error("❌ Ошибка при запросе к OpenAI:", err);
    res.status(500).json({ error: "Ошибка при обращении к OpenAI API" });
  }
});

console.log("📡 Готовимся запустить сервер...");
app.listen(3000, () => console.log("✅ Server running on port 3000"));
