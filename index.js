var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require('express-session');
var passport = require("passport");
var User = require("./backend/user");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var path = require("path");

var app = express();

app.use(require("express-session")({
    secret: "hevEbrurutr3",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + "/frontend/"));
app.use(express.static(__dirname + "/backend/"));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Stuff to pull from Cobalt API.
var request = require('request');
var cobalt = "?key=wxyV572ztbmjVEc7qcokZ0xYVPv2Qf0n";
var cobaltApi = "https://cobalt.qas.im/api/1.0/";

var selectedCourses = [];

/**
 * Initialization.
 */
mongoose.connect("mongodb://localhost/schdule", function(err, db) {
    if (err) {
        console.log("Unable to connect to DB.");
    }

    app.listen(process.env.port || 3000, function() {
        console.log("Listening on port 3000");
        console.log("Successfully connected to schdule DB.");
    });
});




// userId course relationship.
var courseSchema = new mongoose.Schema({
    userid: String,
    courseid: String,
    lecture: String
});
var Course = mongoose.model("Course", courseSchema);

var courseDatabase = new mongoose.Schema({
    id: String,
    code: String,
    name: String,
    description: String,
    division: String,
    department: String,
    prerequisites: String,
    exclusions: String,
    level: Number,
    campus: String,
    term: String,
    breadths: [Number],
    meeting_sections: [{
        code: String,
        instructors: [String],
        times: [{
            day: String,
            start: Number,
            end: Number,
            duration: Number,
            location: String
        }],
        size: Number,
        enrolment: Number
    }]
});
var CourseData = mongoose.model("CourseData", courseDatabase);

// feeback schema
var commentSchema = new mongoose.Schema({
    email: String,
    comments: [{
        type: String
    }]
});
var Comment = mongoose.model("Comment", commentSchema);

// Timetables schema
var timetableSchema = new mongoose.Schema({
    userid: String,
    timetable: Array,
    name: String
})
var Timetables = mongoose.model("Timetables", timetableSchema);

loadCourses();
Timetables.remove({}, function() {});


console.log("Completed Initialization.");


/**
 * Gets the course deets from Cobalt API.
 * @param {*} req 
 * @param {*} res 
 */

function getCourse(req, res) {

    var query = req.query.course;
    console.log("Searched for: " + query);

    // 10 results by default. Use ?limit=x to get more/less, up to a maximum of 100.
    var searchUri = cobaltApi + "courses/search" + cobalt + "&q=" + query;
    console.log("URI: " + searchUri);

    request(searchUri, function(err, resp, body) {
        if (err) {
            console.log("Error:", err);
            return res.status(500).json({
                Status: "Failed",
                Message: err
            });
        }

        if (resp.statusCode != 200) {
            console.log("Invalid status code: ", resp.statusCode);
            return res.status(400).json({
                Status: "Failed",
                Message: "Unknown status code."
            });
        }

        // If the response from the API call is [] we know its an empty array. Means that the user input was wrong.
        if (body.length == 2) {
            console.log(body);
            console.log(body.length);
            return res.status(400).json({
                Status: "Failed",
                Message: "No courses to list."
            });
        }
        // Everything is a-ok.
        res.status(200).send(JSON.parse(body));

    });

}

function getBuildingCord(req, res) {
    var query = req.query.buildingcode;

    var searchUri = cobaltApi + "buildings/search" + cobalt + "&q=\"" + query + "\"";
    console.log("URI: " + searchUri);

    request(searchUri, function(err, resp, body) {
        if (err) {
            console.log("Error:" + err);
            return res.status(500).json({
                Status: "Failed",
                Message: err
            });
        }

        if (resp.statusCode != 200) {
            console.log("Invalid status code: " + resp.statusCode);
            return res.status(400).json({
                Status: "Failed",
                Message: "No buildings to list."
            });
        }


        var building = JSON.parse(body);
        res.status(200).json({ "lat": building[0].lat, "lng": building[0].lng });

    });
}


/**
 * This function retrieves all comments from DB.
 * 
 * returns JSON     {
                    "user": ["messages"],
                    }
 */
function retrieveCommentAll(req, res) {
    Comment.find({}, function(err, users) {
        if (err) {
            console.log("error");
            return res.status(500).json({
                Status: "Failed",
                Message: "Error retrieving data. Server encountered an unexpected condition."
            });
        } else {
            // Renders a new JSON format readable to the devs.
            var userMap = {};
            users.forEach(function(user) {
                userMap[user.email] = user.comments;
            });
            console.log(userMap);
            return res.send(userMap);
        }
    });
}


/**
 * This function posts comments from the about us page to the DB.
 * 
 */
function insertComment(req, res) {
    if (!req.body.email || !req.body.comment) {
        console.log("Failed");
        console.log(req.body);
        return res.sendStatus(400);
    }
    var email = req.body.email;
    var comment = req.body.comment;
    console.log("Username: " + email);
    console.log("Comment: " + comment);

    // Check to see if the given email is in the DB.
    Comment.findOne({ "email": email }, function(err, commentResult) {
        if (err) {
            console.log("Error retrieving users."); //// error with db
            return res.status(500).json({
                Status: "Failed",
                Message: "Error retrieving data. Server encountered an unexpected condition."
            });
        }
        // Creates a new object if the user hasn't posted a comment before.
        if (commentResult == null) {
            Comment.create({
                "email": email,
                "comments": [comment],
            }, function(err, comment) {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        Status: "Failed",
                        Message: "Error retrieving data. Server encountered an unexpected condition."
                    });
                } else {
                    console.log(commentResult);
                }
            });

            console.log("Created comment entry from: " + email);
            return res.status(200).json({
                Status: "Success",
                Message: "Comment inserted into DB."
            });

        } else {
            // Inserts the new comment by the user if they have previously commented.
            Comment.update({ "email": email }, { $push: { comments: comment } }, { upsert: true }, function(err) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        Status: "Failed",
                        Message: "Error retrieving data. Server encountered an unexpected condition."
                    });
                } else {
                    console.log("Successfully added");
                    console.log("pushed");
                    return res.status(200).json({
                        Status: "Success",
                        Message: "Entry pushed comment into DB."
                    });
                }
            });

        }
    });

}
/**
 * This function inserts a user's desired course and lecture section into the DB.
 * Primary key is both the userid and the courseid.
 * 
 * We need to verify here if the course exists.
 * @param {*} req 
 * @param {*} res 
 */
