let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io'); 
let app = express();
let server = http.Server(app);
let io = socketIO(server); app.set('port', 30);
let fetch = require("node-fetch");
let fs = require("fs");

let movieList = require('./data_2.json');
let movie_list_result = movieList;

let factorizeJS = require('./factorize.js');

//MongoDb
const { MongoClient, ObjectID } = require('mongodb');
let url = "mongodb://127.0.0.1:27017/";

app.use('/static', express.static(__dirname + '/static'));// Routing
app.use(express.static(__dirname + "/public"));
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'public/index.html'));
});

// Starts the server.
server.listen(30, function () {
    console.log('Starting server on port 30');
});

//Updates and factorizes the UserMovieMatrix upon server start
factorizeJS.main();

let request = require("request");
let user_genre; 

//Display thumbnails
let movie_name_array = [];
for(let i = 0; i < movie_list_result.length; i++) {
	if(i < 200) {
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
		  });
		movie_name_array.push(movie_list_result[i]);
	}
}

io.on('connection', function (socket) {

	socket.emit("send_movie_array", movie_name_array);

	socket.on("register", function(data) {
        register_user(data.name, data.pass,socket.id);
	});
	
	socket.on("login", function(data) {i
        login_user(data.name,data.pass, socket.id);
    });
    
    socket.on("send liked genres", function(genres) {
        user_genre = genres;
    });

    socket.on("get movielist" , function() {
        io.sockets.connected[socket.id].emit('send movielist', find_movies(user_genre,movieList));
    });

    socket.on("send rated movies", function(rated_movies, user_id) {
        user_rates_movies(user_id,rated_movies);
        update_users_liked_genres(user_id, user_genre);
        update_user_logged_in(user_id);
    });

    socket.on("get ratings", function(user_id) {
        io.sockets.connected[socket.id].emit('send ratings', factorizeJS.get_user_ratings_server(user_id));
    });

    socket.on("et eller andet", function(movies_to_rate, user_id, star_rating) {
        movies_to_rate.rating = star_rating;
        user_rates_movies(user_id, movies_to_rate);
    });
    
});

function find_movies(user_genre, movieList){
    let same_genre_movies = []; 
    let movies_to_rate = [];

    // finde film med de genre brugeren kan lide 
    for (let i = 0; i < movieList.length; i++) {
        let current_movie_genre = movieList[i].genres.split("|"); //genrene i filmen findes

         //vi vælger film der har antal genre brugeren har valgt -1 (for mere variation)
         if (compare(user_genre, current_movie_genre).length === ((user_genre.length > 1) ? (user_genre.length - 1) : user_genre.length)) {  
            same_genre_movies.push({id: movieList[i].movieId, title: movieList[i].title, genre: movieList[i].genres}); //array med film id
        } 
    }
    //vælger 10 random film fra same_genre_movies og sætter dem ind i movies_to_rate
    for (let i = 0; i < 10; i++) {
        movies_to_rate[i] = same_genre_movies[Math.floor(Math.random() * same_genre_movies.length)]; 
    }

    //console.log(movies_to_rate);
    return movies_to_rate;
}

//ser hvor mange ens genre der er, returnerer et array med dem
function compare(user_genre_array, movie_genre_array){
    let finalarray = []; 
    user_genre_array.forEach((user_genre)=>movie_genre_array.forEach((movie_genre)=>{
        if(user_genre === movie_genre){ 
            finalarray.push(user_genre);
        }
    })); 
    return finalarray; 
}


//funktion der laver objekter med movie ratings til bestemt user 
function user_rates_movies(user_id, movies_to_rate){ 
    
    let user_rating = [];
    let ratings_data_file = require('./ratings_data.json'); //ratings_data_file skal erstattes, skal være anden variabel end moiveRatings, fordi den skal hentes hver gang den køres

    //Sorts and transforms the data into the correct format
    for (let i = 0; i < movies_to_rate.length; i++) {
       user_rating[i] = {userId: user_id, movieId : movies_to_rate[i].id, rating : movies_to_rate[i].rating, timestamp : "00"}; //nyt objekt
       ratings_data_file.push(user_rating[i]);
    } 

    //If movies_to_rate is 1
    if(movies_to_rate.length === undefined){
        user_rating = {userId: user_id, movieId : movies_to_rate.movieId, rating : movies_to_rate.rating, timestamp : "00"}; //nyt objekt
        ratings_data_file.push(user_rating);
    }
    //Writes the data into a JSON file
    fs.writeFile("./ratings_data.json", JSON.stringify(ratings_data_file, null, 4), function (err) {
        if (err) throw err;
        console.log('ratings_data.json updated');
    });
    
    //Updates and factorizes the user
    factorizeJS.update_users();
    factorizeJS.factorize_new_user(user_id);
}

//User Login
function login_user(name1, pass1, id) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db("MovieRecommender");
        let query = { name: name1, password: pass1};
        dbo.collection("Users").find(query).toArray(function (err, result) {
            if (err) throw err;
            if(result != "") {
                io.sockets.connected[id].emit('login success', result[0].first_time_logged_in, result[0]._id);
                console.log(name1 + " loggede ind!");
            }else{
                io.sockets.connected[id].emit('login failed');
            }
            db.close();
        });
    });
}

//User registration
function register_user(name1, pass1, id) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db("MovieRecommender");
        let myobj = { name: name1, password: pass1, first_time_logged_in: true, liked_genres: [] };

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

//To check if user has done a first time login
function update_user_logged_in(id) {
    MongoClient.connect(url, function (err, db) {
        if(err) throw err;
        let dbo = db.db("MovieRecommender");

        dbo.collection("Users").updateOne(
            {_id: ObjectID(id) },
            {
                $set: {first_time_logged_in: false} 
            }
        )
    });
}

//For mongodb to check the genre the user liked
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