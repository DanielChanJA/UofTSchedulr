var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongo = require("mongodb").MongoClient;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var cobalt = "?key=wxyV572ztbmjVEc7qcokZ0xYVPv2Qf0n";

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


// Search for course
app.get("/index", function(req, res) {
    var cobaltUrl = cobalt;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(JSON.parse(xhr.responseText));
        }
    }
    xhr.open("GET", cobaltUrl, true);
    xhr.send("");
});


// Save timetable
app.put("/index", function(req, res) {
    db.collection("timetables").insertOne(req.data);

});


// Delete timetable
app.delete("/index", function(req, res) {
    
});