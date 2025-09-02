const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "bh42)uN_oKeiBXO7",
    database: process.env.APP_DB_NAME || "campus_db",
  },
  pool: { min: 0, max: 20 },
});

module.exports = knex;
