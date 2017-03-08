var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongo = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/schdule"
var db;

app.use(bodyParser.json());

mongo.connect(url, function(err, database) {
    
    // I think we need to populate the database somehow here
    db = database;
    app.listen(3000, function() {
        console.log("Listening on port 3000");
    });
});

// Search for course
app.post("/index", function(req, res) {
    db.collection("courses").find({})
});