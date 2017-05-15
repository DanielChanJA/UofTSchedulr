var mongoose = require('mongoose');
var request = require('request');
var Timetables = require('./models/timetable_deprecated');
var CourseData = require('./models/course_deprecated');
var fs = require('fs');
var cobalt = JSON.parse(fs.readFileSync('./keys.json')).cobaltKey;


function clearDB() {
    Timetables.remove({}, function() {});
    loadCourses();
}


/**
 * Calls the CobaltAPI, plops everything that Cobalt has on Courses and stores it locally in our own Mongo as local cache.
 * This function is called on startup.
 * 
 * Interesting fact: UofT across all 3 campuses have 6721 courses in both undergraduate and graduate courses!
 */
function loadCourses() {
    var limit = 100;
    var skip = 0;
    var popOut = false;

    request("https://cobalt.qas.im/api/1.0/courses" + cobalt + "&limit=10", function(err, resp, body) {
        if (err) {
            return console.log("Failed to connect, falling back to previous data.");
        }

        if (resp.statusCode != 200) {
            return console.log("Did not get proper error code, falling back to previous data.");
        }
    });

    // Need to implement a check if a connection can be successfully established, we drop the coursesData relation
    // Otherwise stop, dont process anything and just use pre-existing data.
    CourseData.remove({}, function(err) {
        if (err) {
            console.log("Failed to remove courses.");
            return true;
        } else {
            console.log("Successfully removed courses.");
        }
    });


    while (popOut == false || skip < 7000) {

        var searchUri = "https://cobalt.qas.im/api/1.0/courses?key=" + cobalt + "&limit=" + limit + "&skip=" + skip;
        console.log(searchUri);

        popOut = request(searchUri, function(err, resp, body) {
            if (err) {
                console.log("Error connecting to Cobalt, falling back to pre-existing data.");
                return true;
            }

            if (resp.statusCode != 200) {
                console.log("Cobalt API returned a different status code than expected: " + resp.statusCode);
                return true;
            }

            if (body == null) {
                console.log("Empty body");
            } else {
                var courseInfo = JSON.parse(body);
                console.log("Attempting to insert...");

                CourseData.insertMany(courseInfo, function(err, docs) {
                    if (err) {
                        console.log("Failed to add set into database.");
                    } else {
                        console.log(docs.length + " courses were successfully inserted into the database.");
                    }
                });
            }
        });
        skip += 100;
    }
}

module.exports = clearDB;