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

    setTimeout("location.reload()", 1000);
  });

  $(".updateBtn").click(function () {
    let id = $(this).attr("id");
    let year = $(this).attr("name");

    $("#hiddenID").val(id);
    $("#hiddenYear").val(year);
  });

  $("#updateEntryBtn").click(function () {
    let id = $("#hiddenID").val();
    let title = $("#updateTitle").val().trim();
    let initYear = $("#hiddenYear").val();
    let changeYear = $("#updateYear").val();
    let rate = $("#updateRate").val();

    $.post(
      "/updateEntry",
      {
        movieID: id,
        movieTitle: title,
        initYear: initYear,
        changeYear: changeYear,
        movieRate: rate,
      },
      function (err) {
        if (err) console.log(err);
      }
    );

    setTimeout("location.reload()", 500);
  });
});
