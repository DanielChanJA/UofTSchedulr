var express = require("express");
var app = express();

var mongo = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/schdule"
var db;

mongo.connect(url, function(err, database) {
    db = database;
    app.listen(3000, function() {
        console.log("Listening on port 3000");
    });
});

