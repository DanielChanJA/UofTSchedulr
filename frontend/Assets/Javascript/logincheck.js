checkLogin();

function checkLogin() {
    $.ajax({
        type: "GET",
        url: "/isLoggedIn",
        dataType: "text json",
        contentType: "application/json; charset=utf-8",
        success: function(response) {
            $("#save").show();
            $("#delete").show();
            $("#load").show();
            $("#signupRef").hide();
            $("#signinRef").hide();
            $("#signoutRef").show();
            return console.log("You are logged in.");
        },
        error: function(response) {
            return console.log(response);
        }
    });
}