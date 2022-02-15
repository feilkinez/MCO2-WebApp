/* NODE 2 - DB < 1980 */

const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();

// Create Connection
const db2 = mysql.createConnection({
  host: process.env.HOST2,
  user: process.env.ADMIN2,
  password: process.env.PASS2,
  database: process.env.DB2,
});

// Connect Database
db2.connect((err) => {
  if (err) {
    console.log("NODE2 Crashed...");
  } else {
    console.log("NODE2 Connected...");
  }
});

module.exports = db2;
