var mongoose = require("mongoose");

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


module.exports = mongoose.model("course", courseSchema);