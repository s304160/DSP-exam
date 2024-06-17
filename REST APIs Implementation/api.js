const { app } = require('./index');
const path = require('path');

/* --- CONTROLLERS --- */
const userController = require('./controllers/UserController');
const filmController = require('./controllers/FilmController');
const reviewController = require('./controllers/ReviewController');
const likeController = require('./controllers/LikeController');

/* --- VALIDATION / SCHEMAS --- */
const { Validator, ValidationError } = require('express-json-validator-middleware');
const userSchema = require('../JSON Schemas/user.json');
const filmSchema = require('../JSON Schemas/film.json');
const reviewSchema = require('../JSON Schemas/review.json');

const validator = new Validator();
const addFormats = require("ajv-formats")
addFormats(validator.ajv)



const filmValidation = validator.validate({ body: filmSchema })



/* --- User API --- */

// app.post('/user/login', userController.userValidation(), userController.userLogin);
app.post('/user/login', userController.userLogin);


/*** Defining authentication verification middleware ***/

const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	return res.status(401).json({ error: 'Not authorized' });
}



/* --- Film API --- */

app.post('/film', isLoggedIn, (req, res, next) => {
	req.body['owner'] = req.user.id;
	next();
}, filmValidation, filmController.createFilm);

app.get('/film/:filmId', isLoggedIn, filmController.getFilm);
app.put('/film/:filmId', isLoggedIn, filmController.updateFilm);
app.delete('/film/:filmId', isLoggedIn, filmController.deleteFilm);

app.get('/films/owned', isLoggedIn, filmController.getFilmsByOwner);
app.get('/films/toReview', isLoggedIn, filmController.getFilmsToReview);

app.get('/films/public', filmController.getPublicFilms);
app.get('/film/public/:filmId', filmController.getPublicFilm);

/* --- Review API --- */

app.post('/review', isLoggedIn, reviewController.issueReview);
app.post('/automatic/review/:filmId', isLoggedIn, reviewController.issueAutomaticReviews);
app.put('/review/:filmId/:reviewerId', isLoggedIn, reviewController.updateReview);
app.delete('/review/:filmId/:reviewerId', isLoggedIn, reviewController.deleteReview);

app.get('/reviews/public/:filmId', reviewController.getReviews);
app.get('/reviews/public/:filmId/:reviewerId', reviewController.getReview);


/* --- LIKE API --- */

app.get('/like/:filmId', likeController.getFilmLikes)
app.post('/like/:filmId', isLoggedIn, likeController.addLike)
app.delete('/like/:filmId', isLoggedIn, likeController.deleteLike)





/* --- VALIDATION ERRORS --- */
app.use((error, request, response, next) => {
	// Check the error is a validation error
	if (error instanceof ValidationError) {
		// Handle the error
		response.status(400).send(error.validationErrors);
		next();
	} else {
		// Pass error on if not a validation error
		next(error);
	}
});