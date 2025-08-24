import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

export default function TerminalPanel() {
  const terminalRef = useRef(null);
  const termRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: "#000000",
        foreground: "#ffffff",
      },
    });

    term.open(terminalRef.current);
    term.focus();
    termRef.current = term;

    const wsUrl = `ws://localhost:3001`;
    term.writeln(`🔌 Connecting to ${wsUrl} ...\r\n`);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      term.writeln("✅ Connected to backend...\r\n");
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
      term.writeln("❌ WebSocket error (lihat console browser)\r\n");
    };

    ws.onclose = (event) => {
      term.writeln(
        `⚠️ Disconnected from backend (code=${event.code}, reason=${event.reason})\r\n`
      );
    };

    // kirim input user ke backend (tanpa echo manual)
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
        console.log("👉 sending:", JSON.stringify(data));
      }
    });

    return () => {
      ws.close();
      term.dispose();
    };
  }, []);

  return (
    <div className="h-full w-full bg-black">
      <div ref={terminalRef} className="h-full w-full" tabIndex={0} />
    </div>
  );
}