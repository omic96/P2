 let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io'); 
let app = express();
let server = http.Server(app);
let io = socketIO(server); app.set('port', 80);
let fetch = require("node-fetch");
let fs = require("fs");

let movie_list = require('./data_2.json');
let movie_list_result = movie_list;

//Selected function exported from factorize.js
let {main, factorize_new_user, update_users, get_user_ratings_array_factorized,remove_row_from_matrix_a, find_best_ratings, } = require('./factorize.js');


//MongoDb
const { MongoClient, ObjectID } = require('mongodb');
let url = "mongodb://127.0.0.1:27017/";

app.use('/static', express.static(__dirname + '/static'));// Routing
app.use(express.static(__dirname + "/public"));
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'public/index.html'));
});

// Starts the server.
server.listen(80, function () {
    console.log('Starting server on port 80');
});

//Updates the User_movie_matrix upon server start
main();

let user_genre; 

//Display thumbnails
let movie_name_array = [];

//This is called when a user visits the site. The server is then listening for incoming sockets
io.on('connection', function (socket) {

    //When server recives a socket, call some function...

    socket.on("register", function(data) {
        register_user(data.name, data.pass,socket.id);
	});
	
	socket.on("login", function(data) {i
        login_user(data.name,data.pass, socket.id);
    });
    
    socket.on("send liked genres", function(genres) {
        user_genre = genres;
    });

    socket.on("get movie_list" , function() {
        io.sockets.connected[socket.id].emit('send movie_list', find_movies(user_genre,movie_list));
    });

    socket.on("send rated movies", function(rated_movies, user_id) {
        user_rates_movies(user_id,rated_movies);
        update_users_liked_genres(user_id, user_genre);
        update_user_logged_in(user_id, false);
    });

    socket.on("get data", function(user_id) {
        get_user_data(user_id, socket.id);
    });

    socket.on("rating movie on frontpage", function(movies_to_rate, user_id, star_rating) {
        movies_to_rate.rating = star_rating;
        user_rates_movies(user_id, movies_to_rate);
    });

    socket.on("reset account", function(id) {
        reset_user(id);
    })
    
});

function find_movies(user_genre, movie_list){
    let same_genre_movies = []; 
    let movies_to_rate = [];

    // Find movies with genres that the user liked
    for(let i = 0; i < user_genre.length; i++) {
        if(user_genre[i].liked == 1) {
            for(let j = 0; j < movie_list.length; j++) {
                if(movie_list[j].genres.includes(user_genre[i].name)) {
                    same_genre_movies.push({id: movie_list[j].movieId, title: movie_list[j].title, genre: movie_list[j].genres, image: movie_list[j].poster_img}); 
                }
            }
        }
    }
    
    //Picks 250 random movies from the same_genre_movies array
    for (let i = 0; i < 250; i++) {
        movies_to_rate[i] = same_genre_movies[Math.floor(Math.random() * same_genre_movies.length)] ; 
    }
    return movies_to_rate;
}


//Makes objects that exist of movie ratings for a specific user
function user_rates_movies(user_id, movies_to_rate){ 
    
    let user_rating = [];
    let ratings_data_file = require('./ratings_data.json'); //ratings_data_file skal erstattes, skal være anden variabel end moiveRatings, fordi den skal hentes hver gang den køres

    //Sorts and transforms the data into the correct format
    for (let i = 0; i < movies_to_rate.length; i++) {
       user_rating[i] = {userId: user_id, movieId : movies_to_rate[i].id, rating : movies_to_rate[i].rating, timestamp : "00"}; 
       ratings_data_file.push(user_rating[i]);
    } 

    //If movies_to_rate is 1
    if(movies_to_rate.length === undefined){
        user_rating = {userId: user_id, movieId : movies_to_rate.movieId, rating : movies_to_rate.rating, timestamp : "00"}; 

        //Check if rating already exist. The first 100800 ratings are from the dataset, so there is no need to look through these ratings.
        let already_exist = 0;
        for(let i = 100800; i < ratings_data_file.length; i++) {
            if(ratings_data_file[i].movieId == movies_to_rate.movieId && ratings_data_file[i].userId == user_id) {
                already_exist = i;
            }
        }

        if(already_exist > 0) { 
            ratings_data_file[already_exist] = user_rating;
        }else {
            ratings_data_file.push(user_rating);
        }
    }

    //Writes the data into a JSON file
    fs.writeFile("./ratings_data.json", JSON.stringify(ratings_data_file, null, 4), function (err) {
        if (err) throw err;
        console.log('ratings_data.json updated');
    });
    
    //Updates and factorizes the user. These functions come from factorize.js
    update_users();
    factorize_new_user(user_id);
}

