'use strict';

/*** Importing modules ***/
const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');

/** Validation-related imports **/
const { ValidationError } = require("express-json-validator-middleware");


const path = require('path');
const http = require('http');
const oas3Tools = require('oas3-tools');
const serverPort = 8080;

const session = require('express-session');

// swaggerRouter configuration
const options = {
	routing: {
		controllers: path.join(__dirname, './controllers')
	},
};

const expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, '../REST APIs Design/openapi.yaml'), options);
const app = expressAppConfig.getApp();





/*** Passport ***/
const { passport } = require('./components/passport')

// Creating the session
app.use(session({
	secret: "it is a secret",
	resave: false,
	saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/*** init express and set-up the middlewares ***/
app.use(morgan('dev'));
app.use(express.json());

app.use((error, request, response, next) => {
	// Check the error is a validation error
	if (error instanceof ValidationError) {
		// Handle the error
		response.status(400).send(error.validationErrors);
		next();
	} else {
		// Pass error on if not a validation error
		next(error);
	}
});


// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
	console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
	console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});

module.exports = { app }

/* ----- API ----- */
require('./api')
