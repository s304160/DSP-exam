'use strict';

/* Data Access Object (DAO) module for accessing like data */

const db = require('../db');

// This function retrieves all the likes of a film
exports.getFilmLikes = (filmId) => {
	return new Promise((resolve, reject) => {

		let totLikes = 0;

		const likesQuery =
			`SELECT COUNT(*) AS totLikes  FROM likes
			WHERE filmId = ?`;

		db.get(likesQuery, [filmId], (err, row) => {
			if (err) {
				reject(err);
				return;
			}

			console.log(JSON.stringify(row));

			if (row === undefined || row.totLikes === 0) {
				resolve(null);
				return;
			}

			totLikes = row.totLikes;

		});


		const users =
			`SELECT u.id, u.email, u.name
			FROM likes l, users u
			WHERE l.userId = u.id
			AND l.filmId = ?`;

		db.all(users, [filmId], (err, rows) => {
			if (err) {
				reject(err);
				return;
			}

			console.log(JSON.stringify(rows));

			resolve({ totLikes: totLikes, users: rows });
		});
	});
};




/**
 * This function adds a new like in the database. 
 */
exports.addLike = (filmId, userId) => {
	return new Promise((resolve, reject) => {

		const getFilm = `SELECT * FROM films WHERE id = ?`;
		db.get(getFilm, [filmId], (err, row) => {
			if (err) {
				console.error(err)
				reject(err);
				return;
			}

			if (row === undefined) {
				resolve(null)
				return;
			}
		})

		const getLike = `SELECT * FROM likes WHERE filmId = ? AND userId = ?`;
		db.get(getLike, [filmId, userId], (err, row) => {
			if (err) {
				console.error(err)
				reject(err);
				return;
			}

			if (row !== undefined)
				resolve(false)
		})


		const insert = 'INSERT INTO likes (filmId, userId) VALUES(?, ?)';
		db.run(insert, [filmId, userId], function (err) {
			if (err) {
				console.log(err)
				reject(err);
				return;
			}
			resolve(true)
		});
	});
};


/**
 * This function delete a like in the database. 
 */
exports.deleteLike = (filmId, userId) => {
	return new Promise((resolve, reject) => {
		const sql = `DELETE FROM likes WHERE filmId = ? AND userId = ?`;
		db.run(sql, [filmId, userId], function (err, result) {
			if (err) {
				console.log(err)
				reject(err);
				return;
			}

			if (this.changes === 0)
				resolve(null);

			resolve(true);
		});
	});
};