function insertCourse(req, res) {
    if (buildTimetable(req.body.data[0]) == true) {
        res.send(selectedCourses);
        console.log(selectedCourses);
    } else {
        res.send(false);
    }

}

/**
 * Removes the course from the database.
 * @param {*} req 
 * @param {*} res 
 */
function removeCourse(req, res) {
    for (let i = 0; i < selectedCourses.length; i++) {
        if (selectedCourses[i].code == req.body.code) {
            selectedCourses.splice(i, 1);
        }
    }
    res.send(selectedCourses);
}


function helperCreateUser(req) {
    var userInfo = {};
    if (req.body.username) {
        userInfo.username = req.body.username;
    }
    if (req.body.firstname) {
        userInfo.firstname = req.body.firstname;
    }
    if (req.body.lastname) {
        userInfo.lastname = req.body.lastname;
    }
    if (req.body.admin) {
        userInfo.admin = req.body.admin;
    }
    return userInfo;
}
/**
 * Uses Passport.js to authenticate users. User accounts are stored locally on mongo.
 * @param {*} req 
 * @param {*} res 
 */
function createUser(req, res) {
    console.log(req.body.username);

    // if (!req.body.username || !req.body.firstname || !req.body.password) {
    //     return res.sendStatus(400);
    // }
    User.register(new User({ "username": req.body.username, "firstname": req.body.firstname, "lastname": req.body.lastname }), req.body.password, function(err, user) {

        if (err) {
            console.log(err);
            return res.status(400).json({
                Status: "Failed",
                Message: "Username already exists."
            });
        }

        passport.authenticate("local")(req, res, function() {
            console.log("here.");
            return res.status(200).json({
                Status: "Success",
                Message: "Successfully authenticated you."
            });
        });


    });
}

