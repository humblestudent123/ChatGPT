// ================================
// 📦 ИМПОРТЫ
// ================================
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./components/CodeBlock";

// ================================
// 💬 ОСНОВНОЙ КОМПОНЕНТ
// ================================
export default function App() {
  // ================================
  // ⚙️ СОСТОЯНИЕ
  // ================================
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const chatRef = useRef(null);

  // ================================
  // 🔄 АВТОСКРОЛЛ
  // ================================
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ================================
  // 💾 ЗАГРУЗКА ИСТОРИИ
  // ================================
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("chat-history")) || [];
    setMessages(saved);
  }, []);

  // ================================
  // 💾 СОХРАНЕНИЕ ИСТОРИИ
  // ================================
  useEffect(() => {
    localStorage.setItem("chat-history", JSON.stringify(messages));
  }, [messages]);

  // ================================
  // 🚀 ОТПРАВКА СООБЩЕНИЯ
  // ================================
  const sendMessage = async () => {
    if (!input) return;

    const botId = Date.now();
    setLoadingId(botId);

    // Добавляем сообщение пользователя
    setMessages((prev) => [...prev, { id: botId, role: "user", content: input }]);
    const userMessage = input;
    setInput("");

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      const botReply = data.reply;

      // Добавляем сообщение бота с пустым контентом, чтобы сразу отобразить блок
      setMessages((prev) => [...prev, { id: botId + 1, role: "assistant", content: "" }]);

      // Плавный вывод текста
      let i = 0;
      const interval = setInterval(() => {
        if (i === 0) setLoadingId(null); // индикатор исчезает, как только бот начинает писать
        i++;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId + 1 ? { ...m, content: botReply.slice(0, i) } : m
          )
        );
        if (i === botReply.length) {
          clearInterval(interval);
        }
      }, 25);
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId + 1
            ? { ...m, content: "⚠️ Ошибка соединения с сервером." }
            : m
        )
      );
      setLoadingId(null);
    }
  };

  // ================================
  // 🧹 ОЧИСТКА ЧАТА
  // ================================
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chat-history");
  };

  // ================================
  // 🧱 JSX-РАЗМЕТКА
  // ================================
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100 font-sans">
      {/* 🔹 HEADER */}
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

      {/* 🔹 MAIN CHAT AREA */}
      <main ref={chatRef} className="flex-1 w-full flex justify-center overflow-y-auto py-6">
        <div className="w-full max-w-3xl px-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex transition-all duration-300 ease-out ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative px-4 py-3 rounded-2xl text-sm md:text-base shadow-lg backdrop-blur-sm transition-all duration-300 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-500/20"
                    : "bg-gray-800/90 text-gray-100 font-mono shadow-gray-700/20"
                }`}
              >
                <div className="prose prose-invert max-w-none whitespace-pre-wrap break-words leading-relaxed font-mono relative">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children }) {
                        if (inline) return <code className="bg-gray-700/50 rounded px-1">{children}</code>;
                        return <CodeBlock className={className}>{children}</CodeBlock>;
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loadingId && (
            <div className="flex items-center gap-2 text-gray-400 italic text-sm animate-pulse mt-2">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
              <span>GPT думает...</span>
            </div>
          )}

          {messages.length === 0 && (
            <div className="text-center text-gray-500 italic mt-20">
              Начни новый диалог 👋
            </div>
          )}
        </div>
      </main>

      {/* 🔹 FOOTER */}
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
