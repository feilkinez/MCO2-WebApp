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

  // // adds entry to db
  // addEntry: async function (req, res) {
  //   // select max id first
  //   await new Promise((resolve) => {
  //     db.query("SELECT MAX(id) AS maxID FROM movies", (err1, result1) => {
  //       if (!err1) {
  //         // res.send(result1);
  //         const maxID = result1[0].maxID + 1;

  //         const entry = {
  //           id: maxID,
  //           name: req.body.movieTitle,
  //           year: req.body.movieYear,
  //           rank: req.body.movieRate,
  //         };

  //         db.query("INSERT INTO movies SET ?", entry, (err2, result2) => {
  //           if (!err2) {
  //             res.redirect(`/`);
  //             console.log(result2);
  //             console.log("PART2");
  //           } else {
  //             console.log(err2);
  //           }
  //         });
  //       } else {
  //         console.log(err1);
  //       }
  //       resolve();
  //     });
  //   });
  // },

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
};

module.exports = controller;
