var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongo = require("mongodb").MongoClient;
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//Stuff to pull from Cobalt API.
var request = require('request');
var cobalt = "?key=wxyV572ztbmjVEc7qcokZ0xYVPv2Qf0n";
var cobaltApi = "https://cobalt.qas.im/api/1.0/courses/";

app.use(bodyParser.json());

mongo.connect("mongodb://localhost:27017/schdule", function(err, db) {
    if (err) {
        console.log("Cannot connect to the database");
    }
    app.listen(3000, function() {
        console.log("Listening on port 3000");
        console.log(db);
    });
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

function generateTimetable(req, res) {

}




// Save timetable
app.put("/index", function(req, res) {
    db.collection("timetables").insertOne(req.data);

});


// Delete timetable
app.delete("/index", function(req, res) {

});


app.get('/search', getCourse);
app.post('/login', processLogin);
app.get('/timetable', generateTimetable);