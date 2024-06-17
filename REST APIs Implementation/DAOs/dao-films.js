'use strict';

/* Data Access Object (DAO) module for accessing films data */

const db = require('../db');
const dayjs = require("dayjs");
const { port } = require('../index.js')

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


//#region GET


/**
 * This function retrieves a film owned by the logged user given its id.
 */
exports.getFilm = (id, userId) => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT * FROM films WHERE
			id = ? AND owner = ?`;

		db.get(sql, [id, userId], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			if (row === undefined)
				resolve(null);

			// WARN: database is case insensitive. Converting "watchDate" to camel case format
			const film = Object.assign({}, row, { watchDate: row.watchdate });  // adding camelcase "watchDate"
			delete film.watchdate;  // removing lowercase "watchdate"
			resolve(film);

		});
	});
};


// This function retrieves the whole list of films from the database.
exports.getFilmsByOwner = (userId, page = 0) => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT * FROM films
			WHERE owner = ?
			ORDER BY id
			LIMIT 10 OFFSET ?`;
		db.all(sql, [userId, 10 * page], (err, rows) => {
			if (err) {
				reject(err);
				return;
			}

			if (rows === undefined || rows.length === 0)
				resolve(null);

			const films = rows.map((e) => {
				const film = Object.assign({}, e, { watchDate: dayjs(e.watchdate) });
				delete film.watchdate;

				//attach URI
				film['URI'] = port + '/film/' + film.id

				return film;
			});
			resolve(films);
		});
	});
};




// This function retrieves the whole list of films from the database.
exports.getFilmsToReview = (userId, page = 0) => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT * FROM films, reviews
			WHERE 	reviewerId = ?
			AND		completed = 0
			ORDER BY id
			LIMIT 10 OFFSET ?`;
		db.all(sql, [userId, 10 * page], (err, rows) => {
			if (err) {
				reject(err);
				return;
			}

			if (rows === undefined || rows.length === 0)
				resolve(null);

			const films = rows.map((e) => {
				console.log(e.watchdate);
				const film = Object.assign({}, e, { watchDate: dayjs(e.watchdate) });
				delete film.watchdate;

				//attach URI
				film['URI'] = port + '/film/public/' + film.id

				return film;
			});
			resolve(films);
		});
	});
};


//#endregion 



//#region  CRUD



/**
 * This function adds a new film in the database.
 * The film id is added automatically by the DB, and it is returned as this.lastID.
 */
exports.createFilm = (film) => {
	return new Promise((resolve, reject) => {
		const sql =
			`INSERT INTO films (title, owner, private, favorite, watchDate, rating)
			VALUES(?, ?, ?, ?, ?, ?)`;
		db.run(sql, [film.title, film.owner, film.private, film.favorite, film.watchDate, film.rating],
			function (err) {
				if (err) {
					console.log(err)
					reject(err);
					return;
				}

				// Returning the newly created object with the DB additional properties to the client.			
				resolve(exports.getFilm(this.lastID, film.owner));
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
			[film.title, film.private, film.favorite, film.watchDate, film.rating, id, userId],
			function (err, result) {
				if (err) {
					reject(err);
					return;
				}
				if (this.changes === 0) {
					resolve(null)
				}
				resolve(exports.getFilm(id, userId));
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
			}
			if (this.changes === 0) {
				resolve(null)
			}

			resolve(true);
		});
	});
}

//#endregion 

//#region PUBLIC

// This function retrieves a public film given its id.
exports.getPublicFilm = (filmId) => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT id, title, owner, private FROM films WHERE
			id = ? AND private = 0`;

		db.get(sql, [filmId], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			if (row === undefined) {
				resolve(null);
			}

			resolve(row)
		});
	});
};


// This function retrieves 10 public films.
exports.getPublicFilms = (page = 0) => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT id, title, owner, private FROM films WHERE
			private = 0
			ORDER BY id
			LIMIT 10
			OFFSET ?`;

		db.all(sql, [10 * page], (err, rows) => {
			if (err) {
				reject(err);
				return;
			}
			if (rows === undefined || rows.length === 0)
				resolve(null);

			const films = rows.map((f) => {
				//attach URI
				f['URI'] = port + '/film/public/' + f.id

				return f;
			});
			resolve(films);

		});
	});
};


//#endregion PUBLIC
