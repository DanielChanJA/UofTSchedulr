module.exports = {
    /**
     * Middleware if you want to verify that the user is logged in. Place it inbetween the routes and the function call below.
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    isLoggedIn: function(req, res, next) {
        if (req.isAuthenticated()) {
            console.log("User successfully authenticated.");
            console.log(req.user);
            console.log(req.isAuthenticated());
            return next();
        }

        console.log(req.user);
        return res.status(401).json({
            Status: "Failed",
            Message: "You need to be logged in to access content."
        });
    },

    /**
     * Middleware if you want to verify that the user is an admin. Place it inbetween the routes and the function call below.
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    isAdminLoggedIn: function(req, res, next) {
        if (req.isAuthenticated() && req.user.username == "danielja.chan@mail.utoronto.ca") {
            console.log("User is an administrator.");
            console.log(req.user);
            return next();
        }

        return res.status(403).json({
            Status: "Failed",
            Message: "You need to be an admin to view content."
        });
    }
}