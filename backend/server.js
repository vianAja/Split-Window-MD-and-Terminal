import express from "express";
import { WebSocketServer } from "ws";
import { Client } from "ssh2";
import http from "http";
import fs from "fs";
import dotenv from "dotenv";
import { exec } from "child_process";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// 🔎 Coba jalankan hostnamectl / hostname biar keliatan di log
exec("hostnamectl", (error, stdout, stderr) => {
  if (error) {
    console.error("⚠️ hostnamectl error:", error.message);
    console.log("👉 coba pakai `hostname` saja...");

    exec("hostname", (err, out) => {
      if (err) {
        console.error("⚠️ hostname command error:", err.message);
      } else {
        console.log("📛 Container hostname:", out.trim());
      }
    });

    return;
  }
  if (stderr) {
    console.error("hostnamectl stderr:", stderr);
  }
  console.log("📋 Hostnamectl Output:\n" + stdout);
});

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

        // STDOUT dari VM
        stream.on("data", (data) => {
          const output = data.toString();
          console.log("📤 VM stdout:", output.trim());
          ws.send(output);
        });

        // STDERR dari VM
        stream.stderr.on("data", (data) => {
          const errorOutput = data.toString();
          console.error("⚠️ VM stderr:", errorOutput.trim());
          ws.send(errorOutput);
        });

        // Data dari terminal (frontend) -> kirim ke VM
        ws.on("message", (msg) => {
          const input = msg.toString();
          console.log("⌨️ From client:", JSON.stringify(input));
          stream.write(input);
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
      host: "host.docker.internal",
      port: 22,
      username: "vian",
      password: "123"
//      privateKey: fs.readFileSync("id_rsa")
    });
});
server.listen(3001, "0.0.0.0", () => {
  console.log("🚀 Backend running at http://localhost:3001");
});