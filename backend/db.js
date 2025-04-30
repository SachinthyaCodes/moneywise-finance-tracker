//Database Connection
//Uses pg (PostgreSQL) module to connect to the database.


const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "fin_db",
  password: "123",
  port: 5432,  // Default PostgreSQL port
});

module.exports = pool;
