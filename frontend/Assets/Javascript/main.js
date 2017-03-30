var colours = ["#dd1c1a", "#f0c808", "#06aed5", "#fff1d0", "#4abdac", "#fc4a1a", "#f7b733", "#007849", "#a239ca", "#e37222"];
var daysOTW = ["M", "T", "W", "TH", "F"];

var schedule = [];


// Media query for mobile devices (max: iPad portrait - 1px)
var mediaQueryMobile = window.matchMedia("(max-width: 767px)");
if (mediaQueryMobile.matches) {
    refreshSmallTable();
}


// Media query for tablets (min: iPad portrait)
var mediaQueryTablet = window.matchMedia("(min-width: 768px)");
if (mediaQueryTablet.matches) {
    refreshLargeTable();
}

checkLogin();


function checkLogin() {
    $.ajax({
        type: "GET",
        url: "/isLoggedIn",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(response) {
            return console.log("You are logged in.");
        },
        error: function(response) {
            return console.log(response);
        }
    });
}



// Refresh table based on resize
// Don't refresh if it is within a boundary
var currWidth = window.innerWidth;
window.onresize = function() {
    if (window.innerWidth < 768) {
        if (currWidth >= 768) {
            refreshSmallTable();
            currWidth = window.innerWidth;
        }
    } else {
        if (currWidth < 768) {
            refreshLargeTable();
            currWidth = window.innerWidth;
        }
    }
}


function refreshTable() {
    if (window.innerWidth < 768) {
        refreshSmallTable();
    } else {
        refreshLargeTable();
    }
}


function refreshSmallTable() {
    changeHeaderDay(0);

    // Remove previous elements
    var scheduleContainer = document.getElementsByClassName("schedule-container")[0];
    while (scheduleContainer.firstChild) {
        scheduleContainer.removeChild(scheduleContainer.firstChild);
    }

    // Create the required table elements
    for (let i = 0; i < 5; i++) {
        var table = document.createElement("table");
        table.className = "schedule schedule-" + daysOTW[i] + " center-x";
        scheduleContainer.appendChild(table);
    }

    // Create the table rows for each day
    for (let i = 0; i < daysOTW.length; i++) {
        createDayTable(daysOTW[i], i);
    }

    // Populate the days
    var days = document.getElementsByClassName("schedule");
    populateDaysSmall(days);

    //Buttons
    var currDay = 0;
    var prevDay = document.getElementsByClassName("prev-day")[0];
    prevDay.addEventListener("click", function() {
        days[currDay].style.display = "none";

        // If it is the first day of the week
        if (currDay == 0) {
            days[days.length - 1].style.display = "table";
            currDay = days.length - 1;
        } else {
            days[currDay - 1].style.display = "table"
            currDay -= 1;
        }
        changeHeaderDay(currDay);
    });

    var nextDay = document.getElementsByClassName("next-day")[0];
    nextDay.addEventListener("click", function() {
        days[currDay].style.display = "none";

        // If it is the last day of the week
        if (currDay == days.length - 1) {
            days[0].style.display = "table";
            currDay = 0;
        } else {
            days[currDay + 1].style.display = "table";
            currDay += 1;
        }
        changeHeaderDay(currDay);
    });
}


function refreshLargeTable() {
    // Remove previous elements
    var scheduleContainer = document.getElementsByClassName("schedule-container")[0];
    while (scheduleContainer.firstChild) {
        scheduleContainer.removeChild(scheduleContainer.firstChild);
    }

    // Create empty table elements
    var scheduleContainer = document.getElementsByClassName("schedule-container")[0];
    var table = document.createElement("table");
    table.className = "schedule center-x";
    scheduleContainer.appendChild(table);

    // Create row for days
    var row = table.insertRow(0);
    row.style.height = "50px";
    for (let i = 0; i < 6; i++) {
        var cell = row.insertCell(i);
        if (i != 0) {
            cell.innerHTML = daysOTW[i - 1];
        }
    }

    // Create rows for courses
    var counter = 9;
    for (let i = 1; i < 13; i++) {
        var row = table.insertRow(i);
        if (counter == 13) {
            counter = 1;
        }
        row.timeStart = counter;
        row.style.height = "50px";
        for (let i = 0; i < 6; i++) {
            row.insertCell(i);
            if (i == 0) {
                row.cells[i].innerHTML = counter + ":00";
            } else {
                row.cells[i].day = daysOTW[i - 1];
            }
        }
        counter++;
    }

    // Populate each row
    populateDaysLarge(table);
}


