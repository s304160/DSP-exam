[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/6va-_tX8)
# Exam Call 3

The structure of this repository is the following:
  - "JSON Schemas" contains the design of the JSON Schemas;
  - "REST APIs Design" contains the full Open API documentation of the REST APIs, including examples of JSON documents to be used when invoking the operations, and examples of invocations of the API operations, possibly as a Postman collection;
  - "REST APIs Implementation" contains the code of the Film Manager service application.



# Design
The entire implementation of the server is under the folder `REST APIs Implementation`. The main file is `index.js`, which calls the various files containing the implementation of the additional services
 - `api.js`: it contains all the api calls;
 - `db.js`: it contains the code to connect to the database;
 - `utils/passport.js`: it contains the code to use `passport` authorization;

All the API calls invoke the controllers located in the `controllers` folder, which invoke the DAOs in the `DAOs` folder, which ultimately operate on the database. Each of the file is semantically separated:
 - The API calls related to the user and the authentication will invoke the `UserController.js` which will invoke the `dao-users.js`;
 - The API calls related to the films will invoke the `FilmController.js` which will invoke the `dao-films.js`;
 - The API calls related to the reviews will invoke the `ReviewController.js` which will invoke the `dao-reviews.js`;
 - The API calls related to the likes will invoke the `LikeController.js` which will invoke the `dao-likes.js`;


# Run the server
Go to the folder `REST APIs Implementation` and run the command `npm start`.
The APIs can be called either by the specified Postman collection or from the Swagger docs at the URL `http://localhost:8080/docs`.




# Credentials
| email | password | name |
|-------|----------|------|
| john.doe@polito.it | password | John |
| mario.rossi@polito.it | password | Mario |
| testuser@polito.it | password | Testuser |


# Operations


All the API must be called at the port `http://localhost:8080/`.

## User

### POST `/user/login`

Authenticate a user, allowing the set of operations permitted only to authenticated user.

### Body
 - `username`: string.

 - `password`: string.

Example

	{
		"username": "john.doe@polito.it",
		"password": "password"
	}


### POST `/user/logout`

Terminates the session of the current logged user.

## Films

### GET `/films`
Returns a page of 10 films, filtered depending on the query parameters. 

#### Query Parameters
The query parameters that can be passed are `page`, `owned` and `toReview`. If neither `owned` or `toReview` are set to 1 by default only public films will be retrieved.

Only one parameter between 'owned' and 'toReview' is allowed to be set to 1 at the same time.

 - `page`: integer; indicates the number of the page of results to retrieve. The default is set to 1

 - `owned`: integer; can assume the values 0 or 1. If set to 1 returns the films owned by the current logged user.

 - `toReview`: integer; can assume the values 0 or 1. If set to 1 returns the films the current logged user has to review.

`owned` and `toReview` cannot be set to 1 at the same time.

Example 1:

	{
		"page": 1
		"owned": 1
	}

Example 2:

	{		
		"toReview": 1
	}


### POST `/films`
Create a new Film with the specified properties. 

#### Body
 - `title`: string.
 - `private`: boolean. If it set to `true` the properties `watchDate`, `rating` and `favorite` must be specified, otherwise they cannot be specified.
 - `watchDate`: string with date format.
 - `rating`: integer from 0 to 10.
 - `favorite`: boolean.

Example 1:

	{
		"title": "Casablanca",
		"private": false
	}

Example 2:

	{
		"title": "The Departed",
		"private": true,
		"watchDate": "2023-11-15",
		"rating": 7,        
		"favorite": true
	}

### GET `/films/{filmId}`
Retrieve a single film. If the film is public it can be retrieved. If the film is private it can be retrieved only if the user is the owner.
#### Path Parameters
 - `{filmId}`: integer. Id of the film to retrieve. 

### PUT `/films/{filmId}`
Modify a single film. The film can be modified only if the user is its owner. Only if the film is also private the properties `watchDate`, `rating` and `favorite` can be specified.
#### Path Parameters
 - `{filmId}`: integer. Id of the film to update. 
#### Body
 - `title`: string.
 - `watchDate`: string with date format.
 - `rating`: integer from 0 to 10.
 - `favorite`: boolean.

Example 1:

	{
		"title": "Casablanca"
	}

Example 2:

	{
		"title": "The Departed",		
		"watchDate": "2023-11-15",
		"rating": 7,        
		"favorite": true
	}

### DELETE `/films/{filmId}`
Delete a single film.
#### Path Parameters
 - `{filmId}`: integer. Id of the film to delete. 

## Reviews

### GET `/films/{filmId}/reviews`
Returns a page of 10 reviews of the film specified by `{filmId}`.
#### Path Parameters
 - `{filmId}`: integer. Id of the film to retrieve the reviews from. 


### POST `/films/{filmId}/reviews`
Issue a review for the film specified by `{filmId}` to a list of users.
#### Path Parameters
 - `{filmId}`: integer. Id of the film to retrieve the reviews from. 
#### Body
 - `{reviewers}` : list of integers. Ids of the users to issue the review to.

Example:

	{
		"reviewers": [1, 2]
	}

### GET `/films/{filmId}/reviews/{reviewerId}`
Returns a single review of the film specified by `{filmId}` issued to the user specified by `{reviewerId}`.
#### Path Parameters
 - `{filmId}`: integer. Id of the film to retrieve the reviews from. 
 - `{reviewerId}`: integer. Id of the user that created the review.  



### PUT `/films/{filmId}/reviews/{reviewerId}`
Modifies a single review of the film specified by `{filmId}` issued to the user specified by `{reviewerId}`.
#### Path Parameters
 - `{filmId}`: integer. Id of the film to retrieve the reviews from. 
 - `{reviewerId}`: integer. Id of the user that created the review. 


### DELETE `/films/{filmId}/reviews/{reviewerId}`
Deletes a single review of the film specified by `{filmId}` issued to the user specified by `{reviewerId}`.
#### Path Parameters
 - `{filmId}`: integer. Id of the film to retrieve the reviews from. 
 - `{reviewerId}`: integer. Id of the user that created the review. 

### POST `/films/{filmId}/automaticReviews`
Issues a number of reviews for the film specified by `{filmId}` so the number of invitations of reviews to the users are balanced. It can only be called if the film has no reviews issued yet.
#### Path Parameters
 - `{filmId}`: integer. Id of the film to retrieve the reviews from. 


## Likes

### GET `/films/{filmId}/likes`
Retrieve the list of users that assigned a like to the film specified by `{filmId}`.
#### Path Parameters
 - `{filmId}`: integer. Id of the film to retrieve the reviews from. 

### POST `/films/{filmId}/likes`
Assign a like to the film specified by `{filmId}` by the current logged user.
#### Path Parameters
 - `{filmId}`: integer. Id of the film to retrieve the reviews from. 

### DELETE `/films/{filmId}/likes`
Deletes the like assigned to the film specified by `{filmId}` by the current logged user.
#### Path Parameters
 - `{filmId}`: integer. Id of the film to delete the like from. 

