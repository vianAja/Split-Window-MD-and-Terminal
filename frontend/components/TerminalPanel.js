import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

const TerminalPanel = () => {
  const terminalRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      theme: {
        background: "#1e1e1e", // mirip VSCode dark
      },
    });

    term.open(terminalRef.current);

    // 🔌 Connect ke backend WebSocket
    const ws = new WebSocket("ws://localhost:3001");

    ws.onopen = () => {
      term.writeln("✅ Connected to WebSocket SSH server\r\n");
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onerror = (err) => {
      term.writeln("\r\n❌ WebSocket error: " + err.message);
    };

    ws.onclose = () => {
      term.writeln("\r\n❌ Disconnected from WebSocket server");
    };

    // Input dari user -> kirim ke backend
    term.onData((data) => {
      ws.send(data);
    });

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div
      ref={terminalRef}
      style={{
        height: "500px",
        width: "100%",
        backgroundColor: "#000",
      }}
    />
  );
};

export default TerminalPanel;
