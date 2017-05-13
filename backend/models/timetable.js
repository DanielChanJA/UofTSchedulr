var mongoose = require("mongoose");
var course = require("course");

var timetableSchema = new mongoose.Schema({
    userid: Number,
    timetableName: String,
    createdAt: Date,
    lastUpdatedAt: Date,
    note: String,
    courses: [course]
});


module.exports = mongoose.model("timetable", timetableSchema);