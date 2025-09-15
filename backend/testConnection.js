import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  host: "host.docker.internal",   // atau IP address server PostgreSQL
  port: 5432,
  user: "vian",
  password: "vian",
  database: "participant",
});

async function testConnection() {
  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL!");
    const res = await client.query("SELECT NOW()");
    console.log("Server time:", res.rows[0]);
  } catch (err) {
    console.error("❌ Connection error:", err.message);
  } finally {
    await client.end();
  }
}

testConnection();
