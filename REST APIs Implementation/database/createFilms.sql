-- SQLite

DROP TABLE films;

CREATE TABLE films(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title varchar(255) NOT NULL,
	owner INTEGER NOT NULL,
	private INTEGER NOT NULL DEFAULT 1,
	favorite INTEGER DEFAULT 0,
	watchDate Date,
	rating INTEGER,
	FOREIGN KEY(owner) REFERENCES users(id)
);

