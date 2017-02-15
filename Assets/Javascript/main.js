var courses = [
    {
        "code": "CSC300",
        "name": "Computers and Society",
        "instructor": "Jeremy Sills",
        "days": ["M"],
        "time": [11, 1],
        "colour": "#dd1c1a"
    },
    {
        "code": "CSC301",
        "name": "Introduction to Software Engineering",
        "instructor": "Joey Freund",
        "days": ["T"],
        "time": [4, 1],
        "colour": "#f0c808"
        
    },
    {
        "code": "CSC302",
        "name": "Engineering Large Software Systems",
        "instructor": "Joe",
        "days": ["M"],
        "time": [1, 2],
        "colour": "#06aed5"
    }
];

var schedule = [
    {
        "code": "CSC300",
        "name": "Computers and Society",
        "instructor": "Jeremy Sills",
        "days": ["M"],
        "time": [11, 1],
        "colour": "#dd1c1a"
    },
    {
        "code": "CSC301",
        "name": "Introduction to Software Engineering",
        "instructor": "Joey Freund",
        "days": ["T"],
        "time": [4, 1],
        "colour": "#f0c808"
        
    },
    {
        "code": "CSC302",
        "name": "Engineering Large Software Systems",
        "instructor": "Joe",
        "days": ["M"],
        "time": [1, 3],
        "colour": "#06aed5"
    }
];

var colours = ["#dd1c1a", "#f0c808", "#06aed5", "#fff1d0"];
var coloursPicked = [];
var daysOTW = ["M", "T", "W", "TH", "F"];

// Media query for mobile devices
var mediaQueryMobile = window.matchMedia("(max-width: 736px)");
if (mediaQueryMobile.matches) {
    // Create the table for each day
    for (let i = 0; i < daysOTW.length; i++) {
        createDayTable(daysOTW[i]);
    }
    
    // Populate the days
    var days = document.getElementsByClassName("schedule");
    populateDays(days);
}


// Create an empty table for one day
function createDayTable(day) {
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


function checkDay(day, lst) {
    for (let i = 0; i < lst.length; i++) {
        if (day == lst[i]) {
            return true;
        }
    return false;
    }
}


function populateDays() {
    for (let i = 0; i < days.length; i++) {
        for (let k = 0; k < schedule.length; k++) {
            if (checkDay(days[i].day, schedule[k].days)) {
                for (let n = 0; n < days[i].rows.length; n++) {
                    if (days[i].rows[n].timeStart == schedule[k].time[0]) {
                        days[i].rows[n].cells[1].innerHTML = schedule[k].code;
                        days[i].rows[n].cells[1].style.borderBottom = "none";
                        days[i].rows[n].cells[1].style.backgroundColor = schedule[k].colour;
                        if (schedule[k].time[1] > 1) {
                            for (let m = 1; m < schedule[k].time[1]; m++) {
                                days[i].rows[n+m].cells[1].style.borderTop = "none";
                                days[i].rows[n+m].cells[1].style.borderBottom = "none";
                                days[i].rows[n+m].cells[1].style.backgroundColor = schedule[k].colour;
                            }
                        }
                    }
                }
            }
        }
    }   
}

