const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();

// Create Connection
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.ADMIN,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

// Connect Database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL Connected...");
});

module.exports = db;
