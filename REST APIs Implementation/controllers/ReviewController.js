'use strict';

const utils = require('../utils/utils.js');
const reviewDAO = require('../DAOs/dao-reviews.js');


module.exports.getReviews = function getReviews(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}

	reviewDAO.getReviews(req.params.filmId)
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

module.exports.getReview = function getReview(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))
		|| isNaN(Number.parseInt(req.params.reviewerId))) {
		res.status(400).send({ error: 'Invalid parameters.' }).end()
		return;
	}

	reviewDAO.getReview(req.params.filmId, req.params.reviewerId)
		.then(function (response) {
			if (response)
				res.status(200).send(response).end()
			else
				res.status(404).send({ error: 'Review not found.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
};

module.exports.issueReview = function issueReview(req, res, next) {
	reviewDAO.issueReview(req.body.review, req.body.users)
		.then(function (response) {
			if (response)
				res.status(201).send(response).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
};

module.exports.issueAutomaticReviews = function issueAutomaticReviews(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}
	reviewDAO.issueAutomaticReviews(req.params.filmId)
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

module.exports.updateReview = function updateReview(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}

	reviewDAO.updateReview(req.params.filmId, req.user.id, req.body)
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

module.exports.deleteReview = function deleteReview(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))
		|| isNaN(Number.parseInt(req.params.reviewerId))) {
		res.status(400).send({ error: 'Invalid parameters.' }).end()
		return;
	}

	reviewDAO.deleteReview(req.params.filmId, req.params.reviewerId)
		.then(function (response) {
			if (response)
				res.status(204).send("Review successfully deleted.").end()
			else
				res.status(404).send({ error: 'Review not found.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
};
