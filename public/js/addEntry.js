$(document).ready(function () {
  $("#addEntryBtn").click(function () {
    var movieTitle = $("#movieTitle").val().trim();
    var movieYear = $("#movieYear").val();
    var movieRate = $("#movieRate").val();

    $.post(
      "/addEntry",
      {
        movieTitle: movieTitle,
        movieYear: movieYear,
        movieRate: movieRate,
      },
      function (err) {
        if (err) console.log(err);
      }
    );

    location.reload();
  });
});