import { useState, useRef, useEffect } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

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
      const aiMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Ошибка соединения с сервером." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Автоскролл вниз при новых сообщениях
  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages, loading]);

  // Сохраняем историю в localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("chat-history")) || [];
    setMessages(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("chat-history", JSON.stringify(messages));
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-400">
        💬 GPT Chat
      </h1>

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto bg-gray-800 p-4 rounded-xl shadow-inner space-y-4"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-gray-700"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="text-gray-400 italic animate-pulse">ИИ печатает...</div>
        )}
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
