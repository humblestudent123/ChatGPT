import { useState, useRef, useEffect } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  // автоскролл
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // загрузка истории
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("chat-history")) || [];
    setMessages(saved);
  }, []);

  // сохранение истории
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

      const botMessage = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, botMessage]);

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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100 font-sans animate-fadeIn">
      {/* Верхняя панель */}
      <header className="w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md shadow-md">
        <div className="max-w-3xl mx-auto flex justify-between items-center py-4 px-4">
          <h1 className="text-xl font-bold text-emerald-400 select-none drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]">
            💬 GPT Chat
          </h1>
          <button
            onClick={clearChat}
            className="px-3 py-1.5 text-sm bg-red-500/90 hover:bg-red-600 transition rounded-lg shadow-sm hover:shadow-red-500/40"
          >
            Очистить
          </button>
        </div>
      </header>

      {/* Область чата */}
      <main
        ref={chatRef}
        className="flex-1 w-full flex justify-center overflow-y-auto py-6"
      >
        <div className="w-full max-w-3xl px-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex transition-all duration-300 ease-out ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative px-4 py-3 rounded-2xl text-sm md:text-base shadow-lg backdrop-blur-sm transition-all duration-300 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40"
                    : "bg-gray-800/90 text-gray-200 font-mono shadow-gray-700/20 hover:shadow-gray-600/30"
                } animate-fadeIn`}
              >
                {msg.content}
                {/* Курсор только у последнего сообщения ассистента */}
                {loading &&
                  msg.role === "assistant" &&
                  i === messages.length - 1 && (
                    <span className="ml-1 text-emerald-400 animate-blink">|</span>
                  )}
              </div>
            </div>
          ))}

          {loading && !messages[messages.length - 1]?.content && (
            <div className="flex items-center gap-2 text-gray-400 italic text-sm mt-2 animate-pulse">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
              <span>GPT думает...</span>
            </div>
          )}

          {messages.length === 0 && (
            <div className="text-center text-gray-500 italic mt-20 animate-fadeInSlow">
              Начни новый диалог 👋
            </div>
          )}
        </div>
      </main>

      {/* Поле ввода */}
      <footer className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-md px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            className="flex-1 bg-gray-800/90 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            placeholder="Введите сообщение..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="relative px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-[length:200%_auto] hover:bg-right transition-all duration-500 shadow-lg hover:shadow-emerald-500/25"
          >
            Отправить
          </button>
        </div>
      </footer>
    </div>
  );
}
