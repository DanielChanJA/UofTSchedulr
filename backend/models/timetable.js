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


timetableSchema.statics.createTimetable = function() {

}

timetableSchema.statics.updateTimetable = function(tId) {

}

timetableSchema.statics.deleteTimetable = function(tId) {

}

timetableSchema.statics.getAllTimetablesByUser = function(userid) {

}

module.exports = mongoose.model("timetable", timetableSchema);