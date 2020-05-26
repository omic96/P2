let rating_data = require('./ratings_data.json');
let movie_data = require('./data_2.json');
let math = require('mathjs');
let fs = require('fs');
let saved_factor_matrix_A = require('./FactorizedMatrixA.json');
let saved_factor_matrix_B = require('./FactorizedMatrixB.json');

// This variable stores the complete factorized matrix
let factorized_matrix;

// To know what column or row a specific movie or user belongs to
// KEY: User or Movie ID's 
let users = {};
let movies = {};

// To know what user or movie a specific column or row belongs to
// KEY: Index of row or column
let user_rows = {};
let movie_columns = {};

// Data for all movies
// KEY: MovieID
let movie_list = {};

// The current index of the last movie and user in the matrix
let current_movie_index = 0;
let current_user_index = 0;

// [X = Movies][Y = Users]
let user_movie_matrix = [[]];

// A variable to store the users data
// This is used for debugging
let user_database;

//Class constructor
class user_ratings {
    constructor(user_ID, movie_ID, rating) {
        this.user = user_ID;
        this.movie = movie_ID;
        this.rating = rating;
    }
}

// This function updates the matrix after a new user has been added to the database
exports.update_users = () => {
    rating_data = require('./ratings_data.json');
    add_all_ratings();
    fill_empty_ratings();
}

exports.main = () => {
    // Add all entries
    add_all_ratings();
    // Fill all empty entries
    fill_empty_ratings();


    //This will factorize the matrix from scratch. Used if we want to try new settings
    //factorized_matrix = factorize(user_movie_matrix,60,1000,0.002,0.8,false,current_user_index, false);

    // A * B = M (From latex)
    factorized_matrix = math.multiply(saved_factor_matrix_A, saved_factor_matrix_B);

    //Used for debugging. Prints out ratings from factorized_matrix and user_move_matrix. Used to check how close the factorized_matrix is to user_move_matrix
    /*
    for(let i = 0; i < 200;i++) {
        console.log(factorized_matrix[0][i]);
    }
    */

    // Used in find_best_ratings to find movie information
    for (let entry in movie_data) {
        let movie_ID = movie_data[entry].movieId;
        let movie_title = movie_data[entry].title;
        let movie_Genres = movie_data[entry].genres;
        let movie_Image = movie_data[entry].poster_img;

        movie_list[movie_ID] = {
            title: movie_title,
            genres: movie_Genres,
            image: movie_Image
        };
    }
}

// Loads and sends all ratings to be added
function add_all_ratings() {
    for (let entry in rating_data) {
        let user_ID = rating_data[entry].userId;
        let movie_ID = rating_data[entry].movieId;
        let rating = rating_data[entry].rating;

        add_user_rating(user_ID, movie_ID, rating);
    }
}

// Adds a rating to the matrix
function add_user_rating(user, movie, rating) {
    // The rows and columns to add the rating to
    let user_row;
    let movie_column;

    // Check if user already has a row
    if (user in users) {
        user_row = users[user];
    }
    else {
        // Give the next empty row to the current user
        user_row = current_user_index;
        // Save the given row for this user in the dict
        users[user] = user_row;
        // Increment current index
        current_user_index++;
    }

    // Check if movie already has a column
    if (movie in movies) {
        movie_column = movies[movie];
    }
    else {
        // Give the next empty column to the current movie
        movie_column = current_movie_index;
        // Save the given column for this movie in the dict
        movies[movie] = movie_column;
        // Increment current index
        current_movie_index++;
        // Add new column to the matrix
        user_movie_matrix[movie_column] = [];
    }

    // Save the index of both the movie and the user to use for future lookups
    user_rows[user_row] = user;
    movie_columns[movie_column] = movie;

    // Add the rating to the matrix
    user_movie_matrix[user_row][movie_column] = rating;
}

