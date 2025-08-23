import express from "express";
import { WebSocketServer } from "ws";
import { Client } from "ssh2";
import http from "http";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Endpoint test
app.get("/", (req, res) => {
  res.send("Backend running: WebSocket SSH server active.");
});

wss.on("connection", (ws) => {
  console.log("🔌 New WebSocket client connected");

  const conn = new Client();

  conn
    .on("ready", () => {
      console.log("✅ SSH Connection established with VM");
      conn.shell((err, stream) => {
        if (err) {
          ws.send("Error starting shell: " + err.message);
          return;
        }

        // Data dari VM -> kirim ke terminal (xterm.js)
        stream.on("data", (data) => {
          ws.send(data.toString());
        });

        // Data dari terminal -> kirim ke VM
        ws.on("message", (msg) => {
          stream.write(msg.toString());
        });

        // Handle disconnect
        ws.on("close", () => {
          console.log("❌ WebSocket client disconnected");
          conn.end();
        });
      });
    })
    .on("error", (err) => {
      console.error("SSH connection error:", err);
      ws.send("SSH connection failed: " + err.message);
    })
    .connect({
      host: process.env.VM_HOST,
      port: process.env.VM_PORT,
      username: process.env.VM_USER,
      privateKey: fs.readFileSync(process.env.VM_KEY),
    });
});

server.listen(3001, () => {
  console.log("🚀 Backend running at http://localhost:3001");
});
