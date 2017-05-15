var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    email: String,
    comments: [{
        type: String
    }]
});

module.exports = mongoose.model("Comment", commentSchema);