// makes sure that every movie has a number for every movie, so if a user hasn't rated a movie, we insert 0 on that place.
function fill_empty_ratings() {
    for (i = 0; i < current_user_index; i++) {
        for (j = 0; j < current_movie_index; j++) {
            if (!user_movie_matrix[i][j]) {
                user_movie_matrix[i][j] = 0;
            }
        }
    }
}

// Prints the movie info and ratings for all rated movies by a user(Is not used in the final program. Used for debugging)
function get_user_ratings(userId) {

    let current_user_row = users[userId]
    for (i = 0; i < current_movie_index; i++) {
        // Only print something if the user has given a rating to this movie
        if (user_movie_matrix[current_user_row][i]) {

            user_database = new user_ratings(userId, movie_list[movie_columns[i]].title, user_movie_matrix[current_user_row][i])

            console.log(user_database);
        }
    }
}

//Returns an array with a specfic users rating. Takes the users id as parameter.
function get_user_ratings_array(user_id) {

    let current_user_row = users[user_id]; //Using the directory to find the row connect to the specific user
    let user_array = [[]];
    for (let i = 0; i < current_movie_index; i++) {
        user_array[0].push(user_movie_matrix[current_user_row][i]);
    }

    return user_array;
}



//Returns an array with a specfic users rating that has been factorized.
exports.get_user_ratings_array_factorized = (user_id) => {
    let current_user_row = users[user_id];
    let user_array = [[]];
    for (let i = 0; i < current_movie_index; i++) {
        user_array[0].push(factorized_matrix[current_user_row][i]);
    }

    return user_array;
}

//Factorizes a specific user. Uses same parameters as factorize
exports.factorize_new_user = (the_user_id) => {
    let new_user_matrix = factorize(get_user_ratings_array(the_user_id), 60, 500, 0.002, 0.8, false, 1, true, the_user_id);
    factorized_matrix[users[the_user_id]] = new_user_matrix[0];
}

//Factorize a given matrix. It is possible to change the amount of latent features, iterations, learning rate and how many users to look at.
//the use_saved parameter determine whetever the function should use saved factor matrixes, or use new random ones.
//After this function is finished, it safes the two factor matrixes in two documents;  FactorizedMatrixA.json & FactorizedMatrixB.json
function factorize(the_matrix, latent_features, iterations, learning_rate, regularization_rate, use_saved, user_count, new_user, user_id) {
    //Make the two factor matrices, 1 & 2, with random numbers.
    let factor_matrix_A;
    let factor_matrix_B;

    //Here we check if we check if we should use old or new random matrixes.
    if (use_saved) {
        factor_matrix_A = saved_factor_matrix_A;
        factor_matrix_B = saved_factor_matrix_B;
        console.log("Starting matrix factorization, with saved matrixes.");
    }

    else {
        factor_matrix_A = exports.make_factor_matrix(latent_features, user_count);
        if (!new_user) {
            factor_matrix_B = math.transpose(exports.make_factor_matrix(latent_features, current_movie_index));
        } else {
            factor_matrix_B = saved_factor_matrix_B;
        }
        console.log("Starting matrix factorization, with new matrixes.")
    }

    for (let n = 0; n < iterations; n++) {
        for (let i = 0; i < user_count; i++) {
            for (let j = 0; j < current_movie_index; j++) {
                //find current value of original matrix
                let current_value = the_matrix[i][j];
                //Only if the user rated this movie..
                if (current_value > 0) {
                    let error = current_value - math.multiply(factor_matrix_A[i], exports.column_vector(factor_matrix_B, j));

                    //Update each element in the two factor matrix, by using the update_latent_feature function.
                    for (let k = 0; k < latent_features; k++) {
                        let factor_matrix_A_latent_feature = factor_matrix_A[i][k];
                        let factor_matrix_B_latent_feature = factor_matrix_B[k][j];

                        factor_matrix_A[i][k] = exports.update_latent_feature(factor_matrix_A_latent_feature, factor_matrix_B_latent_feature, error, learning_rate, regularization_rate);

                        if (!new_user) {
                            factor_matrix_B[k][j] = exports.update_latent_feature(factor_matrix_B_latent_feature, factor_matrix_A_latent_feature, error, learning_rate, regularization_rate);
                        }
                    }
                }
            }
        }
        console.log(n);
    }

    //Save the two factor matrix, A & B, so that we don't have to do this process again. Each file will be overwritten when a new file is saved.
    if (!new_user) {
        fs.writeFile("FactorizedMatrixA.json", JSON.stringify(factor_matrix_A, null, 4), function (err) {
            if (err) throw err;
            console.log('Matrix A updated');
        });
        fs.writeFile("FactorizedMatrixB.json", JSON.stringify(factor_matrix_B, null, 4), function (err) {
            if (err) throw err;
            console.log('Matrix B updated');
        });
    }

    else {
        saved_factor_matrix_A[users[user_id]] = factor_matrix_A[0];
        fs.writeFile("FactorizedMatrixA.json", JSON.stringify(saved_factor_matrix_A, null, 4), function (err) {
            if (err) throw err;
            console.log('Matrix A updated');
        });

    }



    //print out the final total error
    console.log(exports.find_rmse(the_matrix, factor_matrix_A, factor_matrix_B, user_count, current_movie_index));

    //Return the new matrix, A * B.
    return math.multiply(factor_matrix_A, factor_matrix_B);
}

