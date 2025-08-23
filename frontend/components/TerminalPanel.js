import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

export default function TerminalPanel() {
  const terminalRef = useRef(null);

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

    // Connect ke backend WebSocket
    const ws = new WebSocket("ws://localhost:3001");

    ws.onopen = () => {
      term.write("Connected to backend SSH server...\r\n");
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    term.onData((data) => {
      ws.send(data);
    });

    return () => {
      ws.close();
      term.dispose();
    };
  }, []);

  return (
    <div className="h-full w-full bg-black">
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  );
}
