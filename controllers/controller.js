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
        db2.query("SELECT * FROM movies", (err, movies1) => {
          if (!err) {
            db3.query("SELECT * FROM movies", (err, movies2) => {
              if (!err) {
                let movies = movies1.concat(movies2);
                movies.sort(function (a, b) {
                  var id_a = a.id;
                  var id_b = b.id;

                  if (id_a < id_b) {
                    return 1;
                  }
                  if (id_a > id_b) {
                    return -1;
                  }
                  return 0;
                });
                movies = movies.slice(0, 10);
                res.render(`index`, { movies });
              }
            });
          }
        });
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

        let dbConn, targetNode, loggerNode;

        if (entry.year < 1980) {
          dbConn = db2;
          targetNode = "2";
          loggerNode = "logger_n2";
        } else {
          dbConn = db3;
          targetNode = "3";
          loggerNode = "logger_n3";
        }

        db1.query("INSERT INTO movies SET ?", entry, (err, result2) => {
          if (!err) {
            console.log(result2);
          } else {
            console.log(err);
          }
        });

        db1.query(
          "SELECT MAX(log_id) AS maxID FROM logger_n1",
          (err, result) => {
            if (!err) {
              const maxLogID1 = result[0].maxID + 1;

              // log for node 1
              const log1 = {
                log_id: maxLogID1,
                target_node: targetNode,
                operation: "INSERT",
                change_node: 0,
                is_replicated_n2: 0,
                is_replicated_n3: 0,
                data_id: entry.id,
                data_name: entry.name,
                data_year: entry.year,
                data_rank: entry.rank,
              };

              db1.query("INSERT INTO logger_n1 SET ?", log1, (err, result2) => {
                if (!err) {
                  console.log(result2);
                } else {
                  console.log(err);
                }
              });

              dbConn.query(
                "SELECT MAX(log_id) AS maxID FROM " + loggerNode,
                (err, result) => {
                  if (!err) {
                    const maxLogIDConn = result[0].maxID + 1;

                    // log for dbConn node
                    const logdbConn = {
                      log_id: maxLogIDConn,
                      target_node: targetNode,
                      operation: "INSERT",
                      change_node: 0,
                      is_replicated: 1,
                      data_id: entry.id,
                      data_name: entry.name,
                      data_year: entry.year,
                      data_rank: entry.rank,
                    };

                    dbConn.query(
                      "INSERT INTO movies SET ?",
                      entry,
                      (err, result2) => {
                        if (!err) {
                          console.log(result2);
                          console.log("node logging successful");
                          let query = "INSERT INTO " + loggerNode + " SET ?";
                          dbConn.query(query, logdbConn, (err, result2) => {
                            if (!err) {
                              let updateLog;

                              if (entry.year < 1980) {
                                updateLog = {
                                  target_node: targetNode,
                                  operation: "INSERT",
                                  change_node: 0,
                                  is_replicated_n2: 1,
                                  is_replicated_n3: 0,
                                  data_id: entry.id,
                                  data_name: entry.name,
                                  data_year: entry.year,
                                  data_rank: entry.rank,
                                };
                              } else {
                                updateLog = {
                                  target_node: targetNode,
                                  operation: "INSERT",
                                  change_node: 0,
                                  is_replicated_n2: 0,
                                  is_replicated_n3: 1,
                                  data_id: entry.id,
                                  data_name: entry.name,
                                  data_year: entry.year,
                                  data_rank: entry.rank,
                                };
                              }

                              console.log(result2);
                              db1.query(
                                "UPDATE logger_n1 SET ? WHERE log_id=?",
                                [updateLog, log1.log_id],
                                (err, result2) => {
                                  if (!err) {
                                    console.log(result2);
                                  } else {
                                    console.log(err);
                                  }
                                }
                              );
                            } else {
                              console.log(err);
                            }
                          });
                        } else {
                          console.log(err);
                        }
                      }
                    );
                  } else {
                    console.log(err);
                  }
                }
              );
            } else {
              console.log(err);
            }
          }
        );
      } else {
        const inputYear = req.body.movieYear;

        let dbConn, targetNode, loggerNode;

        // node 2
        if (inputYear < 1980) {
          dbConn = db2;
          targetNode = "2";
          loggerNode = "logger_n2";
        } else {
          dbConn = db3;
          targetNode = "3";
          loggerNode = "logger_n3";
        }

        dbConn.query("SELECT MAX(id) as maxID FROM movies", (err, result) => {
          if (!err) {
            const maxID = result[0].maxID + 1;

            const entry = {
              name: req.body.movieTitle,
              year: req.body.movieYear,
              rank: req.body.movieRate,
            };
          }
        });
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

    // node changes
    if (
      (changeYear >= 1980 && initYear < 1980) ||
      (changeYear < 1980 && initYear >= 1980)
    ) {
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
