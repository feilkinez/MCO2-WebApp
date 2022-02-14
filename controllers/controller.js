const mysql = require(`mysql`);
const db1 = require(`../models/db1.js`);
const db2 = require(`../models/db2.js`);
const db3 = require(`../models/db3.js`);

const controller = {
  // Open index.hbs with movies
  getIndex: function (req, res) {
    db1.query("SELECT * FROM movies ORDER BY id DESC", (err, movies) => {
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
    db1.query("SELECT MAX(id) AS maxID FROM movies", (err, result1) => {
      if (!err) {
        res.send(result1);
        const maxID = result1[0].maxID + 1;

        const entry = {
          id: maxID,
          name: req.body.movieTitle,
          year: req.body.movieYear,
          rank: req.body.movieRate,
        };

        let dbConn;

        if (entry.year < 1980) {
          dbConn = db2;
        } else {
          dbConn = db3;
        }

        db1.query("INSERT INTO movies SET ?", entry, (err, result2) => {
          if (!err) {
            console.log(result2);
          } else {
            console.log(err);
          }
        });

        dbConn.query("INSERT INTO movies SET ?", entry, (err, result2) => {
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
    let dbConn;

    if (req.params.year < 1980) {
      dbConn = db2;
    } else {
      dbConn = db3;
    }

    db1.query(
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

    dbConn.query(
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
      name: req.body.movieTitle,
      year: req.body.movieYear,
      rank: req.body.movieRate,
    };

    let dbConn;

    if (entry.year < 1980) {
      dbConn = db2;
    } else {
      dbConn = db3;
    }

    db1.query(
      "UPDATE movies SET ? WHERE id=?",
      [entry, req.body.movieID],
      (err, result2) => {
        if (!err) {
          console.log(result2);
        } else {
          console.log(err);
        }
      }
    );

    dbConn.query(
      "UPDATE movies SET ? WHERE id=?",
      [entry, req.body.movieID],
      (err, result2) => {
        if (!err) {
          console.log(result2);
        } else {
          console.log(err);
        }
      }
    );
  },
};

module.exports = controller;
