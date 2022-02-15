/* NODE 3 - DB >= 1980 */

const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();

// Create Connection
const db3 = mysql.createConnection({
  host: process.env.HOST3,
  user: process.env.ADMIN3,
  password: process.env.PASS3,
  database: process.env.DB3,
});

// Connect Database
db3.connect((err) => {
  if (err) {
    console.log("NODE3 Crashed...");
  } else {
    console.log("NODE3 Connected...");
  }
});

module.exports = db3;