// Create rows for an empty table for one day
function createDayTable(day, num) {
    var className = "schedule-" + day;
    var table = document.getElementsByClassName(className)[0];
    table.day = day;

    // Temporarily remove the table if it is not Monday
    if (table.day != "M") {
        table.style.display = "none";
    }

    // Create the table
    var counter = 9;
    for (let i = 0; i < 12; i++) {
        var row = table.insertRow(i);
        if (counter == 13) {
            counter = 1;
        }
        row.timeStart = counter;
        row.style.height = "50px";
        var time = row.insertCell(0);
        time.innerHTML = counter + ":00";
        var course = row.insertCell(1);
        counter++;
    }
}


// Find the right spots to insert courses for single day timetables
function populateDaysSmall(days) {
    for (let i = 0; i < days.length; i++) {
        for (let k = 0; k < schedule.length; k++) {
            if (checkDay(days[i].day, schedule[k].days)) {
                for (let n = 0; n < days[i].rows.length; n++) {
                    if (days[i].rows[n].timeStart == schedule[k].time[0]) {
                        insertCourse(days[i].rows[n].cells[1], schedule[k]);
                        if (schedule[k].time[1] > 1) {
                            for (let m = 1; m < schedule[k].time[1]; m++) {
                                extendCourse(days[i].rows[n + m].cells[1], schedule[k], m, schedule[k].time[1]);
                            }
                        }
                    }
                }
            }
        }
    }
}


// Find the right spots to insert courses for weekly timetable
function populateDaysLarge(table) {
    for (let i = 1; i < table.rows.length; i++) {
        for (let k = 1; k < table.rows[i].cells.length; k++) {
            for (let n = 0; n < schedule.length; n++) {
                if (checkDay(table.rows[i].cells[k].day, schedule[n].days)) {
                    if (table.rows[i].timeStart == schedule[n].time[0]) {
                        insertCourse(table.rows[i].cells[k], schedule[n]);
                        if (schedule[n].time[1] > 1) {
                            for (let m = 1; m < schedule[n].time[1]; m++) {
                                extendCourse(table.rows[i + m].cells[k], schedule[n], m, schedule[n].time[1]);
                            }
                        }
                    }
                }
            }
        }
    }
}


// Insert the course after finding the right spot
function insertCourse(cell, course) {
    cell.innerHTML = course.code;
    cell.style.borderBottom = "none";
    cell.style.backgroundColor = course.colour;
    cell.addEventListener("click", function() {
        displayCourse(course);
    });
}


// Extend the course if the duration is longer than an hour
function extendCourse(cell, course, n, m) {
    if (n != m - 1) {
        cell.style.borderBottom = "none";
    }
    cell.style.borderTop = "none";
    cell.style.backgroundColor = course.colour;
    cell.addEventListener("click", function() {
        displayCourse(course);
    });
}


// Check if day is in lst
function checkDay(day, lst) {
    for (let i = 0; i < lst.length; i++) {
        if (day == lst[i]) {
            return true;
        }
    }
    return false;
}


// Change the header for the schedule
function changeHeaderDay(day) {
    var newDay;
    switch (day) {
        case 0:
            newDay = "Monday";
            break;
        case 1:
            newDay = "Tuesday";
            break;
        case 2:
            newDay = "Wednesday";
            break;
        case 3:
            newDay = "Thursday";
            break;
        case 4:
            newDay = "Friday";
            break;
        default:
            break;
    }
    var headerDay = document.getElementsByClassName("header-day")[0];
    headerDay.innerHTML = newDay;
}


// Interpret the days from search result
function interpretDay(day) {
    switch (day) {
        case "MONDAY":
            return "M";
        case "TUESDAY":
            return "T";
        case "WEDNESDAY":
            return "W";
        case "THURSDAY":
            return "TH";
        case "FRIDAY":
            return "F";
        default:
            break;
    }
}


// Display course information mdoal
var modals = document.getElementsByClassName("modal-container");

function displayCourse(course) {
    var modalContainer = modals[1];
    modalContainer.style.display = "block";
    var modal = modalContainer.childNodes[1];
    modal.childNodes[1].innerHTML = course.code;
    modal.childNodes[5].innerHTML = course.name;
    modal.childNodes[9].innerHTML = course.instructor;
    var time = "";
    for (let i = 0; i < course.days.length; i++) {
        time += course.days[i] + " "
    }
    time += "<br>" + course.time[0] + ":00";
    modal.childNodes[13].innerHTML = time;
}


// If user clicks outside of course information modal
window.addEventListener("click", function(event) {
    switch (event.target) {
        case modals[0]:
            modals[0].style.display = "none";
            modals[0].childNodes[1].childNodes[3].value = "";
            modals[0].childNodes[1].childNodes[5].value = "";
            break;
        case modals[1]:
            modals[1].style.display = "none";
            break;
        default:
            break;
    }
});


