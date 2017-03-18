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
var timetableIds = [];

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

// users schema
var userSchema = new mongoose.Schema({
    email: String,
    password: String,
    firstname: String,
    lastname: String
});

var Users = mongoose.model("Users", userSchema);

// comments/feedback
var commentSchema = new mongoose.Schema({
    email: String,
    comment: String
});

var Comment = mongoose.model("Comment", commentSchema);

loadCourses();


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
 * This function retrieves all comments from DB.
 * 
 * returns JSON     {
                    "user": "messages",
                    "vicnent2": "messages23124"
                    }
 */
function retrieveCommentAll(req, res) {
    Comment.find({}, function(err, users) {
        if (err) {
            console.log("error");
            throw err;
        } else {
            var userMap = {};

            users.forEach(function(user) {
                userMap[user.email] = user.comment;
            });
            res.send(userMap);
            console.log(userMap);
        }
    });
}


/**
 * This function posts comments from the about us page to the DB.
 * 
 */
function insertComment(req, res) {
    if (req.body.email == null) {
        console.log("Failed");
        console.log(req.body);
    }
    var email = req.body.email;
    var comment = req.body.comment;
    console.log("Username: " + email);
    console.log("Comment: " + comment);

    //////

    Comment.findOne({ "email": email }, function(err, commentResult) {
        if (err) {
            console.log("Error retrieving users.");
            return res.json({
                Status: "Failed",
                Message: "Error retrieving data."
            });
        }

        if (commentResult == null) {
            Comment.create({
                "email": email,
                "comment": comment,
            }, function(err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(commentResult);
                }
            });

            console.log("Created comment entry from: " + email);
            return res.json({
                Status: "Success",
                Message: "Entry inserted comment into DB."
            });

        } else {
            console.log("DB contains entry: " + commentResult.email + " : " + commentResult.comment);
            return res.json({
                Status: "Failed",
                Message: "Entry exists in DB"
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
                for (let j = 1; j < selectedCourses[m].timeslots[j]; j++) {
                    if (startTime >= selectedCourses[m].timeslots[j][0] && startTime <= selectedCourses[m].timeslots[1]) {
                        conflict = true;
                        break;
                    }
                }
            }
        }
        if (conflict == false) {
            selectedCourses.push({ "code": data.code, "name": data.name, "instructor": data.meeting_sections[i].instructors, "days": days, "timeslots": timeslots, "colour": "" });
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
                // return true;
            } else {
                var courseInfo = JSON.parse(body);
                console.log("Attempting to insert...");
                console.log(courseInfo);

                CourseData.insertMany(courseInfo, function(err, docs) {
                    if (err) {
                        console.log("Failed to add set into database.");
                        // return true;
                    } else {
                        console.log(docs.length + " courses were successfully inserted into the database.");
                        // return false;
                    }
                });
            }
        });

        console.log("End of iteration.");
        skip = skip + 100;

    }
}


function newTimetable(req, res) {
    var id = Math.floor(Math.random() * 1000000) + 1;
    selectedCourses = [];
    while (contains(id, timetableIds)) {
        id = Math.floor(Math.random() * 1000000) + 1;
    }
    selectedCourses.push(id);
    timetableIds.push(id);
    res.sendStatus(200);
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
    if (req.body.userid == null) {
        console.log("Failed");
    }

    var userid = req.body.userid;
    var query = { "userid": userid, "timetableid": selectedCourses[0] }
    Course.findOneAndUpdate(query, selectedCourses, { upsert: true }, function(err, result) {
        if (err) {
            console.log("Error");
            return res.json({
                Status: "Failed",
                Message: "Failed ot save timetable"
            });
        }
    });
}


/**
 * Routes for about us / comment. 
 */
app.post('/addcomment', insertComment);
app.get('/getcomment', retrieveCommentAll); // for devs

/**
 * Relevant routes for courses & navigating Cobalt.
 */
app.get('/search', getCourse);
app.post('/addcourse', insertCourse);
app.post('/removecourse', removeCourse);
app.get('/newtimetable', newTimetable);
app.put('/savetimetable', isLoggedIn, saveTimetable);

//Middleware example
//app.get('/search', isLoggedIn, getCourse);

/**
 * Relevant routes for authentication.
 */
app.post('/login', passport.authenticate('local'), authenticateUser);
app.post('/register', createUser);
app.post('/logout', destroySession);
// app.get('/timetable', generateTimetable);