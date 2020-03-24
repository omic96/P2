var movieList = require('./data_2.json');
var moiveRatings = require('./ratings_data.json');
var math = require('mathjs');

var movieListResult = movieList;
var movieRatingsResult = moiveRatings;

let theMatrix = math.matrix([[0,0]]);

let userCount = 0;
let movieCount = movieListResult.length;

let lastUser = 0;

for(let id in movieRatingsResult) {

	if(movieRatingsResult[id].userId != lastUser) {
		userCount++;
	}

	lastUser = movieRatingsResult[id].userId;
}


let EmptyMatrix = Matrix(userCount + 1,movieCount + 1,0);
let testArray = [];

for(let s in movieRatingsResult) {

	EmptyMatrix[movieRatingsResult[s].userId][movieRatingsResult[s].movieId] = movieRatingsResult[s].rating;

}

console.log(findDuplicates(testArray));
function Matrix(m, n, d){
    var mat = Array.apply(null, new Array(m)).map(
        Array.prototype.valueOf,
        Array.apply(null, new Array(n)).map(
            function() {
               return d;
            }
        )
    );
    return mat;
}

/*/
for(let id in movieListResult) {
	let currUser = movieRatingsResult[id].userId;
	let currMovie = movieListResult[id].movieId;
	theMatrix = math.concat(theMatrix,[[currUser,currMovie]],0);
}
/*/

console.log(EmptyMatrix[604][5]);

for(let id = 0; id < userCount; id++) {
	for(let id2 = 0; id2 < movieCount; id2++) {
		//console.log(EmptyMatrix[id][id2]);
	}
}

