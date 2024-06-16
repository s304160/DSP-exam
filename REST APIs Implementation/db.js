'use strict';

/** DB access module **/

const path = require('path');

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database(path.join(__dirname, './database/films.db'), (err) => {
	if (err) throw err;
});

module.exports = db;
