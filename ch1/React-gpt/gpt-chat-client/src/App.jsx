import { useState, useRef, useEffect } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  // Автоскролл
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
          setLoading(false); // убираем курсор после окончания набора
        }
      }, 25); // скорость набора текста
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
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-400">💬 GPT Chat</h1>
        <button
          onClick={clearChat}
          className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded-lg"
        >
          Очистить чат
        </button>
      </div>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto bg-gray-800 p-4 rounded-xl shadow-inner space-y-4 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[80%] transition-opacity duration-300 ${
              msg.role === "user"
                ? "ml-auto bg-blue-600 text-white opacity-100"
                : "mr-auto bg-gray-700 text-gray-100 opacity-100 font-mono"
            }`}
          >
            {msg.content}
            {/* Мигающий курсор для бота */}
            {loading && msg.role === "assistant" && (
              <span className="ml-1 text-gray-100 animate-blink">|</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex">
        <input
          className="flex-1 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Введите сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="ml-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold"
          onClick={sendMessage}
        >
          Отправить
        </button>
      </div>
    </div>
  );
}
