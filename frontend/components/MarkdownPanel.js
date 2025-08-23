import React from "react";
import ReactMarkdown from "react-markdown";

const content = `
# Welcome to the Web Lab

This is the **theory panel** on the left.  
You can write instructions here.  

Support for \`inline code\`.  

Even code blocks:

\`\`\`bash
ls -la
echo "Hello from VM"
\`\`\`
`;

export default function MarkdownPanel() {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
