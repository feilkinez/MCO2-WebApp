const db1 = require(`../models/db1.js`);
const db2 = require(`../models/db2.js`);
const db3 = require(`../models/db3.js`);

// CHECK DB2 LOG AND UPDATE
function checkDb2Log() {
  // CHECKS IF DB2 IS ONLINE
  db2.query("SELECT MAX(id) AS maxID FROM movies", (err, result) => {
    if (!err) {
      // DB2 IS ONLINE
      // CHECK NODE 1 LOG
      db1.query(
        "SELECT * from logger_n1 WHERE is_replicated_n2 = 0",
        (err, result) => {
          if (!err) {
            // DB1 IS ONLINE
            result.forEach(function (r, index) {
              var itemsProcessed = 0;

              setTimeout(() => {
                const entry = {
                  id: r.data_id,
                  name: r.data_name,
                  year: r.data_year,
                  rank: r.data_rank,
                };
                // IF LOG OPERATION IS INSERT
                if (r.operation == "INSERT") {
                  if (r.target_node == "2") {
                    // IF TARGET IS NODE 2
                    // INSERT DATA TO DB2
                    db2.query(
                      "INSERT INTO movies SET ?",
                      entry,
                      (err, result) => {
                        if (!err) {
                          const updateLog = {
                            target_node: r.target_node,
                            operation: r.operation,
                            change_node: r.change_node,
                            is_replicated_n2: 1,
                            is_replicated_n3: r.is_replicated_n3,
                            data_id: entry.id,
                            data_name: entry.name,
                            data_year: entry.year,
                            data_rank: entry.rank,
                          };

                          // UPDATE IS_REPLICATED VALUE FOR LOGS
                          db1.query(
                            "UPDATE logger_n1 SET ? WHERE log_id = ?",
                            [updateLog, r.log_id],
                            (err, result) => {
                              if (!err) {
                                db2.query(
                                  "SELECT MAX(log_id) AS maxID FROM logger_n2",
                                  (err, result) => {
                                    if (!err) {
                                      // INSERT DB2 LOGGER

                                      const maxLogID1 = result[0].maxID + 1;
                                      const db2Log = {
                                        log_id: maxLogID1,
                                        target_node: r.target_node,
                                        operation: r.operation,
                                        change_node: r.change_node,
                                        is_replicated: 1,
                                        data_id: entry.id,
                                        data_name: entry.name,
                                        data_year: entry.year,
                                        data_rank: entry.rank,
                                      };

                                      db2.query(
                                        "INSERT INTO logger_n2 SET ?",
                                        db2Log,
                                        (err, result) => {
                                          if (!err) {
                                            console.log(
                                              "Log entry has reflected in db2"
                                            );
                                            checkDb3Log();
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
                          console.log(err);
                        }
                      }
                    );
                  } else {
                    // IF TARGET IS NOT NODE 2
                    // UPDATE IS_REPLICATED VALUE FOR LOGS
                    const updateLog = {
                      target_node: r.target_node,
                      operation: r.operation,
                      change_node: r.change_node,
                      is_replicated_n2: 1,
                      is_replicated_n3: r.is_replicated_n3,
                      data_id: entry.id,
                      data_name: entry.name,
                      data_year: entry.year,
                      data_rank: entry.rank,
                    };

                    // UPDATE NODE 1 LOG
                    db1.query(
                      "UPDATE logger_n1 SET ? WHERE log_id = ?",
                      [updateLog, r.log_id],
                      (err, result) => {
                        if (!err) {
                          console.log(
                            "DB2 updated Node 1 Log log_id: " + r.log_id
                          );
                        } else {
                          console.log(err);
                        }
                      }
                    );
                  }
                }
                // IF LOG OPERATION IS DELETE
                else if (r.operation == "DELETE") {
                  if (r.target_node == "2") {
                    // DELETE FROM DB2
                    db2.query(
                      "DELETE FROM movies WHERE id = ?",
                      [entry.id],
                      (err, result) => {
                        if (!err) {
                          if (!err) {
                            const updateLog = {
                              target_node: r.target_node,
                              operation: r.operation,
                              change_node: r.change_node,
                              is_replicated_n2: 1,
                              is_replicated_n3: r.is_replicated_n3,
                              data_id: entry.id,
                              data_name: entry.name,
                              data_year: entry.year,
                              data_rank: entry.rank,
                            };

                            // UPDATE IS_REPLICATED VALUE FOR LOGS
                            db1.query(
                              "UPDATE logger_n1 SET ? WHERE log_id = ?",
                              [updateLog, r.log_id],
                              (err, result) => {
                                if (!err) {
                                  db2.query(
                                    "SELECT MAX(log_id) AS maxID FROM logger_n2",
                                    (err, result) => {
                                      if (!err) {
                                        const maxLogID1 = result[0].maxID + 1;
                                        const db2Log = {
                                          log_id: maxLogID1,
                                          target_node: r.target_node,
                                          operation: r.operation,
                                          change_node: r.change_node,
                                          is_replicated: 1,
                                          data_id: entry.id,
                                          data_name: entry.name,
                                          data_year: entry.year,
                                          data_rank: entry.rank,
                                        };
                                        // INSERT TO DB2 LOGGER
                                        db2.query(
                                          "INSERT INTO logger_n2 SET ?",
                                          db2Log,
                                          (err, result) => {
                                            if (!err) {
                                              console.log(
                                                "Log entry has reflected in db2"
                                              );
                                              checkDb3Log();
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
                          }
                        } else {
                          console.log(err);
                        }
                      }
                    );
                  } else {
                    // IF TARGET IS NOT NODE 2
                    const updateLog = {
                      target_node: r.target_node,
                      operation: r.operation,
                      change_node: r.change_node,
                      is_replicated_n2: 1,
                      is_replicated_n3: r.is_replicated_n3,
                      data_id: entry.id,
                      data_name: entry.name,
                      data_year: entry.year,
                      data_rank: entry.rank,
                    };

                    // UPDATE IS_REPLICATED VALUE FOR LOGS
                    db1.query(
                      "UPDATE logger_n1 SET ? WHERE log_id = ?",
                      [updateLog, r.log_id],
                      (err, result) => {
                        if (!err) {
                          console.log("DB1 UPDATE LOG READ");
                        } else {
                          console.log(err);
                        }
                      }
                    );
                  }
                }
                // IF LOG OPERATION IS UPDATE
                else {
                  if (r.changeNode == 0) {
                    // NO TRANSFER UPDATE
                    if (r.target_node == "2") {
                      // UPDATE DB2
                      db2.query(
                        "UPDATE movies SET ? WHERE id = ?",
                        [entry, r.id],
                        (err, result) => {
                          if (!err) {
                            const updateLog = {
                              target_node: r.target_node,
                              operation: r.operation,
                              change_node: r.change_node,
                              is_replicated_n2: 1,
                              is_replicated_n3: r.is_replicated_n3,
                              data_id: entry.id,
                              data_name: entry.name,
                              data_year: entry.year,
                              data_rank: entry.rank,
                            };

                            // UPDATE IS_REPLICATED VALUE FOR LOGS1
                            db1.query(
                              "UPDATE logger_n1 SET ? WHERE log_id = ?",
                              [updateLog, r.log_id],
                              (err, result) => {
                                if (!err) {
                                  db2.query(
                                    "SELECT MAX(log_id) FROM logger_n2",
                                    (err, result) => {
                                      if (!err) {
                                        const maxLogID1 = result[0].maxID + 1;
                                        const db2Log = {
                                          log_id: maxLogID1,
                                          target_node: r.target_node,
                                          operation: r.operation,
                                          change_node: r.change_node,
                                          is_replicated: 1,
                                          data_id: entry.id,
                                          data_name: entry.name,
                                          data_year: entry.year,
                                          data_rank: entry.rank,
                                        };
                                        // INSERT INTO DB2 LOGGER
                                        db2.query(
                                          "INSERT INTO logger_n2 SET ?",
                                          db2Log,
                                          (err, result) => {
                                            if (!err) {
                                              console.log(
                                                "Log entry has reflected in db2"
                                              );
                                              checkDb3Log();
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
                            console.log(err);
                          }
                        }
                      );
                    } else {
                      // IF TARGET IS NOT NODE 2
                      // UPDATE IS_REPLICATED VALUE FOR LOGS
                      const updateLog = {
                        target_node: r.target_node,
                        operation: r.operation,
                        change_node: r.change_node,
                        is_replicated_n2: 1,
                        is_replicated_n3: r.is_replicated_n3,
                        data_id: entry.id,
                        data_name: entry.name,
                        data_year: entry.year,
                        data_rank: entry.rank,
                      };

                      // UPDATE NODE 1 LOG
                      db1.query(
                        "UPDATE logger_n1 SET ? WHERE log_id = ?",
                        [updateLog, r.log_id],
                        (err, result) => {
                          if (!err) {
                            console.log(
                              "DB2 updated Node 1 Log log_id: " + r.log_id
                            );
                          } else {
                            console.log(err);
                          }
                        }
                      );
                    }
                  } else {
                    // TRANSFER NEEDED
                    if (r.target_node == "2") {
                      // INSERT TO N2 (& DELETE FROM N3 - TO BE DONE IN A DIFFERENT LOG CHECK)
                      // INSERT DATA TO NODE 2
                      db2.query(
                        "INSERT INTO movies SET ? WHERE id = ?",
                        [entry, r.id],
                        (err, result) => {
                          if (!err) {
                            const updateLog = {
                              target_node: r.target_node,
                              operation: r.operation,
                              change_node: r.change_node,
                              is_replicated_n2: 1,
                              is_replicated_n3: r.is_replicated_n3,
                              data_id: entry.id,
                              data_name: entry.name,
                              data_year: entry.year,
                              data_rank: entry.rank,
                            };
                            // UPDATE IS_REPLICATED DATA IN DB1
                            db1.query(
                              "UPDATE logger_n1 SET ? WHERE log_id = ?",
                              [updateLog, r.log_id],
                              (err, result) => {
                                if (!err) {
                                  db2.query(
                                    "SELECT MAX(log_id) AS maxID FROM logger_n2",
                                    (err, result) => {
                                      if (!err) {
                                        const maxLogID1 = result[0].maxID + 1;
                                        const db2Log = {
                                          log_id: maxLogID1,
                                          target_node: r.target_node,
                                          operation: r.operation,
                                          change_node: r.change_node,
                                          is_replicated: 1,
                                          data_id: entry.id,
                                          data_name: entry.name,
                                          data_year: entry.year,
                                          data_rank: entry.rank,
                                        };

                                        // INSERT TO DB2 LOGGER
                                        db2.query(
                                          "INSERT INTO logger_n2 SET ?",
                                          db2Log,
                                          (err, result) => {
                                            if (!err) {
                                              console.log("DB2 UPDATE LOGGED");
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
                            console.log(err);
                          }
                        }
                      );
                    } else {
                      // DELETE FROM N2 (& INSERT TO N3 - TO BE DONE IN A DIFFERENT LOG CHECK)

                      // DELETE FROM N2
                      db2.query(
                        "DELETE FROM movies WHERE id = ?",
                        [entry.id],
                        (err, result) => {
                          if (!err) {
                            // UPDATE TO LOGGER 1
                            const updateLog = {
                              target_node: r.target_node,
                              operation: r.operation,
                              change_node: r.change_node,
                              is_replicated_n2: 1,
                              is_replicated_n3: r.is_replicated_n3,
                              data_id: entry.id,
                              data_name: entry.name,
                              data_year: entry.year,
                              data_rank: entry.rank,
                            };

                            db1.query(
                              "UPDATE logger_n1 SET ? WHERE log_id = ?",
                              [updateLog, r.log_id],
                              (err, result) => {
                                if (!err) {
                                  db2.query(
                                    "SELECT MAX(log_id) FROM logger_n2",
                                    (err, result) => {
                                      if (!err) {
                                        const maxLogID1 = result[0].maxID + 1;
                                        const db2Log = {
                                          log_id: maxLogID1,
                                          target_node: r.target_node,
                                          operation: r.operation,
                                          change_node: r.change_node,
                                          is_replicated: 1,
                                          data_id: entry.id,
                                          data_name: entry.name,
                                          data_year: entry.year,
                                          data_rank: entry.rank,
                                        };

                                        // INSERT TO LOGGER 2
                                        db2.query(
                                          "INSERT INTO logger_n2 SET ?",
                                          db2Log,
                                          (err, result) => {
                                            if (!err) {
                                              // CHECK IF DB3 IS ONLINE
                                              db3.query(
                                                "SELECT MAX(log_id) from logger_n3",
                                                (err, result) => {
                                                  if (!err) {
                                                    // INSERT LOG TO DB3
                                                    const maxLogID1 =
                                                      result[0].maxID + 1;
                                                    const db3Log = {
                                                      log_id: maxLogID1,
                                                      target_node:
                                                        r.target_node,
                                                      operation: r.operation,
                                                      change_node:
                                                        r.change_node,
                                                      is_replicated: 1,
                                                      data_id: entry.id,
                                                      data_name: entry.name,
                                                      data_year: entry.year,
                                                      data_rank: entry.rank,
                                                    };

                                                    db3.query(
                                                      "INSERT INTO logger_n3 SET ?",
                                                      db3Log,
                                                      (err, result) => {
                                                        if (!err) {
                                                          console.log(
                                                            "Transfer from Node 2 to Node 3 complete"
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
                            console.log(err);
                          }
                        }
                      );
                    }
                  }
                }

                itemsProcessed++;
                if (itemsProcessed === result.length) {
                  checkDb3Log(); // MOVE ON TO UPDATING DB3 LOG
                }
              }, 500);
            });
          } else {
            // DB1 IS OFFLINE
            console.log("Node 1 is idle");
            checkDb3Log();
          }
        }
      );
    } else {
      // DB2 IS OFFLINE
      console.log("Node 2 is idle");
      checkDb3Log();
    }
  });
}

// CHECK DB3 LOG AND UPDATE
function checkDb3Log() {
  // CHECKS IF DB3 IS ONLINE
  db3.query("SELECT MAX(id) AS maxID FROM movies", (err, result) => {
    if (!err) {
      // DB3 IS ONLINE
      // CHECK NODE 1 LOG
      db1.query(
        "SELECT * from logger_n1 WHERE is_replicated_n3 = 0",
        (err, result) => {
          if (!err) {
            // DB1 IS ONLINE
            result.forEach(function (r, index) {
              setTimeout(() => {
                const entry = {
                  id: r.data_id,
                  name: r.data_name,
                  year: r.data_year,
                  rank: r.data_rank,
                };
                // IF LOG OPERATION IS INSERT
                if (r.operation == "INSERT") {
                  if (r.target_node == "3") {
                    // IF TARGET IS NODE 3
                    // INSERT DATA TO DB3
                    db3.query(
                      "INSERT INTO movies SET ?",
                      entry,
                      (err, result) => {
                        if (!err) {
                          const updateLog = {
                            target_node: r.target_node,
                            operation: r.operation,
                            change_node: r.change_node,
                            is_replicated_n2: r.is_replicated_n2,
                            is_replicated_n3: 1,
                            data_id: entry.id,
                            data_name: entry.name,
                            data_year: entry.year,
                            data_rank: entry.rank,
                          };

                          // UPDATE IS_REPLICATED VALUE FOR LOGS
                          db1.query(
                            "UPDATE logger_n1 SET ? WHERE log_id = ?",
                            [updateLog, r.log_id],
                            (err, result) => {
                              if (!err) {
                                db3.query(
                                  "SELECT MAX(log_id) AS maxID FROM logger_n3",
                                  (err, result) => {
                                    if (!err) {
                                      // INSERT DB3 LOGGER
                                      const maxLogID1 = result[0].maxID + 1;
                                      const db3Log = {
                                        log_id: maxLogID1,
                                        target_node: r.target_node,
                                        operation: r.operation,
                                        change_node: r.change_node,
                                        is_replicated: 1,
                                        data_id: entry.id,
                                        data_name: entry.name,
                                        data_year: entry.year,
                                        data_rank: entry.rank,
                                      };

                                      db3.query(
                                        "INSERT INTO logger_n3 SET ?",
                                        db3Log,
                                        (err, result) => {
                                          if (!err) {
                                            console.log(
                                              "Log entry has reflected in db3"
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
                    // IF TARGET IS NOT NODE 3
                    // UPDATE IS_REPLICATED VALUE FOR LOGS
                    const updateLog = {
                      target_node: r.target_node,
                      operation: r.operation,
                      change_node: r.change_node,
                      is_replicated_n2: r.is_replicated_n2,
                      is_replicated_n3: 1,
                      data_id: entry.id,
                      data_name: entry.name,
                      data_year: entry.year,
                      data_rank: entry.rank,
                    };

                    // UPDATE NODE 1 LOG
                    db1.query(
                      "UPDATE logger_n1 SET ? WHERE log_id = ?",
                      [updateLog, r.log_id],
                      (err, result) => {
                        if (!err) {
                          console.log(
                            "DB3 updated Node 1 Log log_id: " + r.log_id
                          );
                        } else {
                          console.log(err);
                        }
                      }
                    );
                  }
                }
                // IF LOG OPERATION IS DELETE
                else if (r.operation == "DELETE") {
                  if (r.target_node == "3") {
                    // DELETE FROM DB3
                    db3.query(
                      "DELETE FROM movies WHERE id = ?",
                      [entry.id],
                      (err, result) => {
                        if (!err) {
                          if (!err) {
                            const updateLog = {
                              target_node: r.target_node,
                              operation: r.operation,
                              change_node: r.change_node,
                              is_replicated_n2: r.is_replicated_n2,
                              is_replicated_n3: 1,
                              data_id: entry.id,
                              data_name: entry.name,
                              data_year: entry.year,
                              data_rank: entry.rank,
                            };

                            // UPDATE IS_REPLICATED VALUE FOR LOGS
                            db1.query(
                              "UPDATE logger_n1 SET ? WHERE log_id = ?",
                              [updateLog, r.log_id],
                              (err, result) => {
                                if (!err) {
                                  db3.query(
                                    "SELECT MAX(log_id) AS maxID FROM logger_n3",
                                    (err, result) => {
                                      if (!err) {
                                        const maxLogID1 = result[0].maxID + 1;
                                        const db3Log = {
                                          log_id: maxLogID1,
                                          target_node: r.target_node,
                                          operation: r.operation,
                                          change_node: r.change_node,
                                          is_replicated: 1,
                                          data_id: entry.id,
                                          data_name: entry.name,
                                          data_year: entry.year,
                                          data_rank: entry.rank,
                                        };
                                        // INSERT TO DB3 LOGGER
                                        db3.query(
                                          "INSERT INTO logger_n3 SET ?",
                                          db3Log,
                                          (err, result) => {
                                            if (!err) {
                                              console.log(
                                                "Log entry has reflected in db3"
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
                                  console.log(err);
                                }
                              }
                            );
                          }
                        } else {
                          console.log(err);
                        }
                      }
                    );
                  } else {
                    // IF TARGET IS NOT NODE 3
                    const updateLog = {
                      target_node: r.target_node,
                      operation: r.operation,
                      change_node: r.change_node,
                      is_replicated_n2: r.is_replicated_n2,
                      is_replicated_n3: 1,
                      data_id: entry.id,
                      data_name: entry.name,
                      data_year: entry.year,
                      data_rank: entry.rank,
                    };

                    // UPDATE IS_REPLICATED VALUE FOR LOGS
                    db1.query(
                      "UPDATE logger_n1 SET ? WHERE log_id = ?",
                      [updateLog, r.log_id],
                      (err, result) => {
                        if (!err) {
                          console.log("DB1 log updated log_id: " + r.log_id);
                        } else {
                          console.log(err);
                        }
                      }
                    );
                  }
                }
                // IF LOG OPERATION IS UPDATE
                else {
                  if (r.change_node == 0) {
                    // NO TRANSFER UPDATE
                    if (r.target_node == "3") {
                      // UPDATE DB3
                      db3.query(
                        "UPDATE movies SET ? WHERE id = ?",
                        [entry, r.id],
                        (err, result) => {
                          if (!err) {
                            const updateLog = {
                              target_node: r.targetNode,
                              operation: r.operation,
                              change_node: r.change_node,
                              is_replicated_n2: r.is_replicated_n2,
                              is_replicated_n3: 1,
                              data_id: entry.id,
                              data_name: entry.name,
                              data_year: entry.year,
                              data_rank: entry.rank,
                            };

                            // UPDATE IS_REPLICATED VALUE FOR LOGS1
                            db1.query(
                              "UPDATE logger_n1 SET ? WHERE log_id = ?",
                              [updateLog, r.log_id],
                              (err, result) => {
                                if (!err) {
                                  db3.query(
                                    "SELECT MAX(log_id) FROM logger_n3",
                                    (err, result) => {
                                      if (!err) {
                                        const maxLogID1 = result[0].maxID + 1;
                                        const db3Log = {
                                          log_id: maxLogID1,
                                          target_node: r.target_node,
                                          operation: r.operation,
                                          change_node: r.change_node,
                                          is_replicated: 1,
                                          data_id: entry.id,
                                          data_name: entry.name,
                                          data_year: entry.year,
                                          data_rank: entry.rank,
                                        };
                                        // INSERT INTO DB3 LOGGER
                                        db3.query(
                                          "INSERT INTO logger_n3 SET ?",
                                          db3Log,
                                          (err, result) => {
                                            if (!err) {
                                              console.log(
                                                "Log entry has reflected in db3"
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
                      // IF TARGET IS NOT NODE 3
                      // UPDATE IS_REPLICATED VALUE FOR LOGS
                      const updateLog = {
                        target_node: r.target_node,
                        operation: r.operation,
                        change_node: r.change_node,
                        is_replicated_n2: r.is_replicated_n2,
                        is_replicated_n3: 1,
                        data_id: entry.id,
                        data_name: entry.name,
                        data_year: entry.year,
                        data_rank: entry.rank,
                      };

                      // UPDATE NODE 1 LOG
                      db1.query(
                        "UPDATE logger_n1 SET ? WHERE log_id = ?",
                        [updateLog, r.log_id],
                        (err, result) => {
                          if (!err) {
                            console.log(
                              "DB3 updated Node 1 Log log_id: " + r.log_id
                            );
                          } else {
                            console.log(err);
                          }
                        }
                      );
                    }
                  } else {
                    // TRANSFER NEEDED
                    if (r.target_node == "3") {
                      // INSERT TO N3 (& DELETE FROM N2 - TO BE DONE IN A DIFFERENT LOG CHECK)
                      // INSERT DATA TO NODE 3
                      db3.query(
                        "INSERT INTO movies SET ? WHERE id = ?",
                        [entry, r.id],
                        (err, result) => {
                          if (!err) {
                            const updateLog = {
                              target_node: r.target_node,
                              operation: r.operation,
                              change_node: r.change_node,
                              is_replicated_n2: r.is_replicated_n2,
                              is_replicated_n3: 1,
                              data_id: entry.id,
                              data_name: entry.name,
                              data_year: entry.year,
                              data_rank: entry.rank,
                            };
                            // UPDATE IS_REPLICATED DATA IN DB1
                            db1.query(
                              "UPDATE logger_n1 SET ? WHERE log_id = ?",
                              [updateLog, r.log_id],
                              (err, result) => {
                                if (!err) {
                                  db3.query(
                                    "SELECT MAX(log_id) AS maxID FROM logger_n3",
                                    (err, result) => {
                                      if (!err) {
                                        const maxLogID1 = result[0].maxID + 1;
                                        const db3Log = {
                                          log_id: maxLogID1,
                                          target_node: r.target_node,
                                          operation: r.operation,
                                          change_node: r.change_node,
                                          is_replicated: 1,
                                          data_id: entry.id,
                                          data_name: entry.name,
                                          data_year: entry.year,
                                          data_rank: entry.rank,
                                        };

                                        // INSERT TO DB3 LOGGER
                                        db3.query(
                                          "INSERT INTO logger_n3 SET ?",
                                          db3Log,
                                          (err, result) => {
                                            if (!err) {
                                              console.log("DB3 UPDATE LOGGED");
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
                            console.log(err);
                          }
                        }
                      );
                    } else {
                      // DELETE FROM N3 (& INSERT TO N2 - TO BE DONE IN A DIFFERENT LOG CHECK)

                      // DELETE FROM N3
                      db3.query(
                        "DELETE FROM movies WHERE id = ?",
                        [entry.id],
                        (err, result) => {
                          if (!err) {
                            // UPDATE TO LOGGER 1
                            const updateLog = {
                              target_node: r.target_node,
                              operation: r.operation,
                              change_node: r.change_node,
                              is_replicated_n2: r.is_replicated_n2,
                              is_replicated_n3: 1,
                              data_id: entry.id,
                              data_name: entry.name,
                              data_year: entry.year,
                              data_rank: entry.rank,
                            };

                            db1.query(
                              "UPDATE logger_n1 SET ? WHERE log_id = ?",
                              [updateLog, r.log_id],
                              (err, result) => {
                                if (!err) {
                                  db3.query(
                                    "SELECT MAX(log_id) FROM logger_n3",
                                    (err, result) => {
                                      if (!err) {
                                        const maxLogID1 = result[0].maxID + 1;
                                        const db3Log = {
                                          log_id: maxLogID1,
                                          target_node: r.target_node,
                                          operation: r.operation,
                                          change_node: r.change_node,
                                          is_replicated: 1,
                                          data_id: entry.id,
                                          data_name: entry.name,
                                          data_year: entry.year,
                                          data_rank: entry.rank,
                                        };

                                        // INSERT TO LOGGER 3
                                        db3.query(
                                          "INSERT INTO logger_n3 SET ?",
                                          db3Log,
                                          (err, result) => {
                                            if (!err) {
                                              // CHECK IF DB2 IS ONLINE
                                              db2.query(
                                                "SELECT MAX(log_id) from logger_n2",
                                                (err, result) => {
                                                  if (!err) {
                                                    // INSERT LOG TO DB2
                                                    const maxLogID1 =
                                                      result[0].maxID + 1;
                                                    const db2Log = {
                                                      log_id: maxLogID1,
                                                      target_node:
                                                        r.target_node,
                                                      operation: r.operation,
                                                      change_node:
                                                        r.change_node,
                                                      is_replicated: 1,
                                                      data_id: entry.id,
                                                      data_name: entry.name,
                                                      data_year: entry.year,
                                                      data_rank: entry.rank,
                                                    };

                                                    db2.query(
                                                      "INSERT INTO logger_n2 SET ?",
                                                      db2Log,
                                                      (err, result) => {
                                                        if (!err) {
                                                          console.log(
                                                            "Transfer from Node 3 to Node 2 complete"
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
                            console.log(err);
                          }
                        }
                      );
                    }
                  }
                }
              }, 500);
            });
          } else {
            // DB1 IS OFFLINE
            console.log("Node 1 is idle");
          }
        }
      );
    } else {
      // DB3 IS OFFLINE
      console.log("Node 3 is idle");
    }
  });
}

// LOADS INDEX PAGE
function loadIndexPage(res) {
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
}

const controller = {
  // Open index.hbs with movies
  getIndex: function (req, res) {
    // CHECK DB1 LOG AND UPDATE
    // CHECKS IF DB1 IS ONLINE
    db1.query("SELECT MAX(id) AS maxID FROM movies", (err, result) => {
      if (!err) {
        // DB1 IS ONLINE
        // CHECK NODE 2 LOG
        db2.query(
          "SELECT * from logger_n2 WHERE is_replicated = 0",
          (err, result) => {
            if (!err) {
              // DB2 IS ONLINE
              setTimeout(() => {
                result.forEach(function (r, index) {
                  const entry = {
                    id: r.data_id,
                    name: r.data_name,
                    year: r.data_year,
                    rank: r.data_rank,
                  };

                  if (r.operation == "INSERT") {
                    db1.query(
                      "INSERT INTO movies SET ?",
                      entry,
                      (err, result) => {
                        if (!err) {
                          db1.query(
                            "SELECT MAX(log_id) AS maxID FROM logger_n1",
                            (err, result) => {
                              if (!err) {
                                const maxLogID1 = result[0].maxID + 1;

                                const addLog = {
                                  log_id: maxLogID1,
                                  target_node: r.target_node,
                                  operation: r.operation,
                                  change_node: r.change_node,
                                  is_replicated_n2: 1,
                                  is_replicated_n3: 0,
                                  data_id: entry.id,
                                  data_name: entry.name,
                                  data_year: entry.year,
                                  data_rank: entry.rank,
                                };

                                db1.query(
                                  "INSERT INTO logger_n1 SET ?",
                                  addLog,
                                  (err, result) => {
                                    if (!err) {
                                      const updateLog = {
                                        target_node: r.target_node,
                                        operation: r.operation,
                                        change_node: 0,
                                        is_replicated: 1,
                                        data_id: entry.id,
                                        data_name: entry.name,
                                        data_year: entry.year,
                                        data_rank: entry.rank,
                                      };

                                      db2.query(
                                        "UPDATE logger_n2 SET ? WHERE log_id = ?",
                                        [updateLog, r.log_id],
                                        (err, result) => {
                                          if (!err) {
                                            console.log(result);
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
                          console.log(err);
                        }
                      }
                    );
                  } else if (r.operation == "DELETE") {
                    db1.query(
                      "DELETE FROM movies WHERE id = ?",
                      [entry.id],
                      (err, result) => {
                        if (!err) {
                          db1.query(
                            "SELECT MAX(log_id) as maxID FROM logger_n1",
                            (err, result) => {
                              if (!err) {
                                const maxLogID1 = result[0].maxID + 1;

                                const addLog = {
                                  log_id: maxLogID1,
                                  target_node: r.target_node,
                                  operation: r.operation,
                                  change_node: r.change_node,
                                  is_replicated_n2: 1,
                                  is_replicated_n3: 0,
                                  data_id: entry.id,
                                  data_name: entry.name,
                                  data_year: entry.year,
                                  data_rank: entry.rank,
                                };

                                db1.query(
                                  "INSERT INTO logger_n1 SET ?",
                                  addLog,
                                  (err, result) => {
                                    if (!err) {
                                      const updateLog = {
                                        target_node: r.target_node,
                                        operation: r.operation,
                                        change_node: r.change_node,
                                        is_replicated: 1,
                                        data_id: entry.id,
                                        data_name: entry.name,
                                        data_year: entry.year,
                                        data_rank: entry.rank,
                                      };

                                      db2.query(
                                        "UPDATE logger_n2 SET ? WHERE log_id = ?",
                                        [updateLog, r.log_id],
                                        (err, result) => {
                                          if (!err) {
                                            console.log(result);
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
                          console.log(err);
                        }
                      }
                    );
                  } else {
                    // UPDATE OPERATION
                    const updateEntry = {
                      name: entry.name,
                      year: entry.year,
                      rank: entry.rank,
                    };

                    // check change_node
                    // no change needed
                    if (r.change_node == 0) {
                      db1.query(
                        "UPDATE movies SET ? WHERE id = ?",
                        [updateEntry, entry.id],
                        (err, result) => {
                          if (!err) {
                            db1.query(
                              "SELECT MAX(log_id) as maxID FROM logger_n1",
                              (err, result) => {
                                if (!err) {
                                  const maxLogID1 = result[0].maxID + 1;

                                  const addLog = {
                                    log_id: maxLogID1,
                                    target_node: r.target_node,
                                    operation: r.operation,
                                    change_node: r.change_node,
                                    is_replicated_n2: 1,
                                    is_replicated_n3: 0,
                                    data_id: r.data_id,
                                    data_name: r.data_name,
                                    data_year: r.data_year,
                                    data_rank: r.data_rank,
                                  };

                                  db1.query(
                                    "INSERT INTO logger_n1 SET ?",
                                    addLog,
                                    (err, result) => {
                                      if (!err) {
                                        const updateLog = {
                                          target_node: r.target_node,
                                          operation: r.operation,
                                          change_node: r.change_node,
                                          is_replicated: 1,
                                          data_id: r.data_id,
                                          data_name: r.data_name,
                                          data_year: r.data_year,
                                          data_rank: r.data_rank,
                                        };

                                        db2.query(
                                          "UPDATE logger_n2 SET ? WHERE log_id = ?",
                                          [updateLog, r.log_id],
                                          (err, result) => {
                                            if (!err) {
                                              console.log(result);
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
                            console.log(err);
                          }
                        }
                      );
                    }
                    // change needed
                    else {
                      db1.query(
                        "UPDATE movies SET ? WHERE id = ?",
                        [updateEntry, entry.id],
                        (err, result) => {
                          if (!err) {
                            db1.query(
                              "SELECT MAX(log_id) AS maxID FROM logger_n1",
                              (err, result) => {
                                if (!err) {
                                  const maxLogID1 = result[0].maxID + 1;

                                  const addLog = {
                                    log_id: maxLogID1,
                                    target_node: r.target_node,
                                    operation: r.operation,
                                    change_node: r.change_node,
                                    is_replicated_n2: 1,
                                    is_replicated_n3: 0,
                                    data_id: entry.id,
                                    data_name: entry.name,
                                    data_year: entry.year,
                                    data_rank: entry.rank,
                                  };

                                  db1.query(
                                    "INSERT INTO logger_n1 SET ?",
                                    addLog,
                                    (err, result) => {
                                      if (!err) {
                                        const updateLog = {
                                          target_node: r.target_node,
                                          operation: r.operation,
                                          change_node: r.change_node,
                                          is_replicated: 1,
                                          data_id: entry.id,
                                          data_name: entry.name,
                                          data_year: entry.year,
                                          data_rank: entry.rank,
                                        };

                                        db2.query(
                                          "UPDATE logger_n2 SET ? WHERE log_id = ?",
                                          [updateLog, r.log_id],
                                          (err, result) => {
                                            if (!err) {
                                              const updateLog = {
                                                target_node: r.target_node,
                                                operation: r.operation,
                                                change_node: r.change_node,
                                                is_replicated: 1,
                                                data_id: entry.id,
                                                data_name: entry.name,
                                                data_year: entry.year,
                                                data_rank: entry.rank,
                                              };

                                              db3.query(
                                                "UPDATE logger_n3 SET ? WHERE `target_node` = ?, `operation` = ?, `change_node` = ?, `is_replicated` = 0, `data_id` = ?, `data_name` = ?, `data_year` = ?, `data_rank` = ?",
                                                [
                                                  updateLog,
                                                  r.target_node,
                                                  r.operation,
                                                  r.change_node,
                                                  entry.id,
                                                  entry.name,
                                                  entry.year,
                                                  entry.rank,
                                                ],
                                                (err, result) => {
                                                  if (!err) {
                                                    const updateLog1 = {
                                                      target_node:
                                                        r.target_node,
                                                      operation: r.operation,
                                                      change_node:
                                                        r.change_node,
                                                      is_replicated_n2: 1,
                                                      is_replicated_n3: 1,
                                                      data_id: entry.id,
                                                      data_name: entry.name,
                                                      data_year: entry.year,
                                                      data_rank: entry.rank,
                                                    };

                                                    db1.query(
                                                      "UPDATE logger_n1 SET ? WHERE log_id = ?",
                                                      [updateLog1, maxLogID1],
                                                      (err, result) => {
                                                        if (!err) {
                                                          console.log(result);
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
                    }
                  }
                });
              }, 500);
            } else {
              // DB2 IS OFFLINE
              console.log("Node 2 is idle.");
              console.log(err);
            }

            // CHECK NODE 3 LOGS
            db3.query(
              "SELECT * FROM logger_n3 WHERE is_replicated = 0",
              (err, result) => {
                if (!err) {
                  // DB3 IS ONLINE
                  setTimeout(() => {
                    result.forEach(function (r, index) {
                      const entry = {
                        id: r.data_id,
                        name: r.data_name,
                        year: r.data_year,
                        rank: r.data_rank,
                      };

                      if (r.operation == "INSERT") {
                        db1.query(
                          "INSERT INTO movies SET ?",
                          entry,
                          (err, result) => {
                            if (!err) {
                              db1.query(
                                "SELECT MAX(log_id) AS maxID from logger_n1",
                                (err, result) => {
                                  if (!err) {
                                    const maxLogID1 = result[0].maxID + 1;

                                    const addLog = {
                                      log_id: maxLogID1,
                                      target_node: r.target_node,
                                      operation: r.operation,
                                      change_node: r.change_node,
                                      is_replicated_n2: 0,
                                      is_replicated_n3: 1,
                                      data_id: entry.id,
                                      data_name: entry.name,
                                      data_year: entry.year,
                                      data_rank: entry.rank,
                                    };

                                    db1.query(
                                      "INSERT INTO logger_n1 SET ?",
                                      addLog,
                                      (err, result) => {
                                        if (!err) {
                                          const updateLog = {
                                            target_node: r.target_node,
                                            operation: r.operation,
                                            change_node: r.change_node,
                                            is_replicated: 1,
                                            data_id: entry.id,
                                            data_name: entry.name,
                                            data_year: entry.year,
                                            data_rank: entry.rank,
                                          };

                                          db3.query(
                                            "UPDATE logger_n3 SET ? WHERE log_id = ?",
                                            [updateLog, r.log_id],
                                            (err, result) => {
                                              if (!err) {
                                                console.log(result);
                                                checkDb2Log();
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
                              console.log(err);
                            }
                          }
                        );
                      } else if (r.operation == "DELETE") {
                        db1.query(
                          "DELETE FROM movies WHERE id = ?",
                          [entry.id],
                          (err, result) => {
                            if (!err) {
                              const maxLogID1 = result[0].maxID + 1;

                              const addLog = {
                                log_id: maxLogID1,
                                target_node: "3",
                                operation: "DELETE",
                                change_node: 0,
                                is_replicated_n2: 0,
                                is_replicated_n3: 1,
                                data_id: entry.id,
                                data_name: entry.name,
                                data_year: entry.year,
                                data_rank: entry.rank,
                              };

                              db1.query(
                                "INSERT INTO logger_n1 SET ?",
                                addLog,
                                (err, result) => {
                                  if (!err) {
                                    const updateLog = {
                                      target_node: "3",
                                      operation: "DELETE",
                                      change_node: 0,
                                      is_replicated: 1,
                                      data_id: entry.id,
                                      data_name: entry.name,
                                      data_year: entry.year,
                                      data_rank: entry.rank,
                                    };

                                    db3.query(
                                      "UPDATE logger_n3 SET ? WHERE log_id = ?",
                                      [updateLog, r.log_id],
                                      (err, result) => {
                                        if (!err) {
                                          console.log(result);
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
                        // UPDATE OPERATION
                        const updateEntry = {
                          name: entry.name,
                          year: entry.year,
                          rank: entry.rank,
                        };

                        // check change_node
                        // no change needed
                        if (r.change_node == 0) {
                          db1.query(
                            "UPDATE movies SET ? WHERE id = ?",
                            [updateEntry, entry.id],
                            (err, result) => {
                              if (!err) {
                                db1.query(
                                  "SELECT MAX(log_id) as maxID FROM logger_n1",
                                  (err, result) => {
                                    if (!err) {
                                      const maxLogID1 = result[0].maxID + 1;

                                      const addLog = {
                                        log_id: maxLogID1,
                                        target_node: r.target_node,
                                        operation: r.operation,
                                        change_node: r.change_node,
                                        is_replicated_n2: 0,
                                        is_replicated_n3: 1,
                                        data_id: r.data_id,
                                        data_name: r.data_name,
                                        data_year: r.data_year,
                                        data_rank: r.data_rank,
                                      };

                                      db1.query(
                                        "INSERT INTO logger_n1 SET ?",
                                        addLog,
                                        (err, result) => {
                                          if (!err) {
                                            const updateLog = {
                                              target_node: r.target_node,
                                              operation: r.operation,
                                              change_node: r.change_node,
                                              is_replicated: 1,
                                              data_id: r.data_id,
                                              data_name: r.data_name,
                                              data_year: r.data_year,
                                              data_rank: r.data_rank,
                                            };

                                            db3.query(
                                              "UPDATE logger_n3 SET ? WHERE log_id = ?",
                                              [updateLog, r.log_id],
                                              (err, result) => {
                                                if (!err) {
                                                  console.log(result);
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
                                console.log(err);
                              }
                            }
                          );
                        }
                        // change needed
                        else {
                          db1.query(
                            "UPDATE movies SET ? WHERE id = ?",
                            [updateEntry, entry.id],
                            (err, result) => {
                              if (!err) {
                                db1.query(
                                  "SELECT MAX(log_id) AS maxID FROM logger_n1",
                                  (err, result) => {
                                    if (!err) {
                                      const maxLogID1 = result[0].maxID + 1;

                                      const addLog = {
                                        log_id: maxLogID1,
                                        target_node: r.target_node,
                                        operation: r.operation,
                                        change_node: r.change_node,
                                        is_replicated_n2: 0,
                                        is_replicated_n3: 1,
                                        data_id: entry.id,
                                        data_name: entry.name,
                                        data_year: entry.year,
                                        data_rank: entry.rank,
                                      };

                                      db1.query(
                                        "INSERT INTO logger_n1 SET ?",
                                        addLog,
                                        (err, result) => {
                                          if (!err) {
                                            const updateLog = {
                                              target_node: r.target_node,
                                              operation: r.operation,
                                              change_node: r.change_node,
                                              is_replicated: 1,
                                              data_id: entry.id,
                                              data_name: entry.name,
                                              data_year: entry.year,
                                              data_rank: entry.rank,
                                            };

                                            db3.query(
                                              "UPDATE logger_n3 SET ? WHERE log_id = ?",
                                              [updateLog, r.log_id],
                                              (err, result) => {
                                                if (!err) {
                                                  const updateLog = {
                                                    target_node: r.target_node,
                                                    operation: r.operation,
                                                    change_node: r.change_node,
                                                    is_replicated: 1,
                                                    data_id: entry.id,
                                                    data_name: entry.name,
                                                    data_year: entry.year,
                                                    data_rank: entry.rank,
                                                  };

                                                  db2.query(
                                                    "UPDATE logger_n2 SET ? WHERE `target_node` = ?, `operation` = ?, `change_node` = ?, `is_replicated` = 0, `data_id` = ?, `data_name` = ?, `data_year` = ?, `data_rank` = ?",
                                                    [
                                                      updateLog,
                                                      r.target_node,
                                                      r.operation,
                                                      r.change_node,
                                                      entry.id,
                                                      entry.name,
                                                      entry.year,
                                                      entry.rank,
                                                    ],
                                                    (err, result) => {
                                                      if (!err) {
                                                        const updateLog1 = {
                                                          target_node:
                                                            r.target_node,
                                                          operation:
                                                            r.operation,
                                                          change_node:
                                                            r.change_node,
                                                          is_replicated_n2: 1,
                                                          is_replicated_n3: 1,
                                                          data_id: entry.id,
                                                          data_name: entry.name,
                                                          data_year: entry.year,
                                                          data_rank: entry.rank,
                                                        };

                                                        db1.query(
                                                          "UPDATE logger_n1 SET ? WHERE log_id = ?",
                                                          [
                                                            updateLog1,
                                                            maxLogID1,
                                                          ],
                                                          (err, result) => {
                                                            if (!err) {
                                                              console.log(
                                                                result
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
                                console.log(err);
                              }
                            }
                          );
                        }
                      }
                    });

                    checkDb2Log();
                  }, 500);
                } else {
                  console.log(err);
                  checkDb2Log();
                }
              }
            );
          }
        );
      } else {
        // DB1 OFFLINE
        console.log("Node 1 is idle.");
        console.log(err);
        checkDb2Log(); // MOVE ON TO UPDATING DB2 LOGS
      }
    });

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

        // node setter
        if (inputYear < 1980) {
          dbConn = db2;
          targetNode = "2";
          loggerNode = "logger_n2";
        } else {
          dbConn = db3;
          targetNode = "3";
          loggerNode = "logger_n3";
        }

        db2.query("SELECT MAX(id) AS maxID FROM movies", (err, movies1) => {
          if (!err) {
            db3.query("SELECT MAX(id) AS maxID from movies", (err, movies2) => {
              if (!err) {
                const id1 = movies1[0].maxID;
                const id2 = movies2[0].maxID;

                const maxID = id1 > id2 ? id1 + 1 : id2 + 1;

                const entry = {
                  id: maxID,
                  name: req.body.movieTitle,
                  year: req.body.movieYear,
                  rank: req.body.movieRate,
                };

                dbConn.query(
                  "INSERT INTO movies SET ?",
                  entry,
                  (err, result2) => {
                    if (!err) {
                      console.log(result2);

                      dbConn.query(
                        "SELECT MAX(log_id) AS maxID FROM " + loggerNode,
                        (err, result) => {
                          if (!err) {
                            const maxLogIDConn = result[0].maxID + 1;

                            const logdbConn = {
                              log_id: maxLogIDConn,
                              target_node: targetNode,
                              operation: "INSERT",
                              change_node: 0,
                              is_replicated: 0,
                              data_id: entry.id,
                              data_name: entry.name,
                              data_year: entry.year,
                              data_rank: entry.rank,
                            };

                            let query = "INSERT INTO " + loggerNode + " SET ?";
                            dbConn.query(query, logdbConn, (err, result2) => {
                              if (!err) {
                                console.log(result2);
                              } else {
                                console.log(err);
                              }
                            });
                          }
                        }
                      );
                    } else {
                      console.log(err);
                    }
                  }
                );
              }
            });
          }
        });
      }
    });
  },

  // deletes entry from db
  delEntry: function (req, res) {
    let dbConn, targetNode, loggerNode;

    if (req.params.year < 1980) {
      dbConn = db2;
      targetNode = "2";
      loggerNode = "logger_n2";
    } else {
      dbConn = db3;
      targetNode = "3";
      loggerNode = "logger_n3";
    }

    db1.query(
      "DELETE FROM movies WHERE id = ?",
      [req.params.id],
      (err, result) => {
        if (!err) {
          db1.query(
            "SELECT MAX(log_id) AS maxID FROM logger_n1",
            (err, result) => {
              if (!err) {
                const maxLogID1 = result[0].maxID + 1;

                const log1 = {
                  log_id: maxLogID1,
                  target_node: targetNode,
                  operation: "DELETE",
                  change_node: 0,
                  is_replicated_n2: 0,
                  is_replicated_n3: 0,
                  data_id: req.params.id,
                  data_name: req.params.name,
                  data_year: req.params.year,
                  data_rank: req.params.rank,
                };

                db1.query(
                  "INSERT INTO logger_n1 SET ?",
                  log1,
                  (err, result2) => {
                    if (!err) {
                      console.log(result2);
                    } else {
                      console.log(err);
                    }
                  }
                );

                let query = "SELECT MAX(log_id) AS maxID FROM " + loggerNode;
                dbConn.query(query, (err, result) => {
                  if (!err) {
                    const maxLogIDConn = result[0].maxID + 1;

                    const logdbConn = {
                      log_id: maxLogIDConn,
                      target_node: targetNode,
                      operation: "DELETE",
                      change_node: 0,
                      is_replicated: 1,
                      data_id: req.params.id,
                      data_name: req.params.name,
                      data_year: req.params.year,
                      data_rank: req.params.rank,
                    };

                    dbConn.query(
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

                    let query = "INSERT INTO " + loggerNode + " SET ?";
                    dbConn.query(query, logdbConn, (err, result) => {
                      if (!err) {
                        let updateLog;

                        if (req.params.year < 1980) {
                          updateLog = {
                            target_node: targetNode,
                            operation: "DELETE",
                            change_node: 0,
                            is_replicated_n2: 1,
                            is_replicated_n3: 0,
                            data_id: req.params.id,
                            data_name: req.params.name,
                            data_year: req.params.year,
                            data_rank: req.params.rank,
                          };
                        } else {
                          updateLog = {
                            target_node: targetNode,
                            operation: "DELETE",
                            change_node: 0,
                            is_replicated_n2: 0,
                            is_replicated_n3: 1,
                            data_id: req.params.id,
                            data_name: req.params.name,
                            data_year: req.params.year,
                            data_rank: req.params.rank,
                          };
                        }

                        db1.query(
                          "UPDATE logger_n1 SET ? WHERE log_id=?",
                          [updateLog, log1.log_id],
                          (err, result2) => {
                            if (!err) {
                              res.redirect(`/`);
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
                    res.redirect(`/`);
                  }
                });
              } else {
                console.log(err);
              }
            }
          );

          console.log(result);
        } else {
          // NODE 1 CRASHES
          const inputYear = req.params.movieYear;

          let dbConn, targetNode, loggerNode;

          // node setter
          if (inputYear < 1980) {
            dbConn = db2;
            targetNode = "2";
            loggerNode = "logger_n2";
          } else {
            dbConn = db3;
            targetNode = "3";
            loggerNode = "logger_n3";
          }

          dbConn.query(
            "DELETE FROM movies WHERE id = ?",
            [req.params.id],
            (err, result) => {
              if (!err) {
                console.log(result);

                dbConn.query(
                  "SELECT MAX(log_id) AS maxID FROM " + loggerNode,
                  (err, result) => {
                    if (!err) {
                      const maxLogIDConn = result[0].maxID + 1;

                      const logdbConn = {
                        log_id: maxLogIDConn,
                        target_node: targetNode,
                        operation: "DELETE",
                        change_node: 0,
                        is_replicated: 0,
                        data_id: req.params.id,
                        data_name: req.params.name,
                        data_year: req.params.year,
                        data_rank: req.params.rank,
                      };

                      let query = "INSERT INTO " + loggerNode + " SET ?";
                      dbConn.query(query, logdbConn, (err, result2) => {
                        if (!err) {
                          res.redirect(`/`);
                          console.log(result2);
                        } else {
                          console.log(err);
                        }
                      });
                    }
                  }
                );
              } else {
                console.log(err);
              }
            }
          );
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

    let dbDest, dbSrc, targetNode, loggerNode, loggerSrc;

    if (changeYear < 1980) {
      dbDest = db2;
      dbSrc = db2;
      targetNode = "2";
      loggerNode = "logger_n2";
      loggerSrc = "logger_n3";
    } else {
      dbDest = db3;
      dbSrc = db3;
      targetNode = "3";
      loggerNode = "logger_n3";
      loggerSrc = "logger_n2";
    }

    if (initYear < 1980) {
      dbSrc = db2;
    } else {
      dbSrc = db3;
    }

    let changeNode;

    if (dbSrc == dbDest) {
      changeNode = 0;
    } else {
      changeNode = 1;
    }

    // update node 1
    db1.query(
      "UPDATE movies SET ? WHERE id=?",
      [updateEntry, req.body.movieID],
      (err, result2) => {
        if (!err) {
          console.log(result2);

          db1.query(
            "SELECT MAX(log_id) AS maxID from logger_n1",
            (err, result) => {
              if (!err) {
                const maxLogID1 = result[0].maxID + 1;

                // log for node 1
                const log1 = {
                  log_id: maxLogID1,
                  target_node: targetNode,
                  operation: "UPDATE",
                  change_node: changeNode,
                  is_replicated_n2: 0,
                  is_replicated_n3: 0,
                  data_id: req.body.movieID,
                  data_name: req.body.movieTitle,
                  data_year: req.body.changeYear,
                  data_rank: req.body.movieRate,
                };

                db1.query(
                  "INSERT INTO logger_n1 SET ?",
                  log1,
                  (err, result2) => {
                    if (!err) {
                      console.log(result2);

                      // no transferring needed
                      if (changeNode == 0) {
                        dbDest.query(
                          "UPDATE movies SET ? WHERE id = ?",
                          [updateEntry, req.body.movieID],
                          (err, result) => {
                            if (!err) {
                              dbDest.query(
                                "SELECT MAX(log_id) AS maxID from " +
                                  loggerNode,
                                (err, result) => {
                                  if (!err) {
                                    const maxLogIDDest = result[0].maxID + 1;

                                    const logDBDest = {
                                      log_id: maxLogIDDest,
                                      target_node: targetNode,
                                      operation: "UPDATE",
                                      change_node: changeNode,
                                      is_replicated: 1,
                                      data_id: req.body.movieID,
                                      data_name: req.body.movieTitle,
                                      data_year: req.body.changeYear,
                                      data_rank: req.body.movieRate,
                                    };

                                    let query =
                                      "INSERT INTO " + loggerNode + " SET ?";
                                    dbDest.query(
                                      query,
                                      logDBDest,
                                      (err, result) => {
                                        if (!err) {
                                          console.log(result);

                                          let updateLog;
                                          if (changeYear < 1980) {
                                            updateLog = {
                                              target_node: targetNode,
                                              operation: "UPDATE",
                                              change_node: changeNode,
                                              is_replicated_n2: 1,
                                              is_replicated_n3: 0,
                                              data_id: req.body.movieID,
                                              data_name: req.body.movieTitle,
                                              data_year: req.body.changeYear,
                                              data_rank: req.body.movieRate,
                                            };
                                          } else {
                                            updateLog = {
                                              target_node: targetNode,
                                              operation: "UPDATE",
                                              change_node: changeNode,
                                              is_replicated_n2: 0,
                                              is_replicated_n3: 1,
                                              data_id: req.body.movieID,
                                              data_name: req.body.movieTitle,
                                              data_year: req.body.changeYear,
                                              data_rank: req.body.movieRate,
                                            };
                                          }

                                          // update node 1 log when dbDest is online
                                          db1.query(
                                            "UPDATE logger_n1 SET ? WHERE log_id=?",
                                            [updateLog, log1.log_id],
                                            (err, result) => {
                                              if (!err) {
                                                console.log(result);
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
                              console.log(err);
                            }
                          }
                        );
                      }
                      //transfer needed
                      else {
                        dbSrc.query(
                          "DELETE FROM movies WHERE id=?",
                          req.body.movieID,
                          (err, result) => {
                            if (!err) {
                              // if connected to src, delete from src then insert to dest
                              dbSrc.query(
                                "SELECT MAX(log_id) AS maxID from " + loggerSrc,
                                (err, result) => {
                                  if (!err) {
                                    const maxLogIDSrc = result[0].maxID + 1;

                                    const logDBSrc = {
                                      log_id: maxLogIDSrc,
                                      target_node: targetNode,
                                      operation: "UPDATE",
                                      change_node: changeNode,
                                      is_replicated: 1,
                                      data_id: req.body.movieID,
                                      data_name: req.body.movieTitle,
                                      data_year: req.body.changeYear,
                                      data_rank: req.body.movieRate,
                                    };

                                    // log to dbSrc the DELETE operation
                                    let query =
                                      "INSERT INTO " + loggerSrc + " SET ?";
                                    dbSrc.query(
                                      query,
                                      logDBSrc,
                                      (err, result) => {
                                        if (!err) {
                                          console.log("dbSrc DELETE logged");

                                          let updateLog;
                                          if (initYear < 1980) {
                                            updateLog = {
                                              target_node: targetNode,
                                              operation: "UPDATE",
                                              change_node: changeNode,
                                              is_replicated_n2: 1,
                                              is_replicated_n3: 0,
                                              data_id: req.body.movieID,
                                              data_name: req.body.movieTitle,
                                              data_year: req.body.changeYear,
                                              data_rank: req.body.movieRate,
                                            };
                                          } else {
                                            updateLog = {
                                              target_node: targetNode,
                                              operation: "UPDATE",
                                              change_node: changeNode,
                                              is_replicated_n2: 0,
                                              is_replicated_n3: 1,
                                              data_id: req.body.movieID,
                                              data_name: req.body.movieTitle,
                                              data_year: req.body.changeYear,
                                              data_rank: req.body.movieRate,
                                            };
                                          }

                                          // update node 1 log when dbSrc is online
                                          db1.query(
                                            "UPDATE logger_n1 SET ? WHERE log_id=?",
                                            [updateLog, log1.log_id],
                                            (err, result) => {
                                              if (!err) {
                                                console.log(result);

                                                // insert to dbDest
                                                dbDest.query(
                                                  "INSERT INTO movies SET ?",
                                                  addEntry,
                                                  (err, result) => {
                                                    if (!err) {
                                                      // insert to dbDest logger
                                                      console.log(
                                                        "LOGGER NODE: " +
                                                          loggerNode
                                                      );

                                                      dbDest.query(
                                                        "SELECT MAX(log_id) AS maxID from " +
                                                          loggerNode,
                                                        (err, result) => {
                                                          if (!err) {
                                                            console.log(
                                                              "PUMASOK SA SELECT MAX DEST LOG"
                                                            );
                                                            const maxLogIDDest =
                                                              result[0].maxID +
                                                              1;

                                                            const logDBDest = {
                                                              log_id:
                                                                maxLogIDDest,
                                                              target_node:
                                                                targetNode,
                                                              operation:
                                                                "UPDATE",
                                                              change_node:
                                                                changeNode,
                                                              is_replicated: 1,
                                                              data_id:
                                                                req.body
                                                                  .movieID,
                                                              data_name:
                                                                req.body
                                                                  .movieTitle,
                                                              data_year:
                                                                req.body
                                                                  .changeYear,
                                                              data_rank:
                                                                req.body
                                                                  .movieRate,
                                                            };

                                                            // log to dbDest the INSERT operation
                                                            let query =
                                                              "INSERT INTO " +
                                                              loggerNode +
                                                              " SET ?";
                                                            dbDest.query(
                                                              query,
                                                              logDBDest,
                                                              (err, result) => {
                                                                if (!err) {
                                                                  console.log(
                                                                    "dbDest UPDATE logged"
                                                                  );

                                                                  let updateLog;

                                                                  updateLog = {
                                                                    target_node:
                                                                      targetNode,
                                                                    operation:
                                                                      "UPDATE",
                                                                    change_node:
                                                                      changeNode,
                                                                    is_replicated_n2: 1,
                                                                    is_replicated_n3: 1,
                                                                    data_id:
                                                                      req.body
                                                                        .movieID,
                                                                    data_name:
                                                                      req.body
                                                                        .movieTitle,
                                                                    data_year:
                                                                      req.body
                                                                        .changeYear,
                                                                    data_rank:
                                                                      req.body
                                                                        .movieRate,
                                                                  };

                                                                  // update node 1 log when dbDest is online
                                                                  db1.query(
                                                                    "UPDATE logger_n1 SET ? WHERE log_id=?",
                                                                    [
                                                                      updateLog,
                                                                      log1.log_id,
                                                                    ],
                                                                    (
                                                                      err,
                                                                      result
                                                                    ) => {
                                                                      if (
                                                                        !err
                                                                      ) {
                                                                        console.log(
                                                                          result
                                                                        );
                                                                      } else {
                                                                        console.log(
                                                                          err
                                                                        );
                                                                      }
                                                                    }
                                                                  );
                                                                } else {
                                                                  console.log(
                                                                    "dbDest INSERT not logged"
                                                                  );
                                                                  console.log(
                                                                    err
                                                                  );
                                                                }
                                                              }
                                                            );
                                                          } else {
                                                            console.log(err);
                                                          }
                                                        }
                                                      );
                                                    } else {
                                                      console.log(
                                                        "INSERT FAILED"
                                                      );
                                                    }
                                                  }
                                                );
                                              } else {
                                                console.log(err);
                                              }
                                            }
                                          );
                                        } else {
                                          console.log(
                                            "dbSrc DELETE not logged"
                                          );
                                          console.log(err);
                                        }
                                      }
                                    );
                                  }
                                }
                              );
                            } else {
                              // if can't connect to src, insert to dest only
                              // insert to dbDest
                              dbDest.query(
                                "INSERT INTO movies SET ?",
                                addEntry,
                                (err, result) => {
                                  if (!err) {
                                    // insert to dbDest logger
                                    dbDest.query(
                                      "SELECT MAX(log_id) AS maxID from " +
                                        loggerNode,
                                      (err, result) => {
                                        if (!err) {
                                          const maxLogIDDest =
                                            result[0].maxID + 1;

                                          const logDBDest = {
                                            log_id: maxLogIDDest,
                                            target_node: targetNode,
                                            operation: "INSERT",
                                            change_node: changeNode,
                                            is_replicated: 0,
                                            data_id: req.body.movieID,
                                            data_name: req.body.movieTitle,
                                            data_year: req.body.changeYear,
                                            data_rank: req.body.movieRate,
                                          };

                                          // log to dbDest the INSERT operation
                                          let query =
                                            "INSERT INTO " +
                                            loggerNode +
                                            " SET ?";
                                          dbDest.query(
                                            query,
                                            logDBDest,
                                            (err, result) => {
                                              if (!err) {
                                                console.log(
                                                  "dbDest INSERT logged"
                                                );

                                                let updateLog;

                                                updateLog = {
                                                  target_node: targetNode,
                                                  operation: "UPDATE",
                                                  change_node: changeNode,
                                                  is_replicated_n2: 1,
                                                  is_replicated_n3: 1,
                                                  data_id: req.body.movieID,
                                                  data_name:
                                                    req.body.movieTitle,
                                                  data_year:
                                                    req.body.changeYear,
                                                  data_rank: req.body.movieRank,
                                                };

                                                // update node 1 log when dbDest is online
                                                db1.query(
                                                  "UPDATE logger_n1 SET ? WHERE log_id=?",
                                                  [updateLog, log1.log_id],
                                                  (err, result) => {
                                                    if (!err) {
                                                      console.log(result);
                                                    } else {
                                                      console.log(err);
                                                    }
                                                  }
                                                );
                                              } else {
                                                console.log(
                                                  "dbDest INSERT not logged"
                                                );
                                                console.log(err);
                                              }
                                            }
                                          );
                                        }
                                      }
                                    );
                                  }
                                }
                              );
                            }
                          }
                        );
                      }
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
        }
        // NODE 1 CRASHES
        else {
          // no transferring needed
          if (changeNode == 0) {
            dbDest.query(
              "UPDATE movies SET ? WHERE id = ?",
              [updateEntry, req.body.movieID],
              (err, result) => {
                if (!err) {
                  dbDest.query(
                    "SELECT MAX(log_id) AS maxID from " + loggerNode,
                    (err, result) => {
                      if (!err) {
                        const maxLogIDDest = result[0].maxID + 1;

                        const logDBDest = {
                          log_id: maxLogIDDest,
                          target_node: targetNode,
                          operation: "UPDATE",
                          change_node: changeNode,
                          is_replicated: 0,
                          data_id: req.body.movieID,
                          data_name: req.body.movieTitle,
                          data_year: req.body.changeYear,
                          data_rank: req.body.movieRate,
                        };

                        let query = "INSERT INTO " + loggerNode + " SET ?";
                        dbDest.query(query, logDBDest, (err, result) => {
                          if (!err) {
                            console.log(result);
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
          }
          // transfer needed
          else {
            dbSrc.query(
              "DELETE FROM movies WHERE id=?",
              req.body.movieID,
              (err, result) => {
                if (!err) {
                  // if connected to src, delete from src then insert to dest
                  dbSrc.query(
                    "SELECT MAX(log_id) AS maxID from " + loggerSrc,
                    (err, result) => {
                      if (!err) {
                        const maxLogIDSrc = result[0].maxID + 1;

                        const logDBSrc = {
                          log_id: maxLogIDSrc,
                          target_node: targetNode,
                          operation: "UPDATE",
                          change_node: changeNode,
                          is_replicated: 0,
                          data_id: req.body.movieID,
                          data_name: req.body.movieTitle,
                          data_year: req.body.changeYear,
                          data_rank: req.body.movieRate,
                        };

                        // log to dbSrc the DELETE operation
                        let query = "INSERT INTO " + loggerSrc + " SET ?";
                        dbSrc.query(query, logDBSrc, (err, result) => {
                          if (!err) {
                            console.log("dbSrc DELETE logged");

                            // insert to dbDest
                            dbDest.query(
                              "INSERT INTO movies SET ?",
                              addEntry,
                              (err, result) => {
                                if (!err) {
                                  // insert to dbDest logger
                                  console.log("LOGGER NODE: " + loggerNode);

                                  dbDest.query(
                                    "SELECT MAX(log_id) AS maxID from " +
                                      loggerNode,
                                    (err, result) => {
                                      if (!err) {
                                        console.log(
                                          "PUMASOK SA SELECT MAX DEST LOG"
                                        );
                                        const maxLogIDDest =
                                          result[0].maxID + 1;

                                        const logDBDest = {
                                          log_id: maxLogIDDest,
                                          target_node: targetNode,
                                          operation: "UPDATE",
                                          change_node: changeNode,
                                          is_replicated: 0,
                                          data_id: req.body.movieID,
                                          data_name: req.body.movieTitle,
                                          data_year: req.body.changeYear,
                                          data_rank: req.body.movieRate,
                                        };

                                        // log to dbDest the INSERT operation
                                        let query =
                                          "INSERT INTO " +
                                          loggerNode +
                                          " SET ?";
                                        dbDest.query(
                                          query,
                                          logDBDest,
                                          (err, result) => {
                                            if (!err) {
                                              console.log(
                                                "dbDest UPDATE logged"
                                              );
                                            } else {
                                              console.log(
                                                "dbDest INSERT not logged"
                                              );
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
                                  console.log("INSERT FAILED");
                                }
                              }
                            );
                          } else {
                            console.log("dbSrc DELETE not logged");
                            console.log(err);
                          }
                        });
                      }
                    }
                  );
                } else {
                  // if can't connect to src, insert to dest only
                  // insert to dbDest
                  dbDest.query(
                    "INSERT INTO movies SET ?",
                    addEntry,
                    (err, result) => {
                      if (!err) {
                        // insert to dbDest logger
                        dbDest.query(
                          "SELECT MAX(log_id) AS maxID from " + loggerNode,
                          (err, result) => {
                            if (!err) {
                              const maxLogIDDest = result[0].maxID + 1;

                              const logDBDest = {
                                log_id: maxLogIDDest,
                                target_node: targetNode,
                                operation: "INSERT",
                                change_node: changeNode,
                                is_replicated: 0,
                                data_id: req.body.movieID,
                                data_name: req.body.movieTitle,
                                data_year: req.body.changeYear,
                                data_rank: req.body.movieRate,
                              };

                              // log to dbDest the INSERT operation
                              let query =
                                "INSERT INTO " + loggerNode + " SET ?";
                              dbDest.query(query, logDBDest, (err, result) => {
                                if (!err) {
                                  console.log("dbDest INSERT logged");
                                } else {
                                  console.log("dbDest INSERT not logged");
                                  console.log(err);
                                }
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      }
    );
  },
};

module.exports = controller;
