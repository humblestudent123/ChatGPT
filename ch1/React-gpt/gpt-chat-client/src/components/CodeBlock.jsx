import { useState } from "react";
import Highlight, { defaultProps } from "prism-react-renderer";

// Простая тёмная тема
const theme = {
  plain: { color: "#f8f8f2", backgroundColor: "#282a36" },
  styles: [
    { types: ["comment"], style: { color: "#6272a4", fontStyle: "italic" } },
    { types: ["keyword"], style: { color: "#ff79c6", fontWeight: "bold" } },
    { types: ["string"], style: { color: "#f1fa8c" } },
    { types: ["function"], style: { color: "#50fa7b" } },
  ],
};

export default function CodeBlock({ className, children }) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "javascript";
  const code = String(children).trim();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative my-2">
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 bg-gray-700/70 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition"
      >
        {copied ? "Скопировано!" : "Копировать"}
      </button>

      <Highlight {...defaultProps} code={code} language={language} theme={theme}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className + " rounded-md p-4 overflow-x-auto"} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
