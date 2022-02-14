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

    setTimeout('location.reload()', 500);
  });

  $(".updateBtn").click(function() {
    let id = $(this).attr('name');

    $("#hiddenID").val(id);
  });
});
