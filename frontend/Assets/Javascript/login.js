/**
 * login user and checks if logged in
 */

$(document).ready(function() {

    $("#user-signin").click(function() {
        event.preventDefault();

        var username = $("#username").val();
        var password = $("#password").val();

        $.ajax({
            url: "/login",
            type: "POST",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ "username": username, "password": password }),
            success: function(response) {
                alert("Successfully logged in!");
                window.location.replace("/");
            },
            error: function(response) {
                alert("Wrong username/password.");
            }
        });
    });

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

});