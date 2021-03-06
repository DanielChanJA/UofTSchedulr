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

/**
 * Make a user an admin, honestly only admins should be using this.
 */
userSchema.statics.makeAdmin = function(user, cb) {
    userSchema.findOneAndUpdate({ "username": user }, { $set: { isAdmin: true } }, { new: true }, function(err, result) {
        if (err) {
            console.log("Error retrieving user.");
            return cb(null);
        }
        if (result == null) {
            console.log("User does not exist in the database.");
            return cb(null);
        } else {
            return cb(result);
        }
    });
};

/**
 * Verify that the user is an admin. Pass this function the username of the account
 * that you want to verify.
 */
userSchema.statics.verifyAdmin = function(user, cb) {
    userSchema.findOne({ "username": user }, function(err, result) {
        if (err) {
            console.log("Error retrieving user.");
            return cb(null);
        }
        if (result == null) {
            return cb(null);
        } else {
            if (result.isAdmin == true) {
                return cb(true);
            } else {
                return cb(false);
            }
        }
    });
};


module.exports = mongoose.model("User", userSchema);