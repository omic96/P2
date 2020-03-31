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

let test1, test2;

main();

let testMatrx = [[4,4,2,0],[2,0,4,2],[2,0,5,5],[3,0,2,0]];

console.log(factorizeMatrix(userMovieMatrix));


function factorizeMatrix(TARGET_MATRIX, LATENT_FEATURES_COUNT=7, ITERS=5000, LEARNING_RATE=0.0002, REGULARIZATION_RATE=0.02, THRESHOLD=0.001) {
  const FACTOR1_ROW_COUNT = currentUserIndex
  const FACTOR2_ROW_COUNT = currentMovieIndex
  const factorMatrix1 = fillMatrix(FACTOR1_ROW_COUNT, LATENT_FEATURES_COUNT, () => Math.random())
  const factorMatrix2 = fillMatrix(FACTOR2_ROW_COUNT, LATENT_FEATURES_COUNT, () => Math.random())
  const transposedFactorMatrix2 = transpose(factorMatrix2)
  const ROW_COUNT = TARGET_MATRIX.length
  const COLUMN_COUNT = TARGET_MATRIX[0].length
  const updateLatentFeature = (latentFeatureA, latentFeatureB, error) => latentFeatureA + LEARNING_RATE * (2 * error * latentFeatureB - REGULARIZATION_RATE * latentFeatureA)



  doFor(ITERS, () => {

    // Iteratively figure out correct factors
    doFor(ROW_COUNT, i => {
      doFor(COLUMN_COUNT, j => {

        // Get actual value on target matrix
        const TRUE_VALUE = TARGET_MATRIX[i][j]
        
          // Process non-empty values
          if (TRUE_VALUE > 0) {
  
            // Get difference of actual value and the current approximate value as error
            const CURRENT_VALUE = dot(factorMatrix1[i], columnVector(transposedFactorMatrix2, j))
            const ERROR = TRUE_VALUE - CURRENT_VALUE
  
            // Update factor matrices
            doFor(LATENT_FEATURES_COUNT, k => {
  
              const latentFeatureA = factorMatrix1[i][k]
              const latentFeatureB = transposedFactorMatrix2[k][j]

              // Update latent feature k of factor matrix 1
              factorMatrix1[i][k] = updateLatentFeature(latentFeatureA, latentFeatureB, ERROR)
              
              // Update latent feature k of factor matrix 2
              transposedFactorMatrix2[k][j] = updateLatentFeature(latentFeatureB, latentFeatureA, ERROR)
            })
          }
      })
    })
  
    // Calculating totalError
    const TOTAL_ERROR = calculateError(ROW_COUNT, COLUMN_COUNT, TARGET_MATRIX, LATENT_FEATURES_COUNT, REGULARIZATION_RATE, factorMatrix1, transposedFactorMatrix2)
      console.log(TOTAL_ERROR);
    // Complete factorization process if total error falls below a certain threshold
    if (TOTAL_ERROR < THRESHOLD) return
  })

  return [factorMatrix1, transpose(transposedFactorMatrix2)]
}

/**
 * Calculate total error of factor matrices
 * 
 * @param {Number} ROW_COUNT 
 * @param {Number} COLUMN_COUNT 
 * @param {Array} TARGET_MATRIX 
 * @param {Number} LATENT_FEATURES_COUNT 
 * @param {Number} REGULARIZATION_RATE 
 * @param {Array} factorMatrix1 
 * @param {Array} transposedFactorMatrix2 
 * @returns {Number}
 * @private
 */
function calculateError(ROW_COUNT, COLUMN_COUNT, TARGET_MATRIX, LATENT_FEATURES_COUNT, REGULARIZATION_RATE, factorMatrix1, transposedFactorMatrix2) {
  let totalError = 0

  doFor(ROW_COUNT, i => {
    doFor(COLUMN_COUNT, j => {

      // Get actual value on target matrix
      const TRUE_VALUE = TARGET_MATRIX[i][j]
      
      // Process non-empty values
      if (TRUE_VALUE > 0) {

        // Get difference of actual value and the current approximate value as error
        const CURRENT_VALUE = dot(factorMatrix1[i], columnVector(transposedFactorMatrix2, j))
        const ERROR = TRUE_VALUE - CURRENT_VALUE

        // Increment totalError with current error
        totalError = totalError + square(ERROR)

        doFor(LATENT_FEATURES_COUNT, k => {
          totalError = totalError + (REGULARIZATION_RATE / 2) * (square(factorMatrix1[i][k]) + square(transposedFactorMatrix2[k][j]))
        })
      }
    })
  })

  return totalError
}

