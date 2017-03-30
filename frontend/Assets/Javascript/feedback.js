$("#submit-feedback").on("click", function(event) {
    // if ($('#email').val() === undefined || $('#comment').val() === undefined) {
    //     alert("Please fill in all input fields.");
    // }
    $.ajax({
        dataType: 'json',
        data: $('.feedback-form').serialize(),
        type: 'POST',
        url: '/addcomment',
        success: function(response) {
            console.log(response);
            // $(".post-user-response").text(JSON.stringify(response));

        },
        error: function(err, status) {
            // alert(err.status);
            alert("Please fill in all input fields.");
        }
    });
    $('#comment').val('');
    $('#email').val('');
    // event.stopPropagation();

});