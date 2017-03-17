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

// comments/feedback
var commentSchema = new mongoose.Schema({
    email: String,
    comments: String
});

var Comment = mongoose.model("Comment", commentSchema);




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
 * This function posts comments from the about us page to the DB.
 * 
 */
function insertComment(req, res) {
    if (req.body.userid == null) {
        console.log("Failed");
        console.log(req.body);
    }
    var userid = req.body.userid;
    var comment = req.body.comment;
    console.log("Username: " + userid);
    console.log("Comment: " + userid);
    //////

    Comment.findOne({ "userid": userid }, function(err, commentResult) {
        if (err) {
            console.log("Error retrieving users.");
            return res.json({
                Status: "Failed",
                Message: "Error retrieving data."
            });
        }

        if (commentResult == null) {
            Course.create({
                "userid": userid,
                "comment": course,
            }, function(err, course) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(commentResult);
                }
            });

            console.log("Created comment entry from: " + userid);
            return res.json({
                Status: "Success",
                Message: "Entry inserted comment into DB."
            });

        } else {
            console.log("DB contains entry: " + commentResult.userid + " : " + commentResult.comment);
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
    var course = req.body.courseid + req.body.sem;
    var section = req.body.lecture;

    console.log("Username: " + userid);
    console.log("Course: " + course);
    console.log("Section: " + section);


    // Will not allow users to add multiple lecture sections of the same course. Only one is permitted.
    Course.findOne({ "userid": userid, "courseid": course }, function(err, courseResult) {
        if (err) {
            console.log("Error retrieving users.");
            return res.json({
                Status: "Failed",
                Message: "Error retrieving data."
            });
        }

        if (courseResult == null) {
            Course.create({
                "userid": userid,
                "courseid": course,
                "lecture": section
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
            console.log("DB contains entry: " + courseResult.userid + " : " + courseResult.courseid + " : " + courseResult.lecture);
            return res.json({
                Status: "Failed",
                Message: "Entry exists in DB"
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
    var course = req.body.courseid + req.body.sem;
    var section = req.body.lecture;

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


/**
 * Routes for about us / comment. 
 */
app.post('/addcomment', insertComment);
app.get('/getcomment', retrieveComment); // for devs


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