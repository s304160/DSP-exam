'use strict'

/* PASSPORT */

module.exports.isLoggedIn = function (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.status(401).json({ error: 'Not authorized' }).end();
	return false;
}





/* RESPONSE */


let ResponsePayload = function (code, payload) {
	this.code = code;
	this.payload = payload;
}

module.exports.respondWithCode = function (code, payload) {
	return new ResponsePayload(code, payload);
}

const writeJson = exports.writeJson = function (response, arg1, arg2) {
	let code;
	let payload;

	if (arg1 && arg1 instanceof ResponsePayload) {
		writeJson(response, arg1.payload, arg1.code);
		return;
	}

	if (arg2 && Number.isInteger(arg2)) {
		code = arg2;
	}
	else {
		if (arg1 && Number.isInteger(arg1)) {
			code = arg1;
		}
	}
	if (code && arg1) {
		payload = arg1;
	}
	else if (arg1) {
		payload = arg1;
	}

	if (!code) {
		// if no response code given, we default to 200
		code = 200;
	}
	if (typeof payload === 'object') {
		payload = JSON.stringify(payload, null, 2);
	}

	response.writeHead(code, { 'Content-Type': 'application/json' });
	response.end(payload);
}