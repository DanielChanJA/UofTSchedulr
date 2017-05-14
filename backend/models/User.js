var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


var userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: String,
    firstname: String,
    lastname: String,
    isAdmin: { type: Boolean, default: false }
});

userSchema.plugin(passportLocalMongoose);


var makeAdmin = function(userid) {

}

var verifyAdmin = function(user) {

}



module.exports = mongoose.model("User", userSchema);