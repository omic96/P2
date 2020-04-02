const http = require("http");
const fs = require("fs");

const hostname = "127.0.0.1";
const port = 3000;

var movieList = require('./data_2.json');
var moiveRatings = require('./ratings_data.json');

var user_genre; 

const server = http.createServer((req, res) => {
    switch (req.url) {
        case '/':
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(fs.readFileSync('./ratemovies.html'));
            res.end();
            break;
        case '/submit':
            req.on('data', (data) => {
                data = decodeURI(data);
                data = data.split(/=|&/); //splitter strengen mellem tegnene, så der kommer et array med genre brugeren har valgt
                data = data.filter((e) =>{
                    return e != 'genre';
                }) //filter tager en funktion ind, tjekker hvert element, hvis det er true ryger det ind i et array
                   // ellers smides det væk. her smides alle der ikke er 'genre' væk. 
                user_genre = data; 
                
                console.log(user_genre); //test
                
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write(fs.readFileSync('./ratemovies2.html'));

                res.end();
            });
            break;
        case '/rate':
            res.write(JSON.stringify(find_movies(user_genre, movieList)));
            res.end();
            break;

        case '/rate2':
            req.on('data', (data) => {
                res.end();
                data = decodeURI(data);
                data = JSON.parse(data);
                //console.log(data);
                user_rates_movies(3, data); 
            });
            break; 

        default:
            break;
    }
});

//Runs the server yeehaw!!!
function run_server(){
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    }); 
}

run_server();


function find_movies(user_genre, movieList){
    let same_genre_movies = []; 
    let movies_to_rate = [];

    // finde film med de genre brugeren kan lide 
    for (let i = 0; i < movieList.length; i++) {
        let current_movie_genre = movieList[i].genres.split("|"); //genrene i filmen findes
        //console.log(current_movie_genre); test

        /* //vi vælger film der har antal genre brugeren har valgt -1 (for mere variation)
        if (compare(user_genre, current_movie_genre).length === (user_genre.length - 1)) {  
                same_genre_movies.push({id: movieList[i].movieId, title: movieList[i].title}); //array med film id
            } */

         //vi vælger film der har antal genre brugeren har valgt -1 (for mere variation)
         if (compare(user_genre, current_movie_genre).length === ((user_genre.length > 1) ? (user_genre.length - 1) : user_genre.length)) {  
            same_genre_movies.push({id: movieList[i].movieId, title: movieList[i].title, genre: movieList[i].genres}); //array med film id
        } 

    }
    //vælger 10 random film fra same_genre_movies og sætter dem ind i movies_to_rate
    for (let i = 0; i < 10; i++) {
        movies_to_rate[i] = same_genre_movies[Math.floor(Math.random() * same_genre_movies.length)]; 
    }

    console.log(movies_to_rate);
    return movies_to_rate;
}


//ser hvor mange ens genre der er, returnerer et array med dem
function compare(user_genre_array, movie_genre_array){
    let finalarray = []; 
    user_genre_array.forEach((user_genre)=>movie_genre_array.forEach((movie_genre)=>{
        if(user_genre === movie_genre){ 
            finalarray.push(user_genre);
        }
    } 
    )); 
    return finalarray; 
}

//funktion der laver objekter med movie ratings til bestemt user 
function user_rates_movies(user_id, movies_to_rate){ 
    let user_rating = [];
    let test = require('./test.json'); //test skal erstattes, skal være anden variabel end moiveRatings, fordi den skal hentes hver gang den køres

    for (let i = 0; i < movies_to_rate.length; i++) {
       user_rating[i] = {userId: user_id, movieId : movies_to_rate[i].id, rating : movies_to_rate[i].rating, timestamp : 00}; //nyt objekt
       test.push(user_rating[i]);
        //gem i user ?
    } 
    fs.writeFileSync('./test.json', JSON.stringify(test).replace(/},{/g, "},\n{"));
}