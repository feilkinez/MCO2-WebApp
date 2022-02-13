const db = require(`../models/db.js`);
const mysql = require(`mysql`);

const controller = {
  // Open index.hbs with movies
  getIndex: function (req, res) {
    db.query("SELECT * FROM movies", (err, movies) => {
      db.end();

      if (!err) {
        movies = movies.slice(0, 30);
        res.render(`index`, { movies });
      } else {
        console.log(err);
      }
    });
  },
};

module.exports = controller;
