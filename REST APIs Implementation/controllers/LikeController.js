const { isLoggedIn, writeJson } = require('../utils/utils.js');
const likeDAO = require('../DAOs/dao-like.js');


module.exports.getFilmLikes = function getFilmLike(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}

	console.log(JSON.stringify(req.params))
	likeDAO.getFilmLikes(req.params.filmId)
		.then(function (response) {
			if (response)
				res.status(200).send(response).end()
			else
				res.status(404).send({ error: 'No like found associated to the film id.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
}

module.exports.addLike = function addLike(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}

	likeDAO.addLike(req.params.filmId, req.user.id)
		.then(function (response) {
			if (response)
				res.status(201).send("Success").end()
			else if (response === null)
				res.status(404).send({ error: 'No film found.' }).end()
			else
				res.status(400).send({ error: 'You already liked this film.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
}

module.exports.deleteLike = function deleteLike(req, res, next) {
	if (isNaN(Number.parseInt(req.params.filmId))) {
		res.status(400).send({ error: 'Invalid Id.' }).end()
		return;
	}

	likeDAO.deleteLike(req.params.filmId, req.user.id)
		.then(function (response) {
			if (response)
				res.status(204).send(response).end()
			else
				res.status(404).send({ error: 'Film or like not found.' }).end()

		})
		.catch((e) => {
			res.status(500).send({ error: 'Internal server error. ' + e }).end()
		});
}
