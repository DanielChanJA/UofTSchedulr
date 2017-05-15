var mongoose = require('mongoose');

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
module.exports = mongoose.model("CourseData", courseDatabase);