$("#signoutRef").hide();
checkLogin();


function checkLogin() {
    $.ajax({
        type: "GET",
        url: "/isLoggedIn",
        dataType: "text json",
        contentType: "application/json; charset=utf-8",
        success: function(response) {
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

$(document).ready(function() {
    $("#signoutRef").click(function() {
        $.ajax({
            type: "POST",
            url: "/logout",
            success: function(res) {
                window.location.replace("/");
            }
        });
    });
});