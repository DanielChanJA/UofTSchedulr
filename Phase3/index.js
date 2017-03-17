var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var mongo = require("mongodb").MongoClient;
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//Stuff to pull from Cobalt API.
var request = require('request');
var cobalt = "?key=wxyV572ztbmjVEc7qcokZ0xYVPv2Qf0n";
var cobaltApi = "https://cobalt.qas.im/api/1.0/courses/";

mongoose.connect("mongodb://localhost/schdule", function(err, db) {
    if (err) {
        console.log("Unable to connect to DB.");
    }

    app.listen(3000, function() {
        console.log("Listening on port 3000");
        console.log(db);
    });
});

var courseSchema = new mongoose.Schema({
    userid: String,
    courseid: String
});


var Course = mongoose.model("Course", courseSchema);


app.use(bodyParser.json());


function getCourse(req, res) {
    var query = req.query.course;
    console.log("Searched for: " + query);

    // 10 results by default. Use ?limit=x to get more/less, up to a maximum of 100.
    var searchUri = cobaltApi + "search" + cobalt + "&q=" + query;
    console.log("URI: " + searchUri);

    request(searchUri, function(err, resp, body) {
        if (err) {
            console.log("Error:", err);
        }

        if (resp.statusCode != 200) {
            console.log("Invalid status code: ", resp.statusCode);
        }

        // Everything is a-ok.
        res.send(JSON.parse(body));

    });

}

function insertCourse(req, res) {

    var userid = req.query.userid;
    var course = req.query.courseid + req.query.sem;

    console.log("Username: " + userid);
    console.log("Course: " + course);


    Course.findOne({ "userid": userid, "courseid": course }, function(err, courseResult) {
        if (err) {
            console.log("Error retrieving users.");
            return;
        }

        if (courseResult.userid == null) {
            Course.create({
                "userid": userid,
                "courseid": course
            }, function(err, course) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(course);
                }
            });

            console.log("Created entry");
            res.status("200").end();

        } else {
            console.log("DB contains entry: " + courseResult.userid + " : " + courseResult.courseid);
            res.send("Entry exists");
        }
    });

}




// Save timetable
app.put("/index", function(req, res) {
    db.collection("timetables").insertOne(req.data);

});


// Delete timetable
app.delete("/index", function(req, res) {

});


app.get('/search', getCourse);
app.post('/addcourse', insertCourse);
// app.post('/login', processLogin);
// app.get('/timetable', generateTimetable);