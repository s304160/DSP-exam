'use strict';

/* --- Importing modules --- */
const express = require('express');
const morgan = require('morgan'); // logging middleware
const cors = require('cors');

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


/* --- PASSPORT --- */
const { passport } = require('./utils/passport')

// Creating the session
app.use(session({
	secret: "it is a secret",
	resave: false,
	saveUninitialized: false,
}));
app.use(passport.authenticate('session'));



/* --- init express and set-up the middlewares --- */
app.use(morgan('dev'));
app.use(express.json());

/* --- SCHEMAS --- */
app.use('/JSONSchemas', express.static(path.join(__dirname, '../JSON Schemas')));


// Initialize the Swagger middleware
http.createServer(app).listen(serverPort, function () {
	console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
	console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
});
const port = 'http://localhost:' + serverPort
module.exports = { app, port }


/* ----- API ----- */
require('./api')