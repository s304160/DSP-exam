'use strict';

/* Data Access Object (DAO) module for accessing reviews data */

const db = require('../db');
const { port } = require('../index.js')

/**
 * This function retrieves a film given its id owned by the logged user.
 */
exports.getReviews = (filmId) => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT filmId, reviewerId, completed, reviewDate, reviews.rating, review
			FROM reviews, films
			WHERE reviews.filmId = films.id
			AND filmId = ?`;

		db.all(sql, [filmId], (err, rows) => {
			if (err) {
				reject(err);
				return;
			}
			if (rows === undefined || rows.length === 0) {
				resolve(null);
				return;
			}

			const reviews = rows.map((r) => {
				if (r.completed) {
					r['reviewURI'] = port + '/films/' + filmId + '/reviews/' + r.reviewerId

					return r;
				}
				else
					return {
						filmId: r.filmId,
						reviewerId: r.reviewerId,
						completed: r.completed,
						reviewURI: port + '/films/' + filmId + '/reviews/' + r.reviewerId
					};
			})
			resolve(reviews);
		});
	});
};


// This function retrieves a film given its id owned by the logged user.
exports.getReview = (filmId, reviewerId) => {
	return new Promise((resolve, reject) => {
		const sql =
			`SELECT * FROM reviews
			WHERE filmId = ? AND reviewerId = ?`;

		db.get(sql, [filmId, reviewerId], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			if (row === undefined) {
				resolve(null);
				return;
			}

			row['reviewURI'] = port + '/films/' + filmId + '/reviews/' + row.reviewerId
			resolve(row);
		});
	});
};


/**
 * This function adds a list of reviews in the database, each associated to a user in the list passed as parameter.
 */
exports.issueReview = (filmId, reviewers, currentUser) => {
	return new Promise((resolve, reject) => {

		const checkFilm =
			`SELECT * FROM films WHERE id = ?`
		db.get(checkFilm, [filmId], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			if (row === undefined) {
				resolve(404);
				return;
			}
			if (row.private) {
				resolve(400);
				return;
			}
			if (row.owner !== currentUser) {
				resolve(401);
				return;
			}


			const sql =
				`INSERT INTO reviews (filmId, reviewerId, completed)
				VALUES(?, ?, ?)`;

			let result = [];

			reviewers.forEach(r => {
				db.run(sql, [filmId, r, false], function (err) {
					if (err) {
						reject(err);
						return;
					}
					result.push({ filmId: filmId, reviewerId: r, completed: false })
				});
			});

			resolve({ "Issued Reviews": result })
		})


	});
};

/**
 * This function issue reviews for a film that has no review issued
 * yet maintaining the issued reviews balanced among the users.
 */
exports.issueAutomaticReviews = (filmId, userId) => {
	return new Promise((resolve, reject) => {

		const check =
			`SELECT COUNT(reviews.reviewerId) as tot,
			films.id, films.owner, films.private
			FROM films
			LEFT JOIN reviews ON films.id = reviews.filmId			
			WHERE films.id = ?`;

		let filteredUsers;

		db.get(check, [filmId], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			if (row === undefined || row.id === null) {
				resolve(404);
				return;
			}
			if (row.private) {
				resolve(400);
				return;
			}
			if (row.owner !== userId) {
				resolve(401)
				return;
			}
			if (row.tot !== 0) {
				resolve(409);
				return;
			}

			const getUsers =
				`SELECT users.id as userId, COUNT(reviews.filmId) as totReviews
				FROM users
				LEFT JOIN reviews ON users.id = reviews.reviewerId
				GROUP BY users.id`;

			db.all(getUsers, (err, rows) => {
				if (err) {
					reject(err);
					return;
				}

				const avg = rows.reduce(
					(acc, user) => acc + user.totReviews,
					0) / rows.length

				filteredUsers = rows.filter(u => u.totReviews <= avg)


				const sql =
					`INSERT INTO reviews (filmId, reviewerId, completed)
					VALUES(?, ?, ?)`;

				filteredUsers.forEach(u => {
					db.run(sql, [filmId, u.userId, false], function (err) {
						if (err) {
							reject(err);
							return;
						}
					});
				});

				resolve({ users: filteredUsers.map(u => u.userId) });

			})
		})
	});
};

/**
 * This function updates an existing review given its id, the reviewer id and the new properties.
 */
exports.updateReview = (filmId, reviewerId, review) => {
	return new Promise((resolve, reject) => {
		const sql =
			`UPDATE reviews SET 
				completed = ?, 
				reviewDate = ?, 
				rating = ?,
				review = ?
			WHERE filmId = ? AND reviewerId = ?`;
		db.run(sql,
			[review.completed, review.reviewDate, review.rating, review.review,
				filmId, reviewerId],
			function (err) {
				if (err) {
					reject(err);
					return;
				}
				if (this.changes === 0) {
					resolve(null)
					return;
				}
				resolve({ filmId, reviewerId, review });
			});
	});
};

/*
 * This function deletes a review given the corresponding filmId
 * and reviewerId, but only if the review is not marked as complete.
 */
exports.deleteReview = (filmId, reviewerId, currentUser) => {
	return new Promise((resolve, reject) => {

		const check =
			`SELECT owner, completed
			FROM films, reviews
			WHERE films.id = reviews.filmId
			AND films.id = ?
			AND reviews.reviewerId = ?`;

		db.get(check, [filmId], (err, row) => {
			if (err) {
				reject(err);
				return;
			}
			if (row === undefined) {
				resolve(null);
				return;
			}
			if (row.owner !== currentUser) {
				resolve({ error: 'You cannot delete a review of a film you do not own.' });
				return;
			}
			if (row.completed) {
				resolve({ error: 'You cannot delete a completed review.' });
				return;
			}
		});


		const sql =
			`DELETE FROM reviews
			WHERE filmId = ? AND reviewerId = ? AND completed = 0`;
		db.run(sql, [filmId, reviewerId], (err) => {
			if (err) {
				reject(err);
				return;
			}

			if (this.changes === undefined || this.changes === 0) {
				resolve(null)
				return;
			}

			resolve(true);
		});
	});
}