/**
 * Build completed matrix from matrix factors.
 * 
 * @param {Array} factors Derived matrix factors
 * @returns {Array} Completed matrix
 */
function buildCompletedMatrix(factors) {
  const [FACTOR1, FACTOR2] = factors

  return dot(FACTOR1, transpose(FACTOR2))
}

/***************************
 * Helper Functions        *
 ***************************/

/**
 * Transposes a matrix
 * 
 * @param {Array} matrix Target matrix
 * @returns {Array} The transposed matrix
 * @private
 */
function transpose(matrix) {
  if (isMatrix(matrix)) {
    const TRANSPOSED_ROW_COUNT = matrix[0].length
    const TRANSPOSED_COLUMN_COUNT = matrix.length
    const transposed = fillMatrix(TRANSPOSED_ROW_COUNT, TRANSPOSED_COLUMN_COUNT, () => 0)
  
    return transposed.map((t, i) => t.map((u, j) => matrix[j][i]))
  } else {
    return matrix
  }
}

/**
 * Checks if value passed is a matrix.
 * 
 * @param {Array} m Value to check
 * @returns {boolean} True if matrix, false if not
 * @private
 */
function isMatrix(m) {
  return Array.isArray(m[0])
}

/**
 * Gets the dot product of two matrices.
 * 
 * @param {Array} m First matrix
 * @param {Array} n Second matrix
 * @returns {Array} Dot product of the two matrices
 * @private
 */
function dot(m, n) {
  const transposedN = transpose(n)

  if (!isMatrix(m) && !isMatrix(n)) {
    return dotVectors(m, n)
  }

  return m.map(row => transposedN.map(column => dotVectors(row, column)))
}

/**
 * Gets the column vector at given index.
 * 
 * @param {Array} matrix 
 * @param {Number} index
 * @returns {Array}
 * @private
 */
function columnVector(matrix, index) {
  return matrix.map(m => m[index])
}

/**
 * Multiplies vectors together and sums the resulting vector up.
 * 
 * @param {Array} v 
 * @param {Array} w 
 * @returns {Number}
 * @private
 */
function dotVectors(v, w) {
  return bimap(v, w, (x, y) => x * y).reduce((sum, x) => sum + x)
}

/**
 * Reduces two lists into one using the given function.
 * 
 * @param {Array} a1 
 * @param {Array} a2 
 * @param {Function} fn A function that accepts two values and returns a single value 
 * @returns A list which is a combination of the two lists
 * @private
 */
function bimap(a1, a2, fn) {
  return a1.map((item, i) => fn(item, a2[i]))
}

/**
 * Squares a number
 * 
 * @param {Number} x 
 * @returns {Number}
 * @private
 */
function square(x) {
  return Math.pow(x, 2)
}

/**
 * Creates an n x m matrix filled with the result of given fill function
 * 
 * @param {Array} n Number of rows
 * @param {Array} m Number of columns
 * @param {Function} fill Function used to fill the matrix with
 * @returns {Array} The filled matrix
 * @private
 */
function fillMatrix(n, m, fill = () => 0) {
  let matrix = []
  for (let i = 0; i < n; i++) {
    matrix.push([])
    for (let j = 0; j < m; j++) {
      matrix[i][j] = fill()
    }
  }

  return matrix
}

/**
 * Execute given function n times.
 * 
 * @param {Number} n Number of times to execute function
 * @param {Function} fn Function to execute
 * @private
 */
function doFor(n, fn) {
  let i = 0
  while(i < n) fn(i++)
}