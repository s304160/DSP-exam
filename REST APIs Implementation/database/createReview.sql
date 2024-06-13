-- SQLite
CREATE TABLE reviews(
	filmId INTEGER,
	reviewerId INTEGER,
	completed INTEGER NOT NULL,
	reviewDate Date,
	rating INTEGER,
	review VARCHAR(1000),
	PRIMARY KEY(filmId, reviewerId),
	FOREIGN KEY(filmId) REFERENCES films(id),
	FOREIGN KEY(reviewerId) REFERENCES users(id)
);


INSERT INTO reviews(filmId, reviewerId, completed) VALUES(1, 1, 0);
INSERT INTO reviews(filmId, reviewerId, completed) VALUES(1, 2, 0);

INSERT INTO reviews VALUES(2, 1, 1, '2020-01-02', 3, 'nice');