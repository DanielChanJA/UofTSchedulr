$(document).ready(function() {

    $("#user-signin").click(function() {
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
            }
        });
    });

});