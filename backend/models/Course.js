var mongoose = require("mongoose");

var courseSchema = new mongoose.Schema({
    // You need to decide what's relevant here and what is needed.
});


module.exports = mongoose.model("course", courseSchema);