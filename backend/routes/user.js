// routes/user.js
import express from "express";
const router = express.Router();
import pool from "./db";

router.post("/validate-user", async (req, res) => {
  const { username, email, name } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1 AND email=$2 AND name=$3",
      [username, email, name]
    );

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

module.exports = router;
