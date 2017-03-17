var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mongoose = require("mongoose");
var mongo = require("mongodb").MongoClient;
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//Stuff to pull from Cobalt API.
var request = require('request');
var cobalt = "?key=wxyV572ztbmjVEc7qcokZ0xYVPv2Qf0n";
var cobaltApi = "https://cobalt.qas.im/api/1.0/courses/";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));




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
    courseid: String,
    lecture: String
});

var Course = mongoose.model("Course", courseSchema);


var timetableId = new mongoose.Schema({
    userid: String,
    courseid1: String,

});




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

    // res.json(req.body);
    if (req.body.userid == null) {
        console.log("Failed");
        console.log(req.body);
    }

    var userid = req.body.userid;
    var course = req.body.courseid + req.body.sem;
    var section = req.body.lecture;

    console.log("Username: " + userid);
    console.log("Course: " + course);
    console.log("Section: " + section);


    Course.findOne({ "userid": userid, "courseid": course, "lecture": section }, function(err, courseResult) {
        if (err) {
            console.log("Error retrieving users.");
            return;
        }

        if (courseResult == null) {
            Course.create({
                "userid": userid,
                "courseid": course,
                "lecture": section
            }, function(err, course) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(courseResult);
                }
            });

            console.log("Created entry");
            res.json({
                Status: "Success",
                Message: "Entry inserted into DB."
            });

        } else {
            console.log("DB contains entry: " + courseResult.userid + " : " + courseResult.courseid + " : " + courseResult.lecture);
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