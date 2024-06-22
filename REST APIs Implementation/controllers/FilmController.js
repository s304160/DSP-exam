// 'use strict';


// const { isLoggedIn, writeJson } = require('../utils/utils.js');
const filmDAO = require('../DAOs/dao-films.js');

const { Validator, ValidationError } = require("express-json-validator-middleware");


const isLoggedIn = function (req) {
	if (req.isAuthenticated())
		return true;

	return false;
}




//#region /films

module.exports.getFilms = function getFilms(req, res, next) {

	console.log(JSON.stringify(req.query))


	let owned = req.query.owned;
	let toReview = req.query.toReview;

	if (owned === undefined && toReview === undefined) {
		return getPublicFilmList(req, res, next)
	}


	// if (owned !== undefined && toReview !== undefined) {
	// 	res.status(400).send({ error: "Too many parameters. " }).end();
	// 	return;
	// }


	if (!isLoggedIn(req)) {
		res.status(401).json({ error: 'Not authorized' }).end();
		return;
	}


	if (owned !== undefined && parseInt(owned) === 1) {
		return getOwnedFilmList(req, res, next)
	}
	else if (toReview !== undefined && parseInt(toReview) === 1) {
		return getFilmsToReviewList(req, res, next)
	}
	else {
		res.status(400).send({ error: "Invalid parameters." }).end();
		return;
	}



};



const getPublicFilmList = function (req, res, next) {
	filmDAO.getPublicFilmList(req.query.page)
		.then(function (response) {
			if (response)
				res.status(200).send(response).end()
			else
				res.status(404).send({ error: 'No film found.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
};

const getOwnedFilmList = function (req, res, next) {
	filmDAO.getOwnedFilmList(req.user.id, req.params.page)
		.then(function (response) {
			if (response)
				res.status(200).send(response).end()
			else
				res.status(404).send({ error: 'No film found.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});

}


const getFilmsToReviewList = function getFilmToReview(req, res, next) {
	filmDAO.getFilmsToReviewList(req.user.id, req.query.page)
		.then(function (response) {
			if (response)
				res.status(200).send(response).end()
			else
				res.status(404).send({ error: 'No film found.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error.' + e }).end()
		});
};


/* --- */

module.exports.createFilm = function createFilm(req, res, next) {
	filmDAO.createFilm(req.body)
		.then(function (response) {
			if (response)
				res.status(201).send(response).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
};


//#endregion

//#region /films/{filmId}  GET


module.exports.getFilm = function getFilm(req, res, next) {
	if (isNaN(parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}

	if (isLoggedIn(req)) {
		getOwnedFilm(req, res, next);
	}
	else {
		getPublicFilm(req, res, next);
	}


};



const getOwnedFilm = function (req, res, next) {
	filmDAO.getOwnedFilm(req.params.filmId, req.user.id)
		.then(function (response) {
			if (response)
				res.status(200).send(response).end()
			else if (response === null)
				res.status(404).send({ error: 'Film not found.' }).end()
			else
				res.status(401).send({ error: 'The film is private and you are not the owner.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
}



const getPublicFilm = function (req, res, next) {
	filmDAO.getPublicFilm(req.params.filmId)
		.then(function (response) {
			if (response) {
				res.status(200).send(response).end()
			}
			else
				res.status(404).send({ error: 'Film not found.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
};




//#endregion

//#region /films/{filmId} 




module.exports.updateFilm = function updateFilm(req, res, next) {
	if (isNaN(parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}

	filmDAO.getOwnedFilm(req.params.filmId, req.user.id)
		.then(function (response) {
			if (response) {
				if (response.owner !== req.user.id) {
					res.status(401).send({ error: 'You are not the owner of the film.' }).end()
					return;
				}

				if (!response.private) {
					if (req.body.rating !== undefined
						|| req.body.favorite !== undefined
						|| req.body.watchDate !== undefined
					) {
						res.status(401).send({ error: 'The film is not private, you cannot modify the specified properties.' }).end()
						return;
					}
				}


				filmDAO.updateFilm(req.params.filmId, req.user.id, req.body)
					.then(function (response) {
						if (response)
							res.status(204).send(response).end()
					})
					.catch((e) => {
						res.status(500).send({ error: 'Internal server error. ' + e }).end()
					});
			}
			else if (response === null)
				res.status(404).send({ error: 'Film not found.' }).end()
			else
				res.status(500).send({ error: 'Internal server error. ' + e }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});


};

module.exports.deleteFilm = function deleteFilm(req, res, next) {
	if (isNaN(parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}

	filmDAO.deleteFilm(req.params.filmId, req.user.id)
		.then(function (response) {
			if (response)
				res.status(204).send("Film successfully deleted.").end()
			else
				res.status(404).send({ error: 'Film not found.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
};





//#endregion

