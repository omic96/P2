var ratingData = require('./ratings_data.json');
var movieData = require('./data_2.json');
var math = require('mathjs');
var fs = require('fs');
var saved_factor_matrix1 = require('./FactorizedMatrixA.json');
var saved_factor_matrix2 =  require('./FactorizedMatrixB.json');

var factorized_matrix;

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
function test(bedsked) {
    console.log(bedsked);
}

module.exports = {
main: function() {
    // Add all entries
    add_all_ratings();
    // Fill all empty entries
    fill_empty_ratings()
    factorized_matrix = factorize(userMovieMatrix,60,1,0.002,true,currentUserIndex, false);


  for(let i = 0; i < 1000; i++) {
    console.log(factorized_matrix[0][i], userMovieMatrix[0][i]);
  }

    
  },
update_users: function() {
    ratingData = require('./ratings_data.json');
    add_all_ratings();
    fill_empty_ratings();
},

factorize_new_user: function(the_user_id) {
    let new_user_matrix = factorize(get_user_ratings_array(the_user_id),30,500,0.002,false,1,true);
    factorized_matrix.push(new_user_matrix[0]);
},
get_user_ratings_server: function(the_user_id) {
    return get_user_ratings_array_factorized(the_user_id);
}

};


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
// makes sure that every movie has a number for every movie, so if a user hasn't rated a movie, we insert 0 on that place.
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



//Returns an array with a specfic users rating. Takes the users id as parameter.
function get_user_ratings_array (user_id) {
  console.log(user_id,users[user_id]);
 let currentUserRow = users[user_id]; //Using the directory to find the row connect to the specific user
 let user_array = [[]];
 for(let i = 0; i < currentMovieIndex; i++) {
    user_array[0].push(userMovieMatrix[currentUserRow][i]);
 }

 return user_array;
}

function get_user_ratings_array_factorized (user_id) {
  let currentUserRow = users[user_id];
  let user_array = [[]];
  for(let i =0; i < currentMovieIndex; i++) {
    user_array[0].push(factorized_matrix[currentUserRow][i]);
  }

  return user_array;
}

//Factorize a given matrix. It is possible to change the amount of latent features, iterations, learning rate and how many users to look at.
//the use_saved parameter determine whetever the function should use saved factor matrixes, or use new random ones.
//After this function is finished, it safes the two factor matrixes in two documents;  FactorizedMatrixA.json & FactorizedMatrixB.json
function factorize(the_matrix, latent_features, iterations, learning_rate, use_saved, user_count, new_user) {  
    //Make the two factor matrices, 1 & 2, with random numbers.
    let factor_matrix1;
    let factor_matrix2;

    //Here we check if we check if we should use old or new random matrixes.
    if(use_saved) {
        factor_matrix1 = saved_factor_matrix1;
        factor_matrix2 = saved_factor_matrix2;
        console.log("Starting matrix factorization, with saved matrixes.");
    }else{
        factor_matrix1 = make_factor_matrix(latent_features,user_count);
        factor_matrix2 = math.transpose(make_factor_matrix(latent_features,currentMovieIndex));
        console.log("Starting matrix factorization, with new matrixes.")
    }
    
    for(let n = 0; n < iterations; n++) {
        for(let i = 0; i < user_count; i++) {
            for(let j = 0; j < currentMovieIndex; j++) {
                
                //find current value of original matrix
                let current_value = the_matrix[i][j];
                //Only if the user rated this movie..
                if(current_value > 0) {
                    let error = current_value - math.multiply(factor_matrix1[i], column_vector(factor_matrix2,j));
                    
                    
                    //Update each element in the two factor matrix, by using the update_latent_feature function.
                    for(let k = 0; k < latent_features; k++) {
                        let factor_matrix1_latent_feature = factor_matrix1[i][k];
                        let factor_matrix2_latent_feature = factor_matrix2[k][j];
                        
                        factor_matrix1[i][k] = update_latent_feature(factor_matrix1_latent_feature,factor_matrix2_latent_feature,error,learning_rate);
                        factor_matrix2[k][j] = update_latent_feature(factor_matrix2_latent_feature,factor_matrix1_latent_feature,error,learning_rate);
                    }
                }
            }
        }
        console.log(n);
    }

    //Save the two factor matrix, A & B, so that we don't have to do this process again. Each file will be overwritten when a new file is saved.
    if(!new_user) {
    fs.writeFile("FactorizedMatrixA.json", JSON.stringify(factor_matrix1, null, 4), function (err) {
        if (err) throw err;
        console.log('Matrix A updated');
    });
    fs.writeFile("FactorizedMatrixB.json", JSON.stringify(factor_matrix2, null, 4), function (err) {
        if (err) throw err;
        console.log('Matrix B updated');
    });
    }else{
        saved_factor_matrix1.push(factor_matrix1[0]);
        fs.writeFileSync("FactorizedMatrixA.json", JSON.stringify(saved_factor_matrix1, null, 4), function (err) {
            if (err) throw err;
            console.log('Matrix A updated');
        });
    }
    

    //print out the final total error
    console.log(find_rmse(the_matrix,factor_matrix1,factor_matrix2, user_count));
    
    //Return the new matrix, A * B.
    return math.multiply(factor_matrix1,factor_matrix2);
}

// Updates the number is our matrices, moving us hopefully moving us closer to our true values from our target matrix
function update_latent_feature(latent1, latent2, error, learning_rate) {
  //The formula from latex, in the matrix factorization section
    return latent1 + 2 * learning_rate * error * latent2;
}

//Provides us with the column needed to multiply 
function column_vector(matrix, index) {
    return matrix.map(m => m[index]); 
}

//Generates the two factor matrices filled with random numbers to calculate on.
function make_factor_matrix (latent_features, count) {
    let factor_matrix = [];
    for(let i = 0; i < count; i++) {
        factor_matrix.push([]);
        for(let j = 0; j < latent_features; j++) {
          //Make sure there is only a few decimals in the random numbers.
            factor_matrix[i].push(Math.round(Math.random() * 10) / 10);
        }    
      }
    return factor_matrix;
}


//Finds the Root Mean Square Error, which tells us how far our matrix is to the target matrix
function find_rmse (the_matrix, factor_matrix1, factor_matrix2, user_count) {
    
    let total_error = 0;
    for(let i = 0; i < user_count; i++) {
        for(let j = 0; j < currentMovieIndex; j++) {
            
            
            let y = the_matrix[i][j];
            //Only if the user rated this movie..
            if(y > 0) {
                let y1 = math.multiply(factor_matrix1[i], column_vector(factor_matrix2,j));        
                total_error += Math.sqrt((Math.pow(y1 - y,2)));
            }
        }
    }
    return total_error;
}
