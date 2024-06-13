const { app } = require('./index');
const path = require('path');

/** Controllers **/
const userController = require('./controllers/UserController');
const filmController = require('./controllers/FilmController');
const reviewController = require('./controllers/ReviewController');


/* --- User API --- */

app.post('/user/login', userController.userValidation(), userController.userLogin);


/*** Defining authentication verification middleware ***/

const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	return res.status(401).json({ error: 'Not authorized' });
}



/* --- Film API --- */

app.post('/film', isLoggedIn, filmController.filmValidation, filmController.createFilm);
app.get('/film/:filmId', isLoggedIn, filmController.getFilm);
app.put('/film/:filmId', isLoggedIn, filmController.updateFilm);
app.delete('/film/:filmId', isLoggedIn, filmController.deleteFilm);

app.get('/films/owned', isLoggedIn, filmController.getFilmsByOwner);
app.get('/films/toReview', isLoggedIn, filmController.getFilmToReview);

app.get('/films/public', filmController.getPublicFilms);
app.get('/films/public/:filmId', filmController.getPublicFilm);

/* --- Review API --- */

app.post('/review', isLoggedIn, reviewController.issueReview);
app.post('/automatic/review/:filmId', isLoggedIn, reviewController.issueAutomaticReviews);
app.put('/review/:filmId/:reviewerId', isLoggedIn, reviewController.updateReview);
app.delete('/review/:filmId/:reviewerId', isLoggedIn, reviewController.deleteReview);

app.get('/reviews/public/:filmId', reviewController.getReviews);
app.get('/reviews/public/:filmId/:reviewerId', reviewController.getReview);

