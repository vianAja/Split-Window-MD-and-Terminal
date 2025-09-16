// db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "vian",
  host: "host.docker.internal",   // atau host.docker.internal kalau dari docker
  database: "participant",
  password: "vian",
  port: 5432,
});

module.exports = pool;
