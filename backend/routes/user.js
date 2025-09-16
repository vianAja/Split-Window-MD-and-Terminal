// routes/user.js
import express from "express";
const router = express.Router();
import pkg from "pg";
const { Pool } = pkg;
import jwt from "jsonwebtoken";


const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "yourdb",
  password: "yourpassword",
  port: 5432,
});

router.post("/validate-user", async (req, res) => {
  const { username, email, name } = req.body;

  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded);

    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1 AND email=$2 AND name=$3",
      [decoded.id, decoded.username, decoded.email]
    );
    console.log("Validate-user request:", req.body);
    console.log("Result query:", result);
    if (result.rows.length > 0) {
      return res.json({ success: true, user: result.rows[0] });
    } else {
      return res.status(401).json({ success: false, message: "User not valid" });
    }
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT id, name, username, email, course, password FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // TODO: cocokkan password (bcrypt compare)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const payload = {
      id: user.rows[0].id,
      username: user.rows[0].username,
      email: user.rows[0].email,
      name: user.rows[0].name,
    };
    // ✅ Buat JWT dengan payload user
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });


    // cuma kirim token
    res.json({ token, payload });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
