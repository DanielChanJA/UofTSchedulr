$(document).ready(function() {


    checkLogin();


    function checkLogin() {
        $.ajax({
            type: "GET",
            url: "/isLoggedIn",
            dataType: "text json",
            contentType: "application/json; charset=utf-8",
            success: function(response) {
                console.log("You are logged in.");
            },
            error: function(response) {
                console.log("You are not logged in.");
            }
        });
    }


});