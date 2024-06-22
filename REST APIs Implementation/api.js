const { app } = require('./index');
const path = require('path');

const { isLoggedIn } = require('./utils/utils')

/* --- CONTROLLERS --- */
const userController = require('./controllers/UserController');
const filmController = require('./controllers/FilmController');
const reviewController = require('./controllers/ReviewController');
const likeController = require('./controllers/LikeController');

/* --- VALIDATION / SCHEMAS --- */
const { Validator, ValidationError } = require('express-json-validator-middleware');
const userSchema = require('../JSON Schemas/user.json');
const filmSchema = require('../JSON Schemas/film.json');
const filmParamsSchema = require('../JSON Schemas/filmParams.json');
const filmUpdateSchema = require('../JSON Schemas/filmUpdate.json');
const reviewSchema = require('../JSON Schemas/review.json');

const validator = new Validator();
const addFormats = require("ajv-formats")
addFormats(validator.ajv)



const filmValidation = validator.validate({ body: filmSchema })
const filmParamsValidation = validator.validate({ query: filmParamsSchema })
const filmUpdateValidation = validator.validate({ body: filmUpdateSchema })




/* --- User API --- */

// app.post('/user/login', userController.userValidation(), userController.userLogin);
app.post('/user/login', userController.userLogin);
app.post('/user/logout', isLoggedIn, userController.userLogout);


/*** Defining authentication verification middleware ***/




/* --- Film API --- */

app.post('/films', isLoggedIn, (req, res, next) => {
	req.body['owner'] = req.user.id;
	next();
}, filmValidation, filmController.createFilm);

app.get('/films', filmParamsValidation, filmController.getFilms);
app.get('/films/:filmId', filmController.getFilm);
app.put('/films/:filmId', isLoggedIn, filmUpdateValidation, filmController.updateFilm);
app.delete('/films/:filmId', isLoggedIn, filmController.deleteFilm);


/* --- Review API --- */

app.get('/films/:filmId/reviews', reviewController.getReviews);
app.get('/films/:filmId/reviews/:reviewerId', reviewController.getReview);

app.post('/films/:filmId/reviews', isLoggedIn, reviewController.issueReview);
app.post('/films/:filmId/automaticReviews', isLoggedIn, reviewController.issueAutomaticReviews);
app.put('/films/:filmId/reviews/:reviewerId', isLoggedIn, reviewController.updateReview);
app.delete('/films/:filmId/reviews/:reviewerId', isLoggedIn, reviewController.deleteReview);



/* --- LIKE API --- */

app.get('/films/:filmId/likes', likeController.getFilmLikes)
app.post('/films/:filmId/likes', isLoggedIn, likeController.addLike)
app.delete('/films/:filmId/likes', isLoggedIn, likeController.deleteLike)




/* --- VALIDATION ERRORS --- */
app.use((error, request, response, next) => {
	// Check the error is a validation error
	if (error instanceof ValidationError) {
		// Handle the error
		response.status(400).send({
			message: "Invalid Parameters.",
			error: error.validationErrors
		}).end();
	} else {
		// Pass error on if not a validation error
		next(error);
	}
});