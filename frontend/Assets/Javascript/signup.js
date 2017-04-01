$(document).ready(function() {
    $("#signup-button").click(function() {
        event.preventDefault();

        var firstname = $("#firstname").val();
        var lastname = $("#lastname").val();
        var username = $("#username").val();
        var password = $("#password").val();
        var password2 = $("#passwordverify").val();

        if (password != password2) {
            alert("Password does not match.");
            return false;
        }

        $.ajax({
            url: "/register",
            type: "POST",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ "username": username, "password": password, "firstname": firstname, "lastname": lastname }),
            success: function(resp) {
                alert("Successfully signed up!");
                console.log(resp);
                window.location.replace("/");
                return;
            },
            error: function(resp) {
                alert("One or more fields are incorrect.");
            }
        });
    });

    $("#signoutRef").hide();
    checkLogin();

    function checkLogin() {
        $.ajax({
            type: "GET",
            url: "/isLoggedIn",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(response) {
                $("#signupRef").hide();
                $("#signinRef").hide();
                $("#signoutRef").show();
                return console.log("You are logged in.");
            }
        });
    }


});