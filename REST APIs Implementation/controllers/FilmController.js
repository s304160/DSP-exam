// 'use strict';

const utils = require('../utils/writer.js');
const filmDAO = require('../DAOs/dao-films.js');
const filmSchema = require('../../JSON Schemas/film.json');
// const { Validator, ValidationError, Ajv, addFormats } = require('../index.js');


const { Validator } = require("express-json-validator-middleware");
const validator = new Validator();
const addFormats = require("ajv-formats")
addFormats(validator.ajv)


module.exports.filmValidation = validator.validate({ body: filmSchema })


module.exports.createFilm = function createFilm(req, res, next) {
	filmDAO.createFilm(req.body, req.user.id)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};


module.exports.getFilm = function getFilm(req, res, next) {
	filmDAO.getFilm(req.params.filmId, req.user.id)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.deleteFilm = function deleteFilm(req, res, next) {
	filmDAO.deleteFilm(req.params.filmId, req.user.id)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};


module.exports.getFilmToReview = function getFilmToReview(req, res, next) {
	filmDAO.getFilmToReview()
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.getFilmsByOwner = function getFilmsByOwner(req, res, next) {
	filmDAO.getFilmsByOwner(req.user.id)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.getPublicFilm = function getPublicFilm(req, res, next) {
	filmDAO.getPublicFilm(req.params.filmId)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.getPublicFilms = function getPublicFilms(req, res, next) {
	filmDAO.getPublicFilms()
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};

module.exports.updateFilm = function updateFilm(req, res, next) {
	filmDAO.updateFilm(req.params.filmId, req.user.id, req.body)
		.then(function (response) {
			utils.writeJson(res, response);
		})
		.catch(function (response) {
			utils.writeJson(res, response);
		});
};


