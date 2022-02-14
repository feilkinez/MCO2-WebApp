const mysql = require(`mysql`);
const db = require(`../models/db.js`);

const controller = {
  // Open index.hbs with movies
  getIndex: function (req, res) {
    db.query("SELECT * FROM movies ORDER BY id DESC", (err, movies) => {
      if (!err) {
        console.log("PASOK KA DITO");
        movies = movies.slice(0, 10);
        console.log(movies);
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

  // deletes entry from db
  delEntry: function (req, res) {
    db.query(
      "DELETE FROM movies WHERE id = ?",
      [req.params.id],
      (err, result) => {
        if (!err) {
          res.redirect(`/`);
          console.log(result);
        } else {
          console.log(err);
        }
      }
    );
  },

  updateEntry: function (req, res) {
    const entry = {
      name: req.body.updateTitle,
      year: req.body.updateYear,
      rank: req.body.updateRate,
    };

    db.query("UPDATE movies SET ? WHERE id=?", entry, [req.body.movieID], (err, result2) => {
      if (!err) {
        console.log(result2);
      } else {
        console.log(err);
      }
    });
  },
};

module.exports = controller;
