import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function MarkdownPanel() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/sample.md") // ambil file markdown dari public/
      .then((res) => res.text())
      .then((text) => setContent(text));
  }, []);

  return (
    <div className="p-4 overflow-auto bg-gray-50 h-full text-gray-800">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
