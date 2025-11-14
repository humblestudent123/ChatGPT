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
  const [loadingId, setLoadingId] = useState(null); // GPT думает…
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
  if (!input.trim()) return;

  const userMessage = { id: Date.now(), role: "user", content: input };
  setMessages(prev => [...prev, userMessage]);
  setInput("");

  setLoadingId(userMessage.id);

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage.content }),
    });

    const data = await res.json();
    const fullText = data.reply;

    const botId = Date.now() + 1;
    setMessages(prev => [
      ...prev,
      { id: botId, role: "assistant", content: "", cursor: true }
    ]);

    setLoadingId(null);

    const chunkSize = 24;   // идеальный размер
    const delay = 28;       // скорость ChatGPT
    let i = 0;

    const pushChunk = () => {
      if (i >= fullText.length) {
        setMessages(prev =>
          prev.map(m =>
            m.id === botId ? { ...m, cursor: false } : m
          )
        );
        return;
      }

      const next = fullText.slice(i, i + chunkSize);
      i += chunkSize;

      setMessages(prev =>
        prev.map(m =>
          m.id === botId ? { ...m, content: m.content + next } : m
        )
      );

      setTimeout(pushChunk, delay);
    };

    pushChunk();

  } catch (e) {
    setLoadingId(null);
    setMessages(prev => [
      ...prev,
      { id: Date.now() + 1, role: "assistant", content: "⚠️ Ошибка соединения." }
    ]);
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
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* HEADER */}
      <header className="w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur-md shadow-md">
        <div className="max-w-3xl mx-auto flex justify-between items-center py-4 px-4">
          <h1 className="text-xl font-bold text-emerald-400 select-none drop-shadow-md">
            💬 GPT Chat
          </h1>
          <button
            onClick={clearChat}
            className="px-3 py-1.5 text-sm bg-red-500/90 hover:bg-red-600 transition rounded-lg"
          >
            Очистить
          </button>
        </div>
      </header>

      {/* MAIN CHAT AREA */}
      <main ref={chatRef} className="flex-1 w-full flex justify-center overflow-y-auto py-6">
        <div className="w-full max-w-3xl px-4 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex transition-all duration-300 ease-out ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`relative px-4 py-3 rounded-2xl text-sm md:text-base shadow-lg backdrop-blur-sm transition-all duration-300 ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-[#1f1f1f] text-gray-100 border border-white/10"
              }`}>
                <div className="
  prose prose-invert max-w-none break-words whitespace-pre-wrap 
  leading-[1.65] text-[15px] md:text-[16px] font-[Inter]
  prose-p:my-2 prose-ul:my-2 prose-li:my-1
  prose-code:text-emerald-300 prose-code:bg-black/40 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
  prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
  relative
">

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

                  {msg.cursor && (
                    <span className="animate-pulse opacity-60 ml-0.5">▌</span>
                  )}

                </div>
              </div>
            </div>
          ))}

          {/* GPT думает… */}
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

      {/* FOOTER */}
      <footer className="border-t border-gray-800 bg-gray-900/80 backdrop-blur-md px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            className="
  flex-1 bg-[#1f1f1f] border border-white/10 rounded-2xl 
  px-4 py-3 text-gray-100 placeholder-gray-500
  focus:outline-none focus:ring-2 focus:ring-emerald-500 transition 
  text-[15px]
"

            placeholder="Введите сообщение..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="
  px-5 py-3 rounded-2xl font-semibold 
  bg-emerald-600 hover:bg-emerald-700 
  text-white transition active:scale-[0.98]
"

          >
            ➤
          </button>
        </div>
      </footer>
    </div>
  );
}