/**
 * Function is only called iff the user is successfully authenticated.
 * @param {*} req 
 * @param {*} res 
 */
function authenticateUser(req, res) {
    return res.status(200).json({
        Status: "Success",
        Message: "Successfully authenticated. Logging in username: " + req.user.username
    });
}

function destroySession(req, res) {

    console.log(req.user.username + " logged out.");
    req.logout();
    res.status(200).json({
        Status: "Success",
        Message: "Successfully logged out."
    });
}

/**
 * Middleware if you want to verify that the user is logged in. Place it inbetween the routes and the function call below.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        console.log("User successfully authenticated.");
        console.log(req.user);
        console.log(req.isAuthenticated());
        return next();
    }

    console.log(req.user);
    return res.status(401).json({
        Status: "Failed",
        Message: "You need to be logged in to access content."
    });
}

/**
 * Middleware if you want to verify that the user is logged in. Place it inbetween the routes and the function call below.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
function isAdminLoggedIn(req, res, next) {
    if (req.isAuthenticated() && req.user.username == "danielja.chan@mail.utoronto.ca") {
        console.log("User is an administrator.");
        console.log(req.user);
        return next();
    }

    return res.status(403).json({
        Status: "Failed",
        Message: "You need to be an admin to view content."
    });
};

// Adds courses
// {"code": "", "name": "", "instructor": "", "timeslots": [[day, start]], "time": [start, duration], "colour": "", "timeslots":[[start, end]]}
function buildTimetable(data) {
    var startTime;
    var endTime;
    var day;
    var days;
    var time;
    var conflict;
    var timeslots;

    // Iterate through the meeting sections
    for (let i = 0; i < data.meeting_sections.length; i++) {
        days = [];
        timeslots = [];

        // Iterate through a meeting section's timeslots
        conflict = false;
        startTime = 0;
        endTime = 0;
        for (let k = 0; k < data.meeting_sections[i].times.length; k++) {

            // If there is a conflict
            if (conflict == true) {
                break;
            }

            // Convert timeslots to numbers
            startTime = data.meeting_sections[i].times[k].start;
            endTime = data.meeting_sections[i].times[k].end;
            endTime /= 3600;
            startTime /= 3600;
            startTime += convertDayToNum(data.meeting_sections[i].times[k].day);
            endTime += convertDayToNum(data.meeting_sections[i].times[k].day);
            timeslots.push([startTime, endTime]);

            // Convert timeslots for front end
            day = abbreviateDay(data.meeting_sections[i].times[k].day);
            time = data.meeting_sections[i].times[k].start / 3600;
            days.push([day, time]);

            // Iterate through the selected courses to check for conflicts
            for (let m = 0; m < selectedCourses.length; m++) {
                // If there is a conflict
                for (let j = 0; j < selectedCourses[m].timeslots.length; j++) {
                    if (startTime >= selectedCourses[m].timeslots[j][0] && startTime <= selectedCourses[m].timeslots[j][1]) {
                        conflict = true;
                        break;
                    }
                }
                if (conflict == true) {
                    break;
                }
            }
        }

        if (conflict == false) {
            selectedCourses.push({ "code": data.code, "name": data.name, "instructor": data.meeting_sections[i].instructors, "days": days, "timeslots": timeslots, "colour": "", duration: data.meeting_sections[i].times[0].duration });
            return true;
        }
    }
    return false;
}

function convertDayToNum(day) {
    var num;
    switch (day) {
        case "MONDAY":
            num = 0;
            break;
        case "TUESDAY":
            num = 24;
            break;
        case "WEDNESDAY":
            num = 48;
            break;
        case "THURSDAY":
            num = 72;
            break;
        case "FRIDAY":
            num = 96;
            break;
    }
    return num;
}

function abbreviateDay(day) {
    var d;
    switch (day) {
        case "MONDAY":
            d = "M";
            break;
        case "TUESDAY":
            d = "T";
            break;
        case "WEDNESDAY":
            d = "W";
            break;
        case "THURSDAY":
            d = "TH";
            break;
        case "FRIDAY":
            d = "F";
            break;
    }
    return d;
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

    // Need to implement a check if a connection can be successfully established, we drop the coursesData relation
    // Otherwise stop, dont process anything and just use pre-existing data.
    CourseData.remove({}, function(err) {
        if (err) {
            console.log("Failed to remove courses.");
            return true;
        } else {
            console.log("Successfully removed courses.");
        }
    })


    while (popOut == false || skip < 7000) {

        var searchUri = "https://cobalt.qas.im/api/1.0/courses" + cobalt + "&limit=" + limit + "&skip=" + skip;
        console.log(searchUri);

        popOut = request(searchUri, function(err, resp, body) {
            console.log("Sending req");
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
                console.log(courseInfo);

                CourseData.insertMany(courseInfo, function(err, docs) {
                    if (err) {
                        console.log("Failed to add set into database.");
                    } else {
                        console.log(docs.length + " courses were successfully inserted into the database.");
                    }
                });
            }
        });

        console.log("End of iteration.");
        skip = skip + 100;
    }
}


function contains(item, container) {
    for (let i = 0; i < container.length; i++) {
        if (item == container[i]) {
            return true;
        }
    }
    return false;
}


function saveTimetable(req, res) {
    let t = { userid: req.user.username, timetable: selectedCourses, name: req.body.name };
    let s = new Timetables(t);
    s.save(function(err, result) {
        res.send(result);
    });
}


function deleteTimetable(req, res) {
    Timetables.findOneAndRemove({ _id: req.body._id }, function(err, result) {
        selectedCourses = [];
        res.send(selectedCourses);
    });
}


function getAllTimetables(req, res) {

    Timetables.find({ userid: req.user.username }, function(err, result) {
        res.send(result);
    });
}


function loadTimetable(req, res) {
    Timetables.find({ _id: req.query._id }, function(err, result) {
        res.send(result);
    });
}



// Search local database for course
function searchCourse(req, res) {
    var filter = {};
    filter.code = req.query.code;
    if (req.query.campus) {
        filter.campus = req.query.campus;
    }
    CourseData.find(filter, function(err, result) {
        res.send(result);
    });
}


/**
 * Routes for about us / comment. 
 */
app.post('/addcomment', insertComment);
app.get('/getcomment', isAdminLoggedIn, retrieveCommentAll); // for devs. retrieveCommentAll

/**
 * Relevant routes for courses & navigating Cobalt.
 */
app.get('/search', isLoggedIn, getCourse);
app.post('/addcourse', insertCourse);
app.delete('/removecourse', removeCourse);
app.post('/savetimetable', isLoggedIn, saveTimetable);
app.delete('/deletetimetable', isLoggedIn, deleteTimetable);
app.get('/getalltimetables', isLoggedIn, getAllTimetables);
app.get('/loadtimetable', isLoggedIn, loadTimetable);
app.get('/coursesearch', searchCourse);
app.get("/building", getBuildingCord);

/**
 * Relevant routes for authentication.
 */
app.post('/login', passport.authenticate('local'), authenticateUser);
app.post('/register', createUser);
app.post('/logout', destroySession);
app.get('/isLoggedIn', function(req, res) {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated() == true)
        return res.status(200).json('Hurray!');
    else
        return res.status(401).json('User not logged in.');
});