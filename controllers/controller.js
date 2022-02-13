const db = require(`../models/db.js`);
const mysql = require(`mysql`);

const controller = {
  // Open index.hbs with movies
  getIndex: function (req, res) {
    db.query("SELECT * FROM movies", (err, movies) => {
      if (!err) {
        movies = movies.slice(0, 30);
        res.render(`index`, { movies });
      } else {
        console.log(err);
      }
    });
  },

  // adds entry to db
  addEntry: function (req, res) {
    // select max id first
    db.query("SELECT MAX(id) AS maxID FROM movies", (err, result1) => {
      if (!err) {
        console.log(result1);
        res.send(result1);
        const maxID = result1[0].maxID + 1;

        const entry = {
          id: maxID,
          name: req.body.movieTitle,
          year: req.body.movieYear,
          rank: req.body.movieRate,
        };

        db.query("INSERT INTO movies SET ?", entry, (err, result2) => {
          if (!err) {
            console.log(result2);
          } else {
            console.log(err);
          }
        });
      } else {
        console.log(err);
      }
    });
  },
};

module.exports = controller;
