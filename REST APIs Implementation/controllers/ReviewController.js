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
				res.status(404).send({ error: 'No review found.' }).end()

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
	reviewDAO.issueReview(req.params.filmId, req.body.reviewers, req.user.id)
		.then(function (response) {

			switch (response) {
				case 400:
					res.status(400).send({ error: "You cannot issue a review for a private film." }).end()
					break;
				case 401:
					res.status(401).send({ error: "You cannot issue a review for a film you do not own." }).end()
					break;
				case 404:
					res.status(404).send({ error: "Film not found." }).end()
					break;
				default:
					res.status(201).send(response).end()
					break;
			}


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

	reviewDAO.issueAutomaticReviews(req.params.filmId, req.user.id)
		.then(function (response) {

			switch (response) {
				case 400:
					res.status(400).send({ error: "You cannot issue reviews for a private film." }).end();
					break;
				case 401:
					res.status(401).send({ error: "You cannot issue reviews for a film you do not own." }).end();
					break;
				case 404:
					res.status(404).send({ error: "Film not found." }).end();
					break;
				case 409:
					res.status(409).send({ error: "The film already has at least one review issued." }).end();
					break;
				default:
					res.status(201).send(response).end()
					break;
			}
		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
};


module.exports.updateReview = function updateReview(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))
		|| isNaN(Number.parseInt(req.params.reviewerId))) {
		res.status(400).send({ error: 'Invalid parameters.' }).end()
		return;
	}

	if (req.params.reviewerId !== req.user.id) {
		res.status(401).send({ error: 'You cannot modify a review not assigned to you.' }).end()
		return;
	}


	reviewDAO.getReview(req.params.filmId, req.user.id)
		.then(function (response) {
			if (response) {
				reviewDAO.updateReview(req.params.filmId, req.user.id, req.body)
					.then(function (response) {
						if (response)
							res.status(204).send(response).end()
					})
					.catch((e) => {
						res.status(500).send({ error: 'Internal server error. ' + e }).end()
					});
			}
			else if (response === null)
				res.status(404).send({ error: 'Review not found.' }).end()
			else
				res.status(500).send({ error: 'Internal server error. ' + e }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});


};


module.exports.deleteReview = function deleteReview(req, res, next) {
	if (isNaN(parseInt(req.params.filmId))
		|| isNaN(parseInt(req.params.reviewerId))) {
		res.status(400).send({ error: 'Invalid parameters.' }).end()
		return;
	}

	reviewDAO.deleteReview(req.params.filmId, req.params.reviewerId)
		.then(function (response) {
			if (response)
				res.status(204).send({ message: "Review successfully deleted." }).end()
			else if (response === null)
				res.status(404).send({ error: 'Review or film not found.' }).end()
			else
				res.status(401).send(response).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
};
