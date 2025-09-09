import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

const TerminalPanel = ({ connected }) => {   // ⬅️ terima prop connected
  const terminalRef = useRef(null);
  const termRef = useRef(null);

  useEffect(() => {
    if (!connected || !terminalRef.current) return;  
    // buat terminal hanya sekali
    if (!termRef.current) {
      const term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        theme: { background: "#1e1e1e" },
      });
      term.open(terminalRef.current);

      const ws = new WebSocket("ws://localhost:3001");

      ws.onopen = () => term.writeln("✅ Connected to WebSocket SSH server\r\n");
      ws.onmessage = (event) => term.write(event.data);
      ws.onerror = (err) => term.writeln("\r\n❌ WebSocket error: " + err.message);
      ws.onclose = () => term.writeln("\r\n❌ Disconnected from WebSocket server");

      term.onData((data) => ws.send(data));

      // simpan instance
      termRef.current = term;
      wsRef.current = ws;
    }

    // ✅ cleanup kalau `connected` berubah jadi false / komponen unmount
    return () => {
      if (!connected && wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (!connected && termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }
    };
  }, [connected]);


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
