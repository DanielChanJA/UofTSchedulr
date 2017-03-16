var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
// var Users = require('./model/user');
var app = express();
app.use(bodyParser.json());

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/schedule_app');

var scheduleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    course: [{ // [id, name, time]
        id: { type: String },
        name: { type: String },
        time: { type: String },
    }]
});

var Users = mongoose.model("User", scheduleSchema);



// var express = require("express");
// var app = express();
// var bodyParser = require("body-parser");
// // var mongo = require("mongodb").MongoClient;
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// var cobalt = "?key=wxyV572ztbmjVEc7qcokZ0xYVPv2Qf0n";


// mongo.connect("mongodb://localhost:27017/schdule", function(err, db) {
//     if (err) {
//         console.log("Cannot connect to the database");
//     }
//     app.listen(3000, function() {
//         console.log("Listening on port 3000");
//         console.log(db);
//     });
// });


// // Search for course
// app.get("/index", function(req, res) {
//     var cobaltUrl = cobalt;
//     xhr = new XMLHttpRequest();
//     xhr.onreadystatechange = function() {
//         if (xhr.readyState == 4 && xhr.status == 200) {
//             console.log(JSON.parse(xhr.responseText));
//         }
//     }
//     xhr.open("GET", cobaltUrl, true);
//     xhr.send("");
// });


// // Save timetable
// app.put("/index", function(req, res) {
//     db.collection("timetables").insertOne(req.data);

// });


// // Delete timetable
// app.delete("/index", function(req, res) {

// });

// Users.create({
//     name: "vince3",
//     course: [{ // [id, name, time]
//         id: "csc108",
//         name: "into to programming",
//         time: "M10-11,W10-11,F10-11"
//     }]
// }, function(err, user) {
//     if (err) {
//         throw err;
//     } else {
//         console.log("added user");
//         console.log(user);
//     }
// });

app.post('/save', function(req, res) {
    // // Checking if the fields (by name) aren't empty:
    // req.assert('stunum', 'A student number is required').notEmpty();
    // req.assert('phone', 'A phone number is required').notEmpty();
    // req.assert('birthday', 'A birthday is required').notEmpty();

    // // .checkBody() looks at POST data, and calls the validation function
    // // (.isStuNum() in the first case) on the input field given by the
    // // first argument ("stunum" in the first case)

    // // Checking student number (use your custom validation functions):
    // req.checkBody('stunum',
    //               'Student number not formatted properly.').isStuNum();

    // // Checking phone number:
    // req.checkBody('phone', 'Phone number not formatted properly.').isPhone();

    // // Checking birthday:
    // req.checkBody('birthday', 'Birthday not formatted properly.').isBirthday();

    // // Checking for errors and mapping them:
    // var errors = req.validationErrors();
    // var mappedErrors = req.validationErrors(true);

    // if (errors) {
    //     // If errors exist, send them back to the form:
    //     var errorMsgs = { 'errors': {} };

    //     if (mappedErrors.stunum) {
    //         errorMsgs.errors.error_stunum = mappedErrors.stunum.msg;
    //     }

    //     if (mappedErrors.phone) {
    //         errorMsgs.errors.error_phone = mappedErrors.phone.msg;
    //     }

    //     if (mappedErrors.birthday) {
    //         errorMsgs.errors.error_birthday = mappedErrors.birthday.msg;
    //     }

    //     // Note how the placeholders in tapp.html use this JSON:
    //     res.render('tapp', errorMsgs);
    // } else {
    //     // You'd do your processing of the submitted data here.
    //     // We're just showing a JSON of the fields you've validated:
    //     var response = {
    //         stunum:req.body.stunum,
    //         givenname:req.body.givenname,
    //         familyname:req.body.familyname,
    //         phone:req.body.phone,
    //         birthday:req.body.birthday
    //     };

    /// something along these lines.
    var name_user = "vince"; // need to change to another var/id
    var update = { id: 'csc309', name: 'web', time: 'M10-12' }; // item to be added on top of what in the db

    Users.update({ name: name_user }, { $set: { 'course.$.id': update.id, 'course.$.name': update.name, 'course.$.time': update.time } },
        function(err, user) {
            if (err) throw err;
            else {
                console.log(user);
            }
        });

});