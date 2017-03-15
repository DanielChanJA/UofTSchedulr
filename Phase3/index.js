var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongo = require("mongodb").MongoClient;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var url = "mongodb://localhost:27017/schdule"
var db;
var cobalt = "?key=wxyV572ztbmjVEc7qcokZ0xYVPv2Qf0n";

app.use(bodyParser.json());

mongo.connect(url, function(err, database) {
    db = database;
    app.listen(3000, function() {
        console.log("Listening on port 3000");
    });
});


// Search for course
app.get("/index", function(req, res) {
    var url = cobalt;
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(JSON.parse(xhr.responseText));
        }
    }
    xhr.open("GET", url, true);
    xhr.send("");
});


// Save timetable
app.put("/index", function(req, res) {
    
});


// Delete timetable
app.delete("/index", function(req, res) {
    
});