'use strict';

const { passport } = require('../utils/passport.js');
const { body, validationResult, matchedData } = require('express-validator');
// const userSchema = require('../schemas/user.json')
// const utils = require('../utils/utils.js');


module.exports.userValidation = () =>
	[body('email').notEmpty().isEmail(),
	body('password').notEmpty()]


module.exports.userLogin = function userLogin(req, res, next) {

	const result = validationResult(req);
	if (result.isEmpty()) {
		// const data = matchedData(req);


		passport.authenticate('local', (err, user, info) => {
			if (err)
				return next(err);
			if (!user) {
				// display wrong login messages				
				return res.status(401).json({ error: info });
			}
			// success, perform the login and extablish a login session

			req.login(user, (err) => {
				if (err)
					return next(err);

				// req.user contains the authenticated user, we send all the user info back
				// this is coming from userDao.getUser() in LocalStratecy Verify Fn
				return res.json(req.user); // WARN: returns 200 even if .status(200) is missing?
			});
		})(req, res, next);
	} else {
		res.status(400).send({ error: "Invalid username/password" }).end()
	}
};


module.exports.userLogout = function userLogout(req, res, next) {

	req.logout(function (err) {
		if (err) {
			res.status(500).send({ error: err }).end();
			return;
		}

		res.status(204).send("Logout Successful.").end();
	});
};



module.exports.userInfo = function userInfo(req, res, next) {
	res.status(200).send(req.user)
}