let express = require('express');
let http = require('http');
let path = require('path');
let socketIO = require('socket.io'); 
let app = express();
let server = http.Server(app);
let io = socketIO(server); app.set('port', 30);
let fetch = require("node-fetch");

let movieList = require('./data_2.json');
let movie_list_result = movieList;

//MongoDb
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/";


app.use('/static', express.static(__dirname + '/static'));// Routing
app.use(express.static(__dirname + "/public"));
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'public/index.html'));
});

// Starts the server.
server.listen(30, function () {
    console.log('Starting server on port 30');
});

let request = require("request")


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
	
	socket.on("login", function(data) {
        login_user(data.name,data.pass, socket.id);
	});
	

});


function login_user(name1, pass1, id) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("MovieRecommender");
        var query = { name: name1, password: pass1};
        dbo.collection("Users").find(query).toArray(function (err, result) {
            if (err) throw err;
            if(result != "") {
            io.sockets.connected[id].emit('login success');
            console.log(name1 + " loggede ind!");
            }else{
            io.sockets.connected[id].emit('login failed');
            }
            db.close();
        });
    });
}


function register_user(name1, pass1, id) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("MovieRecommender");
        var myobj = { name: name1, password: pass1};

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