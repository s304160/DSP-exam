/** Authentication-related imports **/
const passport = require('passport');
const LocalStrategy = require('passport-local');


const userDao = require('../DAOs/dao-users'); // module for accessing the user table in the DB

// Set up local strategy to verify, search in the DB a user with a matching password, and retrieve its information by userDao.getUser (i.e., id, username, name).
passport.use(new LocalStrategy(async function verify(username, password, cb) {
	const user = await userDao.getUser(username, password)
	if (!user)
		return cb(null, false, 'Incorrect username or password');

	return cb(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, cb) { // this user is id + username + name 
	cb(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, cb) { // this user is id + email + name 
	// if needed, an extra check can be done here
	return cb(null, user); // this will be available in req.user
});

module.exports = { passport }