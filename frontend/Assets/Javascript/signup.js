$(document).ready(function() {
    $("#signup-button").click(function() {
        var firstname = $("#firstname").val();
        var lastname = $("#lastname").val();
        var username = $("#username").val();
        var password = $("#password").val();
        var password2 = $("#passwordverify").val();

        if (password != password2) {
            alert("Password does not match.");
            return false;
        }
        console.log(username);

        $.ajax({
            url: "/register",
            type: "POST",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ "username": username, "password": password, "firstname": firstname, "lastname": lastname }),
            success: function(response) {
                alert("Successfully signed up!");
                return;
            }
        });
    });


});