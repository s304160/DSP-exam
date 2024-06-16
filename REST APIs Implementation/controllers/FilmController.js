// 'use strict';

const utils = require('../utils/writer.js');
const filmDao = require('../DAOs/dao-films.js');


module.exports.createFilm = function createFilm(req, res, next) {
	filmDao.createFilm(req.body)
		.then(function (response) {
			if (response)
				res.status(201).send(response).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
};


module.exports.getFilm = function getFilm(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}

	filmDao.getFilm(req.params.filmId, req.user.id)
		.then(function (response) {
			if (response)
				res.status(200).send(response).end()
			else
				res.status(404).send({ error: 'Film not found.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
};

module.exports.getFilmsByOwner = function getFilmsByOwner(req, res, next) {
	filmDao.getFilmsByOwner(req.user.id)
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

module.exports.updateFilm = function updateFilm(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}

	filmDao.updateFilm(req.params.filmId, req.user.id, req.body)
		.then(function (response) {
			if (response)
				res.status(204).send(response).end()
			else
				res.status(404).send({ error: 'Film not found.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
};

module.exports.deleteFilm = function deleteFilm(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}

	filmDao.deleteFilm(req.params.filmId, req.user.id)
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


// module.exports.getFilmToReview = function getFilmToReview(req, res, next) {
// 	filmDao.getFilmToReview()
// 		.then(function (response) {
// 			if (response)
// 				res.status(200).send(response).end()
// 			else
// 				res.status(404).send({ error: 'Film not found.' }).end()

// 		})
// 		.catch((e) => {
// 			res.status(500).send({ error: 'Internal server error.' }).end()
// 		});
// };



module.exports.getPublicFilm = function getPublicFilm(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}

	filmDao.getPublicFilm(req.params.filmId)
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

module.exports.getPublicFilms = function getPublicFilms(req, res, next) {
	filmDao.getPublicFilms()
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