//User Login
function login_user(name1, pass1, id) {

    //connect to MongoDB
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        //Specify which database
        let dbo = db.db("MovieRecommender");
        //Looking for object where name = name1 and password = pass1
        let query = { name: name1, password: pass1};
        dbo.collection("Users").find(query).toArray(function (err, result) {
            if (err) throw err;

            //If an object with the query exist:
            if(result != "") {
                io.sockets.connected[id].emit('login success', result[0].first_time_logged_in, result[0]._id);
                console.log(name1 + " loggede ind!");
                db.close();
            }else{
                io.sockets.connected[id].emit('login failed');
                db.close();
            }
        });
    });
}


//User registration
function register_user(name1, pass1, id) {
    
    //connect to mongodb
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db("MovieRecommender");
        //Create the object that we want to inster into the database
        let myobj = { name: name1, password: pass1, first_time_logged_in: true, liked_genres: [] };

        //Check if there already is an object with that name.
        let query = {name: name1};
        dbo.collection("Users").find(query).toArray(function(err,result) {
            if(result == "") {
                dbo.collection("Users").insertOne(myobj, function (err, res) {
                    if (err) throw err;
                    console.log("oprettede bruger med navn " + name1 + " og kode " + pass1);
                    db.close();
                    io.sockets.connected[id].emit('register success');
                });
            }else{
                io.sockets.connected[id].emit('register failed');
            }
        })
    });
}

//Update the first_time_logged_in boolean in the database
function update_user_logged_in(id, set) {
    MongoClient.connect(url, function (err, db) {
        if(err) throw err;
        let dbo = db.db("MovieRecommender");

        dbo.collection("Users").updateOne(
            {_id: ObjectID(id) },
            {
                $set: {first_time_logged_in: set} 
            }
        )
    });
}

function reset_user (id) {
    let ratings_data_file = require('./ratings_data.json');
    //Remove the users row in Matrix A (This function comes from factorize.js)
    remove_row_from_matrix_a(id);

    //Remove all ratings from ratings_data.json
    for(let i = 100800; i < ratings_data_file.length; i++) {
        if(ratings_data_file[i].userId === id) {
            ratings_data_file.splice(i,1);
            i--;
        }
    }

    fs.writeFile("./ratings_data.json", JSON.stringify(ratings_data_file, null, 4), function (err) {
        if (err) throw err;
        console.log('ratings_data.json updated');
    });

    //Change first time loggged in, in mongodb.
    update_user_logged_in(id,true);
}

//For mongodb to check the genres the user prefers
function update_users_liked_genres(id, user_genre){
    MongoClient.connect(url, function (err, db) {
        if(err) throw err;
        let dbo = db.db("MovieRecommender");

        dbo.collection("Users").updateOne(
            {_id: ObjectID(id) },
            {
                $set: {liked_genres: user_genre}
            }
        )
    });
}


//Send the data from a specific user.
function get_user_data(user_id, socket_id) {

    let user_data = {
        id : user_id,
        name: "",
        liked_genres: [],
        ratings : get_user_ratings_array_factorized(user_id),
        movies : find_best_ratings(user_id)
    };


    //Read name and liked_genres from database, and then send the user_data object.
    MongoClient.connect(url, function (err, db) {
        if(err) throw err;
        let dbo = db.db("MovieRecommender");

        let query = { _id: ObjectID(user_id)};
        dbo.collection("Users").find(query).toArray(function (err, result) {
            if (err) throw err;
            if(result != "") {
                user_data.name = result[0].name;
                user_data.liked_genres = result[0].liked_genres;
                io.sockets.connected[socket_id].emit('send data', user_data);
            }
    });

    db.close();
});

}


function get_thumbnails (i_start, i_end) {

    for(let i = 0; i < movie_list_result.length; i++) {
        if(movie_list_result[i].poster_img == undefined) {

            let array1 = movie_list_result[i].title.split(/[()]+/).filter(function(e) { return e; });
            let array2 = array1[0].split(/[,]+/).filter(function(e) { return e; });
            array2.push(array1[1]);

            let url = "http://api.themoviedb.org/3/search/movie?query=" + array2[0] + "&primary_release_year=" + array2[array2.length] + "&api_key=57d96d1905c6461a590da9ca31df2506";
            
            fetch(url)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                movie_list_result[i].poster_img = "https://image.tmdb.org/t/p/w600_and_h900_bestv2" + data.results[0].poster_path;
                test++;
            })
            .catch ((err) => {
                throw err;
            });

            movie_name_array.push(movie_list_result[i]);
        }
    }
    setTimeout(() => {
        fs.writeFile("./data_2.json", JSON.stringify(movie_list_result, null, 4), function (err) {
            if (err) throw err;
            console.log('ratings_data.json updated');
        });
    }, 60000);
}