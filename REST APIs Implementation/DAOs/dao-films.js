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


//#region GET multiple


// This function retrieves 10 public films.
exports.getPublicFilmList = (page = 1) => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT id, title, owner, private FROM films WHERE
			private = 0
			ORDER BY id
			LIMIT 10
			OFFSET ?`;

		db.all(sql, [10 * (page - 1)], (err, rows) => {
			if (err) {
				reject(err);
				return;
			}
			if (rows === undefined || rows.length === 0)
				resolve(null);

			const films = rows.map((f) => {
				//attach URI
				f['URI'] = port + '/films/' + f.id

				return f;
			});
			resolve(films);

		});
	});
};


// This function retrieves the whole list of films from the database.
exports.getOwnedFilmList = (userId, page = 0) => {
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

			const films = rows.map((f) => {
				// let film = Object.assign({}, f, { watchDate: dayjs(f.watchdate) });
				// delete film.watchdate;

				//attach URI
				f['URI'] = port + '/films/' + f.id

				return f;
			});
			resolve(films);
		});
	});
};


// This function retrieves the whole list of films from the database.
exports.getFilmsToReviewList = (userId, page = 0) => {
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

			const films = rows.map((f) => {
				let film = Object.assign({}, f, { watchDate: dayjs(f.watchdate) });
				delete film.watchdate;

				//attach URI
				film['URI'] = port + '/films/' + film.id

				return film;
			});
			resolve(films);
		});
	});
};





//#endregion



//#region GET single


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



/**
 * This function retrieves a film owned by the logged user given its id.
 */
exports.getOwnedFilm = (id, userId) => {
	return new Promise((resolve, reject) => {
		const sql = `SELECT * FROM films WHERE id = ?`;

		db.get(sql, [id], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			if (row === undefined) {
				resolve(null);
				return;
			}
			if (!row.private) {
				resolve({
					id: row.id,
					title: row.title,
					owner: row.owner,
					private: row.private
				})
				return;
			}

			if (row.owner === userId) {
				resolve(row);
				return;
			}

			resolve(false);
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
				resolve(exports.getOwnedFilm(this.lastID, film.owner));
			});
	});
};

// This function updates an existing film given its id and the new properties.
exports.updateFilm = (id, userId, film) => {
	return new Promise((resolve, reject) => {
		let sql = `UPDATE films SET `;
		if (film.title !== undefined) sql += `title = "${film.title}", `;
		if (film.favorite !== undefined) sql += `favorite = ${film.favorite}, `;
		if (film.watchDate !== undefined) sql += `watchDate = "${film.watchDate}", `;
		if (film.rating !== undefined) sql += `rating = ${film.rating}, `;

		sql += ` owner = ? WHERE id = ? AND owner = ?`;
		db.run(sql,
			[userId, id, userId],
			function (err, result) {
				if (err) {
					reject(err);
					return;
				}
				if (this.changes === 0) {
					resolve(null)
				}
				resolve(exports.getOwnedFilm(id, userId));
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

