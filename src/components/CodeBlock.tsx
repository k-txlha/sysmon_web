import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "bash",
  filename,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = code.trim();
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = code.trim().split("\n");

  return (
    <div className="custom-code-block">
      <div className="code-block-header">
        <div className="code-block-meta">
          <span className="code-language">{language}</span>
          {filename && <span className="code-filename">{filename}</span>}
        </div>
        <button
          type="button"
          className="code-copy-btn"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
        >
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <div className="code-block-content">
        <pre>
          <code>
            {showLineNumbers ? (
              lines.map((line, idx) => (
                <div key={idx} className="code-line">
                  <span className="line-num">{idx + 1}</span>
                  <span className="line-text">{line}</span>
                </div>
              ))
            ) : (
              code.trim()
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

