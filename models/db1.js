/* NODE 1 - CENTRAL DB */

const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();

// Create Connection
const db1 = mysql.createConnection({
  host: process.env.HOST1,
  user: process.env.ADMIN1,
  password: process.env.PASS1,
  database: process.env.DB1,
});

// Connect Database
db1.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("NODE1 Connected...");
});

module.exports = db1;
