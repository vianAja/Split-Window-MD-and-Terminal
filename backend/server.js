import express from "express";
import { WebSocketServer } from "ws";
import { Client } from "ssh2";
import http from "http";
import fs from "fs";
import dotenv from "dotenv";
import { exec } from "child_process";
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Tambahan untuk login
import session from "express-session";
import bodyParser from "body-parser";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();
// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.PGHOST || "host.docker.internal",
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || "vian",
  password: process.env.PGPASSWORD || "vian",
  database: process.env.PGDATABASE || "participant",
});

// Middleware untuk parse body dan session
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "secret-key",  // ganti pakai ENV di produksi
  resave: false,
  saveUninitialized: false,
}));

// Middleware cek login
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// Login routes
app.get("/login", (req, res) => {
  res.sendFile(process.cwd() + "/public/login.html");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]   // ⚠️ plain text, di real case pakai bcrypt
    );
    if (result.rows.length > 0) {
      req.session.user = result.rows[0];
      res.redirect("/home");
    } else {
      res.redirect("/login-error");
    }
  } catch (err) {
    console.error("⚠️ Login query error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/login-error", (req, res) => {
  res.send("<h1>❌ Login Failed</h1><p>Invalid username or password.</p><a href='/login'>Try again</a>");
});

app.get("/home", requireLogin, (req, res) => {
  res.send(`<h1>Welcome ${req.session.user.username} 🎉</h1><a href="/logout">Logout</a>`);
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

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