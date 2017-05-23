var mongoose = require("mongoose");
var fs = require('fs');
var coursesObj = JSON.parse(fs.readFileSync('../UoftSchedulr/uoft-courses/22-05-2017_uoft_timetable.json'));


// ============FOR TESTING ONLY==============
var count = 0;

for (course in coursesObj) {
    if (course === "IFP010Y1-Y-20179") {
        console.log(course);
        console.log(coursesObj[course].meetings);
        for (meeting in coursesObj[course].meetings) {
            console.log(meeting);
            for (day in coursesObj[course].meetings[meeting].schedule) {
                console.log(day);
                console.log(coursesObj[course].meetings[meeting].schedule[day]);
            }
            for (var i = 0; i < coursesObj[course].meetings[meeting].enrollmentControls.length; i++) {
                console.log(coursesObj[course].meetings[meeting].enrollmentControls[i]);
            }
        }
    }

    count += 1;
}

console.log(count);
// ===========================================

var courseSchema = new mongoose.Schema({
    courseId: Number,
    org: String,
    orgName: String,
    courseTitle: String,
    code: String,
    courseDescription: String,
    prerequisite: String,
    corequisite: String,
    exclusion: String,
    recommendedPreparation: String,
    section: String,
    session: String,
    webTimetableInstructions: String,
    breadthCategories: String,
    distributionCategories: String,
    meetings: [{
        meeting: {
            schedule: [{
                day: {
                    meetingDay: String,
                    meetingStartTime: String,
                    meetingEndTime: String,
                    meetingScheduleId: Number,
                    assignedRoom1: String,
                    assignedRoom2: String
                }
            }],
            instructors: [{
                instructor: {
                    instructorId: Number,
                    firstName: String,
                    lastName: String
                }
            }],
            meetingId: Number,
            teachingMethod: String,
            sectionNumber: String,
            subtitle: String,
            cancel: String,
            waitlist: String,
            online: String,
            enrollmentCapacity: Number,
            actualEnrolment: Number,
            actualWaitlist: Number,
            enrollmentIndicator: String,
            meetingStatusNotes: String,
            enrollmentControls: [{
                postId: Number,
                postCode: String,
                postName: String,
                subjectId: Number,
                subjectCode: String,
                subjectName: String,
                designationId: Number,
                designationCode: String,
                designationName: String,
                yearOfStudy: String,
                typeOfProgramId: Number,
                typeOfProgramCode: String,
                typeOfProgramName: String,
                primaryOrgId: Number,
                primaryOrgCode: String,
                primaryOrgName: String,
                secondaryOrgId: Number,
                secondaryOrgCode: String,
                secondaryOrgName: String,
                assocOrgId: Number,
                assocOrgCode: String,
                assocOrgName: String,
                adminOrgId: Number,
                adminOrgCode: String,
                adminOrgName: String
            }]
        }
    }]
});


var init = function() {

    mongoose.connect("mongodb://localhost/schedulr", function(err, db) {
        if (err) {
            console.log("Unable to connect to DB.");
            throw err;
        }
        console.log("Successfully connected to the DB.");

        for (course in coursesObj) {
            console.log(course);
            console.log(coursesObj[course].courseId);
            count += 1;
        }

    });


}


module.exports = mongoose.model("course", courseSchema);