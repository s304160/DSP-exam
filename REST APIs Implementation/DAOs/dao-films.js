'use strict';

/* Data Access Object (DAO) module for accessing films data */

const db = require('../db');
const dayjs = require("dayjs");

const filters = {
	'filter-all': { label: 'All', id: 'filter-all', filterFn: () => true },
	'filter-favorite': { label: 'Favorites', id: 'filter-favorite', filterFn: film => film.favorite },
	'filter-best': { label: 'Best Rated', id: 'filter-best', filterFn: film => film.rating >= 5 },
	'filter-lastmonth': { label: 'Seen Last Month', id: 'filter-lastmonth', filterFn: film => isSeenLastMonth(film) },
	'filter-unseen': { label: 'Unseen', id: 'filter-unseen', filterFn: film => film.watchDate.isValid() ? false : true }
};


const isSeenLastMonth = (film) => {
	if (film.watchDate == null || typeof film.watchDate.diff !== 'function')
		return false;
	return film.watchDate.diff(dayjs(), 'month') === 0;
};

/** NOTE
 * return error messages as json object { error: <string> }
 */

// This function returns the filters object.
exports.listFilters = () => {
	return filters;
}

// This function retrieves the whole list of films from the database.
exports.getFilmsByOwner = (userId, filter) => {
	return new Promise((resolve, reject) => {
		const sql = 'SELECT * FROM films WHERE owner=?';
		db.all(sql, [userId], (err, rows) => {
			if (err) { reject(err); return; }

			const films = rows.map((e) => {
				// WARN: the database returns only lowercase fields. So, to be compliant with the client-side, we convert "watchdate" to the camelCase version ("watchDate").
				const film = Object.assign({}, e, { watchDate: dayjs(e.watchdate) });  // adding camelcase "watchDate"
				delete film.watchdate;  // removing lowercase "watchdate"
				return film;
			});

			// WARN: if implemented as if(filters[filter]) returns true also for filter = 'constructor' but then .filterFn does not exists
			if (filters.hasOwnProperty(filter))
				resolve(films.filter(filters[filter].filterFn));
			else resolve(films);
		});
	});
};

// This function retrieves a film given its id owned by the logged user.
exports.getFilm = (id, userId) => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT * FROM films WHERE
			id=? AND owner = ?`;

		db.get(sql, [id, userId], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			if (row == undefined) {
				resolve({ error: 'Film not found.' });
			} else {
				// WARN: database is case insensitive. Converting "watchDate" to camel case format
				const film = Object.assign({}, row, { watchDate: row.watchdate });  // adding camelcase "watchDate"
				delete film.watchdate;  // removing lowercase "watchdate"
				resolve(film);
			}
		});
	});
};


/**
 * This function adds a new film in the database.
 * The film id is added automatically by the DB, and it is returned as this.lastID.
 */
exports.createFilm = (film, userId) => {
	return new Promise((resolve, reject) => {
		const sql = 'INSERT INTO films (title, owner, private, favorite, watchDate, rating) VALUES(?, ?, ?, ?, ?, ?)';
		db.run(sql, [film.title, userId, film.private, film.favorite, film.watchDate, film.rating], function (err) {
			if (err) {
				console.log(err)
				reject(err);
				return;
			}
			// Returning the newly created object with the DB additional properties to the client.			
			resolve(exports.getFilm(this.lastID));
		});
	});
};

// This function updates an existing film given its id and the new properties.
exports.updateFilm = (id, userId, film) => {
	return new Promise((resolve, reject) => {
		const sql =
			`UPDATE films SET title = ?, private = ?, favorite = ?, watchDate = ?, rating = ?
			WHERE id = ? AND owner = ?`;
		db.run(sql,
			[film.title, film.private, film.favorite, film.watchDate, film.rating,
				id, userId],
			function (err) {
				if (err) {
					reject(err);
					return;
				}
				resolve({ id, film });
			});
	});
};

// This function deletes an existing film given its id.
exports.deleteFilm = (filmId, userId) => {
	return new Promise((resolve, reject) => {
		const sql = 'DELETE FROM films WHERE id = ? and owner = ?';
		db.run(sql, [filmId, userId], (err) => {
			if (err) {
				reject(err);
				return;
			} else
				resolve(null);
		});
	});
}




// This function retrieves a public film given its id.
exports.getPublicFilm = (filmId) => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT * FROM films WHERE
			id=? AND private = 0`;

		db.get(sql, [filmId], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			if (row == undefined) {
				resolve({ error: 'Film not found.' });
			} else {
				// WARN: database is case insensitive. Converting "watchDate" to camel case format
				const film = Object.assign({}, row, { watchDate: row.watchdate });  // adding camelcase "watchDate"
				delete film.watchdate;  // removing lowercase "watchdate"
				resolve(film);
			}
		});
	});
};


// This function retrieves 10 public films.
exports.getPublicFilms = () => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT * FROM films WHERE
			private = 0
			LIMIT 10`;

		db.all(sql, (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			if (row == undefined) {
				resolve({ error: 'Film not found.' });
			} else {
				// WARN: database is case insensitive. Converting "watchDate" to camel case format
				const film = Object.assign({}, row, { watchDate: row.watchdate });  // adding camelcase "watchDate"
				delete film.watchdate;  // removing lowercase "watchdate"
				resolve(film);
			}
		});
	});
};


