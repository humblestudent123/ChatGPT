import { useState, useRef, useEffect } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  // Автоскролл вниз при каждом сообщении
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // Загрузка истории
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("chat-history")) || [];
    setMessages(saved);
  }, []);

  // Сохранение истории
  useEffect(() => {
    localStorage.setItem("chat-history", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const fullText = data.reply;

      // Добавляем пустое сообщение бота
      const botMessage = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, botMessage]);

      // Эффект печати
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setMessages((prev) =>
          prev.map((m, idx) =>
            idx === prev.length - 1
              ? { ...m, content: fullText.slice(0, i) }
              : m
          )
        );
        if (i === fullText.length) {
          clearInterval(interval);
          setLoading(false);
        }
      }, 25);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Ошибка соединения с сервером." },
      ]);
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chat-history");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100">
      {/* Верхняя панель */}
      <header className="w-full border-b border-gray-800 bg-gray-900/70 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex justify-between items-center py-4 px-4">
          <h1 className="text-xl font-semibold text-emerald-400 select-none">
            💬 GPT Chat
          </h1>
          <button
            onClick={clearChat}
            className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 transition rounded-lg"
          >
            Очистить
          </button>
        </div>
      </header>

      {/* Область чата */}
      <main
        ref={chatRef}
        className="flex-1 w-full flex justify-center overflow-y-auto"
      >
        <div className="w-full max-w-3xl px-4 py-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex transition-opacity duration-300 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl text-sm md:text-base shadow-sm ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-800 text-gray-200 font-mono"
                }`}
              >
                {msg.content}
                {loading && msg.role === "assistant" && (
                  <span className="ml-1 text-gray-400 animate-blink">|</span>
                )}
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center text-gray-500 italic mt-16">
              Начни диалог 👋
            </div>
          )}
        </div>
      </main>

      {/* Поле ввода */}
      <footer className="border-t border-gray-800 bg-gray-900/70 backdrop-blur-md px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Введите сообщение..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="px-5 bg-emerald-600 hover:bg-emerald-500 transition rounded-xl font-semibold text-white"
          >
            Отправить
          </button>
        </div>
      </footer>
    </div>
  );
}
