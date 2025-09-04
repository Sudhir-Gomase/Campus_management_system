// connection.js
import dotenv from "dotenv";
import knexLib from "knex";
import logger from "../../../utils/logger.js"; // note: must include .js extension

// load env vars from .env
dotenv.config();

// log env values (but hide password for security)
logger.info("DB Config", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

console.log("process.env.DB_HOST", process.env.DB_HOST);

const knex = knexLib({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "98.70.102.203", // use 127.0.0.1 instead of localhost
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "bh42)uN_oKeiBXO7",
    database: process.env.DB_NAME || "campus_db",
  },
  pool: { min: 0, max: 20 },
});

export default knex;
