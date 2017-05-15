var mongoose = require('mongoose');

var timetableSchema = new mongoose.Schema({
    userid: String,
    timetable: Array,
    name: String
});

module.exports = mongoose.model("Timetables", timetableSchema);