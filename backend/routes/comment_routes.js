var express = require('express');
var router = express.Router();

var Comment = require('../models/comments');
var isAdminLoggedIn = require('./middlewares').isAdminLoggedIn;
var isLoggedIn = require('./middlewares').isLoggedIn;

/**
 * This function posts comments from the about us page to the DB.
 * 
 */
router.post('/addcomment', function(req, res) {
    if (!req.body.email || !req.body.comment) {
        console.log("Failed");
        console.log(req.body);
        return res.sendStatus(400);
    }
    var email = req.body.email;
    var comment = req.body.comment;
    console.log("Username: " + email);
    console.log("Comment: " + comment);

    // Check to see if the given email is in the DB.
    Comment.findOne({ "email": email }, function(err, commentResult) {
        if (err) {
            console.log("Error retrieving users."); //// error with db
            return res.status(500).json({
                Status: "Failed",
                Message: "Error retrieving data. Server encountered an unexpected condition."
            });
        }
        // Creates a new object if the user hasn't posted a comment before.
        if (commentResult == null) {
            Comment.create({
                "email": email,
                "comments": [comment],
            }, function(err, comment) {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        Status: "Failed",
                        Message: "Error retrieving data. Server encountered an unexpected condition."
                    });
                } else {
                    console.log(commentResult);
                }
            });

            console.log("Created comment entry from: " + email);
            return res.status(200).json({
                Status: "Success",
                Message: "Comment inserted into DB."
            });

        } else {
            // Inserts the new comment by the user if they have previously commented.
            Comment.update({ "email": email }, { $push: { comments: comment } }, { upsert: true }, function(err) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        Status: "Failed",
                        Message: "Error retrieving data. Server encountered an unexpected condition."
                    });
                } else {
                    console.log("Successfully added");
                    console.log("pushed");
                    return res.status(200).json({
                        Status: "Success",
                        Message: "Entry pushed comment into DB."
                    });
                }
            });

        }
    });

});


router.get('/getcomment', isAdminLoggedIn, function(req, res) {
    Comment.find({}, function(err, users) {
        if (err) {
            console.log("error");
            return res.status(500).json({
                Status: "Failed",
                Message: "Error retrieving data. Server encountered an unexpected condition."
            });
        } else {
            // Renders a new JSON format readable to the devs.
            var userMap = {};
            users.forEach(function(user) {
                userMap[user.email] = user.comments;
            });
            console.log(userMap);
            return res.send(userMap);
        }
    });
});


module.exports = router;