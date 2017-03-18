var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require('express-session');
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");


var User = require("./user");

var app = express();

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(require("express-session")({
    secret: "hevEbrurutr3",
    resave: false,
    saveUninitialized: false
}))

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Stuff to pull from Cobalt API.
var request = require('request');
var cobalt = "?key=wxyV572ztbmjVEc7qcokZ0xYVPv2Qf0n";
var cobaltApi = "https://cobalt.qas.im/api/1.0/courses/";

var selectedCourses = [];

/**
 * Initialization.
 */
mongoose.connect("mongodb://localhost/schdule", function(err, db) {
    if (err) {
        console.log("Unable to connect to DB.");
    }

    app.listen(3000, function() {
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

// users schema
var userSchema = new mongoose.Schema({
    email: String,
    password: String,
    firstname: String,
    lastname: String
});
var Users = mongoose.model("Users", userSchema);




/**
 * Gets the course deets from Cobalt API.
 * @param {*} req 
 * @param {*} res 
 */

function getCourse(req, res) {
    var query = req.query.course;
    console.log("Searched for: " + query);

    // 10 results by default. Use ?limit=x to get more/less, up to a maximum of 100.
    var searchUri = cobaltApi + "search" + cobalt + "&q=" + query;
    console.log("URI: " + searchUri);

    request(searchUri, function(err, resp, body) {
        if (err) {
            console.log("Error:", err);
            return res.json({
                Status: "Failed",
                Message: err
            });
        }

        if (resp.statusCode != 200) {
            console.log("Invalid status code: ", resp.statusCode);
            return res.json({
                Status: "Failed",
                Message: "Unknown status code."
            });
        }

        // Everything is a-ok.
        res.send(JSON.parse(body));

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

    if (req.body.userid == null) {
        console.log("Failed");
        console.log(req.body);
    }

    var userid = req.body.userid;
//    var course = req.body.courseid + req.body.sem;
//    var section = req.body.lecture;
    var course = req.body.data[0].id;

    console.log("Username: " + userid);
    console.log("Course: " + course);
//    console.log("Section: " + section);


    // Will not allow users to add multiple lecture sections of the same course. Only one is permitted.
    Course.findOne({ "userid": userid, "courseid": course }, function(err, courseResult) {
        if (err) {
            console.log("Error retrieving users.");
            return res.json({
                Status: "Failed",
                Message: "Error retrieving data."
            });
        }

        if (courseResult == null && buildTimetable(req.body.data[0])) {
            Course.create({
                "userid": userid,
                "courseid": course,
//                "lecture": section
            }, function(err, course) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(courseResult);
                }
            });

            console.log("Created entry");
            
            for (let i = 0; i < selectedCourses.length; i++) {
                console.log(selectedCourses[i].days);
                console.log(selectedCourses[i].timeslots);
            }
            
            
            return res.json({
                Status: "Success",
                Message: "Entry inserted into DB."
            });

        } else {
//            console.log("DB contains entry: " + courseResult.userid + " : " + courseResult.courseid + " : " + courseResult.lecture);
            console.log("DB contains entry: " + courseResult.userid + " : " + courseResult.courseid);
            return res.json({
                Status: "Failed",
                Message: "Entry exists in DB, or there are no available timeslots"
            });
        }
    });

}

/**
 * Removes the course from the database.
 * @param {*} req 
 * @param {*} res 
 */
function removeCourse(req, res) {

    var userid = req.body.userid;
//    var course = req.body.courseid + req.body.sem;
//    var section = req.body.lecture;
    var course = req.body.courseid;

    Course.findOneAndRemove({ "userid": userid, "courseid": course }, function(err, id) {
        if (err) {
            console.log("Error retrieving entries.");
            return res.json({
                Status: "Failed",
                Message: "Unknown error occurred."
            });
        }

        if (id != null) {
            console.log("Successfully deleted entry: " + userid + " : " + course);
            return res.json({
                Status: "Success",
                Message: "Course successfully removed."
            });
        } else {
            console.log("Unable to find record: " + userid + " : " + course);
            return res.json({
                Status: "Failed",
                Message: "Record doesn't exist."
            });
        }

    });



}

/**
 * Uses Passport.js to authenticate users.
 * @param {*} req 
 * @param {*} res 
 */
function createUser(req, res) {
    User.register(new User({ username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname }), req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.json({
                Status: "Failed",
                Message: "Username already exists."
            });
        }


        passport.authenticate("local")(req, res, function() {
            return res.json({
                Status: "Success",
                Message: "Successfully created the account."
            });
        })
    });
}

/**
 * Function is only called iff the user is successfully authenticated.
 * @param {*} req 
 * @param {*} res 
 */
function authenticateUser(req, res) {
    return res.json({
        Status: "Success",
        Message: "Successfully authenticated."
    });
}

function destroySession(req, res) {

    req.logout();
    res.json({
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
        return next();
    }
    return res.json({
        Status: "Failed",
        Message: "You need to be logged in to access content."
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
                for (let j = 0; j < selectedCourses[m].timeslots[j]; j++) {
                    if (startTime >= selectedCourses[m].timeslots[j][0] && startTime <= selectedCourses[m].timeslots[1]) {
                        conflict = true;
                        break;
                    }   
                }
            }
        }
        if (conflict == false) {
            selectedCourses.push({"code": data.code, "name": data.name, "instructor": data.meeting_sections[i].instructors, "days": days, "timeslots": timeslots, "colour": ""});
            return true;
        }
    }
    return false;
}

function convertDayToNum(day) {
    var num;
    switch(day) {
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
    switch(day) {
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
 * Relevant routes for courses & navigating Cobalt.
 */
app.get('/search', getCourse);
app.post('/addcourse', insertCourse);
app.post('/removecourse', removeCourse);

//Middleware example
//app.get('/search', isLoggedIn, getCourse);

/**
 * Relevant routes for authentication.
 */
app.post('/login', passport.authenticate('local'), authenticateUser);
app.post('/register', createUser);
app.post('/logout', destroySession);
// app.get('/timetable', generateTimetable);