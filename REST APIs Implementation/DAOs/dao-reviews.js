'use strict';

/* Data Access Object (DAO) module for accessing films data */

const db = require('../db');


/**
 * This function retrieves a film given its id owned by the logged user.
 *  */
exports.getReviews = (filmId) => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT * FROM reviews WHERE
			filmId = ?`;

		db.all(sql, [filmId], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			if (row == undefined) {
				resolve({ error: 'No review found.' });
			} else {
				// WARN: database is case insensitive. Converting "watchDate" to camel case format
				const review = Object.assign({}, row, { reviewDate: row.reviewdate });  // adding camelcase "watchDate"
				delete review.watchdate;  // removing lowercase "reviewdate"
				resolve(review);
			}
		});
	});
};


// This function retrieves a film given its id owned by the logged user.
exports.getReview = (filmId, reviewerId) => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT * FROM reviews WHERE
			filmId = ? AND reviewerId = ?`;

		db.get(sql, [filmId, reviewerId], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			if (row == undefined) {
				resolve({ error: 'Review not found.' });
			} else {
				// WARN: database is case insensitive. Converting "watchDate" to camel case format
				const review = Object.assign({}, row, { reviewDate: row.reviewdate });  // adding camelcase "watchDate"
				delete review.watchdate;  // removing lowercase "reviewdate"
				resolve(review);
			}
		});
	});
};


/**
 * This function adds a new review in the database. 
 */
exports.issueReview = (review, users) => {
	return new Promise((resolve, reject) => {
		const sql =
			`INSERT INTO reviews (filmId, reviewerId, completed)
			VALUES(?, ?, ?)`;

		for (u in users) {
			db.run(sql, [review.filmId, u, false], function (err) {
				if (err) {
					reject(err);
					return;
				}
			});
		}
	});
};

/**
 * This function issue reviews for a film that has no review issued
 * yet maintaining the issued reviews balanced among the users.
 */
exports.issueAutomaticReviews = (filmId) => {
	return new Promise((resolve, reject) => {

		const check = `SELECT COUNT(*) as tot FROM reviews WHERE filmId = ?`;

		db.get(check, [filmId], (err, row) => {
			if (err) {
				console.error(err)
				reject(err);
				return;
			}

			console.log(JSON.stringify(row))

			if (row.tot != 0) {
				console.log(JSON.stringify(row))
				resolve("The film already has at least one review issued.")

			}
			console.log(JSON.stringify(row))

			const getUsers =
				`SELECT reviewerId, COUNT(*) as totReviews
				FROM reviews GROUP BY reviewerId`;

			db.all(getUsers, (err, rows) => {
				if (err) {
					reject(err);
					return;
				}

				console.log(JSON.stringify(rows));

				const avg = rows.reduce(
					(acc, user) => acc + user.totReviews,
					0) / rows.length

				filteredUsers = rows.filter((u) => { u.totReviews < avg })

				console.log(JSON.stringify(filteredUsers));

			})

		})


		const sql =
			`INSERT INTO reviews (filmId, reviewerId, completed)
			VALUES(?, ?, ?)`;

		for (u in users) {
			db.run(sql, [filmId, u, false], (err) => {
				if (err) {
					reject(err);
					return;
				}
			});
		}
		// resolve(true);
	});
};

// This function updates an existing review given its id, the reviewer id and the new properties.
exports.updateReview = (filmId, reviewerId, review) => {
	return new Promise((resolve, reject) => {
		const sql =
			`UPDATE reviews SET completed = ?, reviewDate = ?, rating = ?, review = ?
			WHERE filmId = ? AND reviewerId = ?`;
		db.run(sql,
			[review.completed, review.reviewDate, review.rating, review.review,
				filmId, reviewerId],
			function (err) {
				if (err) {
					reject(err);
					return;
				}
				resolve({ filmId, reviewerId, review });
			});
	});
};

// This function deletes an existing film given its id.
exports.deleteReview = (filmId, reviewerId) => {
	return new Promise((resolve, reject) => {
		const sql =
			`DELETE FROM reviews
			WHERE filmId = ? AND reviewerId = ? AND completed = 0`;
		db.run(sql, [filmId, reviewerId], (err) => {
			if (err) {
				reject(err);
				return;
			} else
				resolve(null);
		});
	});
}
