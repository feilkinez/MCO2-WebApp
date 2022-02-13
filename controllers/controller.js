const controller = {
  // Open index.hbs
  getIndex: function (req, res) {
    let movies = [];

    movies.push({
      row: 1,
      title: "The Thing",
      year: "1982",
      rating: "8.1"
    });

    movies.push({
      row: 2,
      title: "Seven Samurai",
      year: "1954",
      rating: "8.6"
    });

    let content = {
      movies: movies
    };

    res.render(`index`, content);
  },
};

module.exports = controller;
