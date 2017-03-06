var express = require("express");
var app = express();

var mongoClient = require("mongodb").MongoClient;
var mongoURL = "mongodb://localhost:3000/schdule"
var db;

mongoClient.connect(mongoURL, function(err, database) {
    db = database;
    app.listen(3000, function() {
        console.log("Listening on port 3000");
    });
});