'use strict';

var utils = require('../utils/writer.js');
var reviewDAO = require('../DAOs/dao-reviews.js');


module.exports.getReviews = function getReviews(req, res, next) {
	reviewDAO.getReviews(req.params.filmId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.getReview = function getReview(req, res, next) {
	reviewDAO.getReview(req.params.filmId, req.params.reviewerId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.issueReview = function issueReview(req, res, next) {
	reviewDAO.issueReview(req.body.review, req.body.users)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.issueAutomaticReviews = function issueAutomaticReviews(req, res, next) {
	reviewDAO.issueAutomaticReviews(req.params.filmId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.updateReview = function updateReview(req, res, next) {
	reviewDAO.updateReview(req.params.filmId, req.user.id, req.body)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.deleteReview = function deleteReview(req, res, next) {
	reviewDAO.deleteReview(req.params.filmId, req.params.reviewerId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};
