var ratingData = require('./ratings_data.json');
var movieData = require('./data_2.json');

// To know what column or row a specific movie or user belongs to
// KEY: User or Movie ID's 
var users = {};
var movies = {};

// To know what user or movie a specific column or row belongs to
// KEY: Index of row or column
var userRows = {};
var movieColumns = {};

// Data for all movies
// KEY: MovieID
var movieList = {};

// The current index of the last movie and user in the matrix
var currentMovieIndex = 0;
var currentUserIndex = 0;

// [X = Movies][Y = Users]
var userMovieMatrix = [[]];

// A variable to store the users data
var user_database;

//Class constructor
class user_ratings {
	constructor(userID, movieID, rating){
		this.user   = userID;
		this.movie  = movieID;
		this.rating = rating;
	}
} 

// Adds a rating to the matrix
function add_user_rating(user, movie, rating) {
	// The rows and columns to add the rating to
	let userRow;
	let movieColumn;

	// Check if user already has a row
	if (user in users) {
		userRow = users[user];
	} 
	
	else {
		// Give the next empty row to the current user
		userRow = currentUserIndex;
		// Save the given row for this user in the dict
		users[user] = userRow;
		// Increment current index
		currentUserIndex++;
	}

	// Check if movie already has a column
	if (movie in movies) {
		movieColumn = movies[movie];
	} 
	
	else {
		// Give the next empty column to the current movie
		movieColumn = currentMovieIndex;
		// Save the given column for this movie in the dict
		movies[movie] = movieColumn;
		// Increment current index
		currentMovieIndex++;
		// Add new column to the matrix
		userMovieMatrix[movieColumn] = [];
	}

	// Save the index of both the movie and the user to use for future lookups
	userRows[userRow] = user;
	movieColumns[movieColumn] = movie;
	
	// Add the rating to the matrix
	userMovieMatrix[movieColumn][userRow] = rating;

}

// Prints the movie info and ratings for all rated movies by a user
function get_user_ratings(userId) {
	for (i = 0; i < currentMovieIndex; i++) {
		// Only print something if the user has given a rating to this movie
		if (userMovieMatrix[i][userId]) {
			
			user_database = new user_ratings(userId, movieList[movieColumns[i]].title, userMovieMatrix[i][userId])
			
			console.log(user_database);
			/*console.log(
				"User: " + userId + " rated the movie: " 
				+ movieList[movieColumns[i]].title 
				+ " with a rating of: " + userMovieMatrix[i][userId]); */
			}
		}
	}
	
function main() {
	// Add all entries
	for (let entry in ratingData) {
		let userID = ratingData[entry].userId; 
		let movieID = ratingData[entry].movieId;
		let rating = ratingData[entry].rating;
		
		add_user_rating(userID, movieID, rating);
	}

	// Load movie data
	for (let entry in movieData) {
		let movieID = movieData[entry].movieId;
		let movieTitle = movieData[entry].title;
		let movieGenres = movieData[entry].genres;

		movieList[movieID] = {
			title: movieTitle,
			genres: movieGenres
		};
	}

	get_user_ratings(2);

}

main();




