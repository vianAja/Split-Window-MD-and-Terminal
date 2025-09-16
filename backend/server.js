import express from "express";
import { WebSocketServer } from "ws";
import { Client } from "ssh2";
import http from "http";
import fs from "fs";
import dotenv from "dotenv";
import { exec } from "child_process";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pkg from "pg";
import userRoutes from "./routes/user.js";

const { Pool } = pkg;
dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(bodyParser.json());

// route API
app.use("/api", userRoutes);

const SECRET_KEY = process.env.JWT_SECRET || "test123";

// PostgreSQL connection
const pool = new Pool({
  host: "host.docker.internal",   // atau IP address server PostgreSQL
  port: 5432,
  user: "vian",
  password: "vian",
  database: "participant",
});

// ---------------- AUTH SECTION ----------------

// Register endpoint
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Missing username or password" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      res.status(409).json({ message: "Username already exists" });
    } else {
      console.error("Register error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Missing username or password" });

  try {
    console.log("🔎 Login attempt:", username);
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    console.log("🗄️ Query result:", result.rows);
    if (result.rows.length === 0)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Middleware to protect routes
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // save user info ke request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Protected route example
app.get("/profile", requireAuth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

// ---------------- LEGACY FEATURES (SSH + WS) ----------------

// Run hostnamectl
// exec("hostnamectl", (error, stdout, stderr) => {
//   if (error) {
//     console.error("⚠️ hostnamectl error:", error.message);
//     exec("hostname", (err, out) => {
//       if (err) console.error("⚠️ hostname error:", err.message);
//       else console.log("📛 Container hostname:", out.trim());
//     });
//     return;
//   }
//   if (stderr) console.error("hostnamectl stderr:", stderr);
//   console.log("📋 Hostnamectl Output:\n" + stdout);
// });

// Root test endpoint
app.get("/", (req, res) => {
  res.send("Backend running: WebSocket SSH server + Auth integrated.");
});

// WebSocket SSH
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

        stream.on("data", (data) => ws.send(data.toString()));
        stream.stderr.on("data", (data) => ws.send(data.toString()));

        ws.on("message", (msg) => stream.write(msg.toString()));

        ws.on("close", () => {
          console.log("❌ WebSocket client disconnected");
          conn.end();
        });
      });
    })
    .on("error", (err) => {
      console.error("SSH error:", err);
      ws.send("SSH connection failed: " + err.message);
    })
    .connect({
      host: "host.docker.internal",
      port: 22,
      username: "vian",
      password: "123",
      // privateKey: fs.readFileSync("id_rsa")
    });
});

// ---------------- START SERVER ----------------
server.listen(3001, "0.0.0.0", () => {
  console.log("🚀 Backend running at http://localhost:3001");
});
