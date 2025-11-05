/** Database for lunchly */
require("dotenv").config();
const pg = require("pg");

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL || "postgresql:///lunchly",
});

db.connect();

module.exports = db;
