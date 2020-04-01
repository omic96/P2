var ratingData = require('./ratings_data.json');
var movieData = require('./data_2.json');
var math = require('mathjs');

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

// Loads and sends all ratings to be added
function add_all_ratings() {
  for (let entry in ratingData) {
    let userID = ratingData[entry].userId;
    let movieID = ratingData[entry].movieId;
    let rating = ratingData[entry].rating;

    add_user_rating(userID, movieID, rating);
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
  userMovieMatrix[userRow][movieColumn] = rating;
}

function fill_empty_ratings() {
  for (i = 0; i < currentUserIndex; i++) {
    for (j = 0; j < currentMovieIndex; j++) {
      if(!userMovieMatrix[i][j]){
        userMovieMatrix[i][j] = 0;
      }
    } 
  }
}

// Prints the movie info and ratings for all rated movies by a user
function get_user_ratings(userId) {
  let currentUserRow = users[userId]
  for (i = 0; i < currentMovieIndex; i++) {
    // Only print something if the user has given a rating to this movie
    if (userMovieMatrix[currentUserRow][i]) {
      
      user_database = new user_ratings(userId, movieList[movieColumns[i]].title, userMovieMatrix[currentUserRow][i])
      
      console.log(user_database);
    }
  }
}


function main() {
  // Add all entries
  add_all_ratings();
  // Fill all empty entries
  fill_empty_ratings()
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
  //get_user_ratings(1);
}


main();


let newMatrix = factorize(userMovieMatrix, 13, 500,0.002);

/*/
for(let i = 0; i < 20; i++) {
  for(let j = 0; j < 20; j++) {
    console.log(newMatrix[i][j], userMovieMatrix[i][j]);
  }
}
/*/
function factorize(the_matrix, latent_features, iterations, learning_rate) {

    //Make the two factor matrices, 1 & 2, with random numbers.
    factor_matrix1 = make_factor_matrix(latent_features,currentUserIndex);
    factor_matrix2 = math.transpose(make_factor_matrix(latent_features,currentMovieIndex));

    for(let n = 0; n < iterations; n++) {
        for(let i = 0; i < currentUserIndex; i++) {
            for(let j = 0; j < currentMovieIndex; j++) {

                //find current value of original matrix
                let current_value = the_matrix[i][j];
                //Only if the user rated this movie..
                if(current_value > 0) {
                    let error = current_value - math.multiply(factor_matrix1[i], column_vector(factor_matrix2,j));


                    //Lets change the numbers in each factor matrix...
                    for(let k = 0; k < latent_features; k++) {
                       let factor_matrix1_latent_feature = factor_matrix1[i][k];
                       let factor_matrix2_latent_feature = factor_matrix2[k][j];

                        factor_matrix1[i][k] = update_latent_feature(factor_matrix1_latent_feature,factor_matrix2_latent_feature,error,learning_rate);
                        factor_matrix2[k][j] = update_latent_feature(factor_matrix2_latent_feature,factor_matrix1_latent_feature,error,learning_rate);
                    }
                }
            }
        }
    }
    console.log(find_rmse(the_matrix,factor_matrix1,factor_matrix2));
    return math.multiply(factor_matrix1,factor_matrix2);
}

function update_latent_feature(latent1, latent2, error, learning_rate) {
    return latent1 + 2 * learning_rate * error * latent2;
}


function column_vector(matrix, index) {
    return matrix.map(m => m[index]); 
}

function make_factor_matrix (latent_features, count) {
    let factor_matrix = [];
    for(let i = 0; i < count; i++) {
        factor_matrix.push([]);
        for(let j = 0; j < latent_features; j++) {
            factor_matrix[i].push(Math.round(Math.random() * 10) / 10);
        }
    }

    return factor_matrix;
}



function find_rmse (the_matrix, factor_matrix1, factor_matrix2) {

    let total_error = 0;
    for(let i = 0; i < currentUserIndex; i++) {
        for(let j = 0; j < currentMovieIndex; j++) {
          
          
          let y = the_matrix[i][j];
                //Only if the user rated this movie..
                if(y > 0) {
                    let y1 = math.multiply(factor_matrix1[i], column_vector(factor_matrix2,j));        
                    total_error += Math.sqrt(Math.pow(y1 - y,2));
                }
        }
    }
    return total_error;
}