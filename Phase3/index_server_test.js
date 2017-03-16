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
        id: { type: String, required: true },
        name: { type: String, required: true },
        time: { type: String, required: true },
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

Users.create({
    name: "vince3",
    course: [{ // [id, name, time]
        id: "csc108",
        name: "into to programming",
        time: "M10-11,W10-11,F10-11"
    }]
}, function(err, user) {
    if (err) {
        throw err;
    } else {
        console.log("added user");
        console.log(user);
    }
});