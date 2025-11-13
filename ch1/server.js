import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

// Текстовый чат
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  console.log("📩 Получено сообщение:", message);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "⚠️ Не удалось получить ответ от модели.";

    console.log("🤖 Ответ модели:", reply);
    res.json({ reply });
  } catch (err) {
    console.error("❌ Ошибка при обращении к OpenAI:", err);
    res.status(500).json({ error: "Ошибка при обращении к OpenAI API" });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`)
);