// Updates the number is our matrices, moving us hopefully moving us closer to our true values from our target matrix
exports.update_latent_feature = (latent1, latent2, error, learning_rate, regularization_rate) => {
    //The formula from latex, in the matrix factorization section
    //return latent1 + 2 * learning_rate * error * latent2;

    return latent1 + learning_rate * (2 * error * latent2 - regularization_rate * latent1);
}

exports.remove_row_from_matrix_a = (user_id) => {
    saved_factor_matrix_A.splice(users[user_id], 1);
    fs.writeFile("FactorizedMatrixA.json", JSON.stringify(saved_factor_matrix_A, null, 4), function (err) {
        if (err) throw err;
        console.log('Matrix A updated');
    });
}

//Provides us with the column needed to multiply 
exports.column_vector = (matrix, index) => {
    return matrix.map(m => m[index]);
}

//Generates the two factor matrices filled with random numbers to calculate on.
exports.make_factor_matrix = (latent_features, count) => {

    let factor_matrix = [];
    for (let i = 0; i < count; i++) {
        factor_matrix.push([]);
        for (let j = 0; j < latent_features; j++) {
            //Make sure there is only a few decimals in the random numbers.
            factor_matrix[i].push(Math.round(Math.random() * 10) / 10);
        }
    }
    return factor_matrix;
}

//Finds the Root Mean Square Error, which tells us how far our matrix is to the target matrix
exports.find_rmse = (the_matrix, factor_matrix1, factor_matrix2, user_count, movie_count) => {

    let total_error = 0;
    let ratings_count = 0;
    for (let i = 0; i < user_count; i++) {
        for (let j = 0; j < movie_count; j++) {
            let y = the_matrix[i][j];
            //Only if the user rated this movie..
            if (y > 0) {
                let y1 = math.multiply(factor_matrix1[i], exports.column_vector(factor_matrix2, j));
                total_error += Math.sqrt((Math.pow(y1 - y, 2)));
                ratings_count++;
            }
        }
    }

    return total_error / ratings_count;
}


exports.find_best_ratings = (user_id) => {
    let current_user_row = users[user_id];
    let topRatings = [];

    for (let i = 0; i < current_movie_index; i++) {

            let movie_obj = {
                movieId: movie_columns[i],
                title: movie_list[movie_columns[i]].title,
                genres: movie_list[movie_columns[i]].genres,
                poster_img: movie_list[movie_columns[i]].image,
                rating: Math.round(factorized_matrix[current_user_row][i])
            }

            topRatings.push(movie_obj);
        }

    return topRatings;
}