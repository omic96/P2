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

app.use('/static', express.static(__dirname + '/static'));// Routing
app.use(express.static(__dirname + "/public"));
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'public/frontpage.html'));
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
		    movie_list_result[i].posterImg = "https://image.tmdb.org/t/p/w600_and_h900_bestv2" + data.results[0].poster_path;
		  });
		movie_name_array.push(movie_list_result[i]);
	}
}


io.on('connection', function (socket) {

	socket.emit("hej", movie_name_array);
});