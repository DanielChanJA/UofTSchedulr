# Schedulr [![Build Status](https://travis-ci.org/DanielChanJA/UofTSchedulr.svg?branch=master)](https://travis-ci.org/DanielChanJA/UofTSchedulr)
Schedulr is a web application designed for University of Toronto students to optimize and create their timetables in advance for the upcoming semester.

What makes Schedulr stand out is that it allows students to get a map view of where all their classes are held.

The backend is written in NodeJS, and the frontend is to be re-written in Angular.

The testing framework will be written in Jasmine.


## Developer Instructions
---
If you wish to contribute to this repository please make merge requests for any of the issues and we will review the merge requests.

Schedulr interacts with other external web APIs such as Cobalt to retrieve more information regarding the campus information. As such you will need to provide your own key in `/backend/views/keys.js`

```bash
module.exports({
    "cobaltKey": {The_cobalt_key_from_cobalt}
});
```

You can get a key for free at https://cobalt.qas.im/

## Quickstart
---

Please note that you will need to populate the API keys as defined in backend/keys.js

```bash
 git clone https://github.com/DanielChanJA/UofTSchedulr.git

 cd UoftSchedulr/

 npm install

 npm start

 Open the browser and head to http://localhost:3000/
 ```

## Credits for Images
---
1. https://www.utoronto.ca/sites/default/files/2016-11-14-sitting-students.jpg
2. https://www.utoronto.ca/sites/default/files/Winter-2016-future-banner-v3.jpg
3. https://www.utoronto.ca/sites/default/files/cover-utm-hazel-mccallion-bldg.jpg

## Assets for Icons
---
1. http://fontawesome.io/
