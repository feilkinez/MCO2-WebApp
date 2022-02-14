$(document).ready(function () {
  $("#addEntryBtn").click(function () {
    let movieTitle = $("#movieTitle").val().trim();
    let movieYear = $("#movieYear").val();
    let movieRate = $("#movieRate").val();

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

    setTimeout('location.reload()', 500);
  });

  $(".updateBtn").click(function() {
    let id = $(this).attr('name');

    $("#hiddenID").val(id);
  });

  $("#updateEntryBtn").click(function() {
    let id = $("#hiddenID").val();
    let title = $("#updateTitle").val().trim();
    let year = $("#updateYear").val();
    let rate = $("#updateRate").val();

    $.post(
      "/updateEntry",
      {
        movieID: id,
        movieTitle: title,
        movieYear: year,
        movieRate: rate,
      },
      function (err) {
        if (err) console.log(err);
      }
    );

    setTimeout('location.reload()', 500);
  });
});