// Second sign in button
var buttonSignIn2 = document.getElementsByClassName("button-sign-in2")[0];
buttonSignIn2.addEventListener("click", function() {
    modals[0].style.display = "none";
    modals[0].childNodes[1].childNodes[3].value = "";
    modals[0].childNodes[1].childNodes[5].value = "";
})


function checkConflict(course) {
    var course;
    var days;
    var time;
    var timeStart;
    $.ajax({
        type: "POST",
        url: "/addcourse",
        data: JSON.stringify(course),
        contentType: "application/json; charset=utf-8",
        success: function(res) {
            if (res == false) {
                alert("There is a conflict.");
            } else {
                for (let m = 0; m < schedule.length; m++) {
                    colours.push(schedule[m].colour);
                }
                schedule = res;
                for (let i = 0; i < schedule.length; i++) {
                    days = [];
                    time = [];
                    for (let k = 0; k < schedule[i].days.length; k++) {
                        days.push(schedule[i].days[k][0]);
                    }
                    timeStart = schedule[i].days[0][1];
                    if (timeStart > 12) {
                        timeStart -= 12;
                    }
                    time.push(timeStart);
                    time.push(schedule[i].duration / 3600);
                    schedule[i].days = days;
                    schedule[i].time = time;
                    schedule[i].instructor = schedule[i].instructor[0];
                    schedule[i].colour = colours[0];
                    colours.shift();
                }
                refreshTable();
            }
        }
    });
}


// CRUD functions
// Search for a course
$(".search-bar-btn").on("click", function() {
    var code = $("input[name='search']").val();
    if (code == "") {
        alert("You must input a course code.");
    } else {
        $.ajax({
            type: "GET",
            url: "/coursesearch",
            data: { code: code },
            contentType: "application/json; charset=utf-8",
            success: function(res) {
                if (res == "") {
                    alert("Course not found. Search is case sensitive, and must be the full course code (Ex: CSC108H1F).");
                } else {
                    $(".course-code").html(res[0].code);
                    $(".course-name-title").html("Course Name:" + "&nbsp;&nbsp;&nbsp;&nbsp;" + res[0].name);
                    // $(".course-name").html(res[0].name);
                    $(".course-department").html('Department:' + "&nbsp;&nbsp;&nbsp;&nbsp;" + res[0].department);
                    $(".course-prereq").html("Prerequisites:" + "&nbsp;&nbsp;&nbsp;&nbsp;" + res[0].prerequisites);
                    $(".show-more-button").show();
                    // show more

                    $(".course-description").html("Description:" + "&nbsp;&nbsp;&nbsp;&nbsp;" + res[0].description);
                    $(".course-exclusions").html("Exclusions:" + "&nbsp;&nbsp;&nbsp;&nbsp;" + res[0].exclusions);
                    $(".course-campus").html("Campus:" + "&nbsp;&nbsp;&nbsp;&nbsp;" + res[0].campus);
                    $(".course-breadths").html("Breadths:" + "&nbsp;&nbsp;&nbsp;&nbsp;" + res[0].breadths);

                    $(".course-sections").html("Sections");
                    var sections = $(".sections");
                    sections.empty();
                    $.each(res[0].meeting_sections, function(i, section) {
                        sections.append("<input type='radio' name='section' value='" + res[0].meeting_sections[i].code + "'> " + res[0].meeting_sections[i].code + "<br>");
                    });

                    $(".course-info .center-x").append(sections); //replaced div with .center-x
                    $(".button-add-class").prop("disabled", false);
                    if (window.innerWidth < 768) {
                        window.scrollTo(0, document.body.scrollHeight);
                    }
                }
            }
        });
    }
});

$(".show-more-button").click(function() {
    $(".show-more-class").slideToggle();
    if ($(".show-more-button").text() == "show more") {
        $(".show-more-button").text("show less");
    } else {
        $(".show-more-button").text("show more");
    }
});


// Add a course that was searched
$(".button-add-class").on("click", function() {
    let code = $("input[name='search']").val();
    if (code == "") {
        alert("You must select a section");
    } else {
        $.ajax({
            type: "GET",
            url: "/coursesearch",
            data: { code: code },
            contentType: "application/json; charset=utf-8",
            success: function(res) {
                let course = { data: res };
                checkConflict(course);
            }
        });
    }
});


// Delete a course which was clicked on the timetable
$(".btn-delete-course").on("click", function() {
    var code = $(".modal-course-info h2").text();
    for (let i = 0; i < schedule.length; i++) {
        if (schedule[i].code == code) {
            colours.push(schedule[i].colour);
        }
    }
    $.ajax({
        type: "DELETE",
        url: "/removecourse",
        data: JSON.stringify({ code: code }),
        contentType: "application/json; charset=utf-8",
        success: function(res) {
            schedule = res;
            refreshTable();
            $(".modal-container").css("display", "none");
        }
    });
});