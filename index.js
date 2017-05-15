var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require('express-session');
var passport = require("passport");
var User = require("./backend/models/user");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var path = require("path");
var request = require('request');

var seedDB = require('./backend/seeds');
var courses = require("./backend/models/course");

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

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/frontend/"));
app.use(express.static(__dirname + "/backend/"));

app.use(indexRoutes);
app.use(authRoutes);
app.use(timetableRoutes);
app.use(campusDataRoutes);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Stuff to pull from Cobalt API.
var cobalt = "?key=wxyV572ztbmjVEc7qcokZ0xYVPv2Qf0n";
var cobaltApi = "https://cobalt.qas.im/api/1.0/";

/**
 * Initialization.
 */
mongoose.connect("mongodb://localhost/schedulr", function(err, db) {
    if (err) {
        console.log("Unable to connect to DB.");
    }

    app.listen(process.env.port || 3000, function() {
        console.log("Listening on port 3000");
        console.log("Successfully connected to schdule DB.");
    });
});


var courseSchema = new mongoose.Schema({
    userid: String,
    courseid: String,
    lecture: String
});
var Course = mongoose.model("Course", courseSchema);

// Course Informations.
var CourseData = require('./backend/models/course_deprecated');

// Feedback
var Comment = require('./backend/models/comments');

// Timetables schema
var Timetables = require('./backend/models/timetable_deprecated');

seedDB();

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
            return res.status(400).json({
                Status: "Failed",
                Message: "No courses to list."
            });
        }
        // Everything is a-ok.
        res.status(200).send(JSON.parse(body));
    });

}


// Gets building coordinates
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
    var schedule = null;
    schedule = buildTimetable(req.body.course.data[0], req.body.schedule);
    if (schedule != null) {
        res.send(schedule);
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
    for (let i = 0; i < req.body.schedule.length; i++) {
        if (req.body.schedule[i].code == req.body.code && req.body.time == req.body.schedule[i].time[0]) {
            req.body.schedule.splice(i, 1);
        }
    }
    res.send(req.body.schedule);
}


// Helper to create user
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
    if (!req.body.username || !req.body.firstname || !req.body.password) {
        return res.sendStatus(400);
    }
    User.register(new User({ "username": req.body.username, "firstname": req.body.firstname, "lastname": req.body.lastname }), req.body.password, function(err, user) {

        if (err) {
            console.log(err);
            res.sendStatus(403);
            return;
        }
        passport.authenticate("local")(req, res, function() {
            res.status(200).json({
                Status: "Success",
                Message: "Successfully authenticated you."
            });
            return;
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

/**
 * Logging out a user.
 */
function destroySession(req, res) {
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


// Builds timetables after adding them one at a time
function buildTimetable(data, schedule) {
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
            for (let m = 0; m < schedule.length; m++) {
                // If there is a conflict
                for (let j = 0; j < schedule[m].timeslots.length; j++) {
                    if (startTime >= schedule[m].timeslots[j][0] && startTime <= schedule[m].timeslots[j][1]) {
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
            schedule.push({ "code": data.code, "name": data.name, "instructor": data.meeting_sections[i].instructors, "days": days, "timeslots": timeslots, "colour": "", duration: data.meeting_sections[i].times[0].duration, location: data.meeting_sections[i].times[0].location });
            return schedule;
        }
    }
    return null;
}


// Coverts days to numbers
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


// A function to abbreviate days
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

// Checks if an array contains an item
function contains(item, container) {
    for (let i = 0; i < container.length; i++) {
        if (item == container[i]) {
            return true;
        }
    }
    return false;
}


// Save a timetable
function saveTimetable(req, res) {
    let t = { userid: req.user.username, timetable: req.body.schedule, name: req.body.name };
    let s = new Timetables(t);
    s.save(function(err, result) {
        res.send(result);
    });
}


// Delete a specific timetable
function deleteTimetable(req, res) {
    if (req.body._id == null) {
        res.send(200);
    } else {
        Timetables.findOneAndRemove({ _id: req.body._id }, function(err, result) {
            res.send(200);
        });
    }
}


// Get all timetables for loading
function getAllTimetables(req, res) {
    Timetables.find({ userid: req.user.username }, function(err, result) {
        res.send(result);
    });
}


// Load a specific timetable
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
    if (req.isAuthenticated() == true)
        return res.status(200).json('Hurray!');
    else
        return res.status(401).json('User not logged in.');
});