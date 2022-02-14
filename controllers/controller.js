const mysql = require(`mysql`);
const db1 = require(`../models/db1.js`);
const db2 = require(`../models/db2.js`);
const db3 = require(`../models/db3.js`);

const controller = {
  // Open index.hbs with movies
  getIndex: function (req, res) {
    db1.query("SELECT * FROM movies ORDER BY id DESC", (err, movies) => {
      if (!err) {
        movies = movies.slice(0, 10);
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
    const addEntry = {
      id: req.body.movieID,
      name: req.body.movieTitle,
      year: req.body.changeYear,
      rank: req.body.movieRate,
    };

    const updateEntry = {
      name: req.body.movieTitle,
      year: req.body.changeYear,
      rank: req.body.movieRate,
    };

    const initYear = req.body.initYear;
    const changeYear = req.body.changeYear;

    let dbDest, dbSrc;

    if (changeYear < 1980) {
      dbDest = db2;
      dbSrc = db2;
    } else {
      dbDest = db3;
      dbSrc = db3;
    }

    if (initYear < 1980) {
      dbSrc = db2;
    } else {
      dbSrc = db3;
    }

    // update node 1 regardless
    db1.query(
      "UPDATE movies SET ? WHERE id=?",
      [updateEntry, req.body.movieID],
      (err, result2) => {
        if (!err) {
          console.log(result2);
        } else {
          console.log(err);
        }
      }
    );

    console.log("Change: " + changeYear)
    console.log("Init: " + initYear)
    // node changes
    if ((changeYear >= 1980 && initYear < 1980) || (changeYear < 1980 && initYear >= 1980)) {
      console.log("CHANGED")
      // put in destination
      dbDest.query("INSERT INTO movies SET ?", addEntry, (err, result2) => {
        if (!err) {
          console.log(result2);
        } else {
          console.log(err);
        }
      });

      // delete from source
      dbSrc.query(
        "DELETE FROM movies WHERE id = ?",
        [req.body.movieID],
        (err, result) => {
          if (!err) {
            res.redirect(`/`);
            console.log(result);
          } else {
            console.log(err);
          }
        }
      );
    }
    // no changing of nodes required
    else {
      console.log("NO CHANGE")
      dbDest.query(
        "UPDATE movies SET ? WHERE id=?",
        [updateEntry, req.body.movieID],
        (err, result2) => {
          if (!err) {
            console.log(result2);
          } else {
            console.log(err);
          }
        }
      );
    }
  },
};

module.exports = controller;
