HOW TO START THE SERVER:
	1. Open command prompt
	2. Go to the correct directory
	3. Type "node server.js"
	4. The server will now start up, and can be accesed at "127.0.0.1"
	*** NOTICE THAT A MONGODB DATABASE MUST BE CREATED FOR THE SERVER TO WORK, WHICH IS EXPLAINED IN THE NEXT SECTION ***

HOW TO CREATE CORRECT MONGODB DATABASE:
	1. Create a database called 'MovieRecommender'
	2. Create a collection called 'Users'
	3. The database is now created.


HOW TO NAVIGATE IN FILES:
	BACKEND FILES:
		server.js: this file handles all server sockets, and is primary link between the client and the server. Functions like creating a user and sending ratings from server to client can be found here.
		factorize.js: this file handles the matrix factorization algorithm. This file is linked with server.js. 
		
	FRONTEND FILES:
		index.html: This file is the first page you see when going to the website. It's here where you login or register as a user.
		ratemovies.html: This is the file that makes it possible for the user to select liked genres. The user is only directed to this page, when logging in for the first time.
		ratemovies2.html: This is the file where the user is asked to rate 10 movies. The user is only directed to this page, when logging in for the first time.
		frontpage.html: This is the file which shows all the recommeded movies. This page can only be accessed if the user is logged in.
	DATA FILES:
		FactorizedMatrixA.json : This json files store the factor matrix A.
		FactorizedMatrixB: This json files store the factor matrix B.
		Data_2.json: This file stores all the movies from movielens. Each movies has an id, title, genres and poster img.
		ratings_data.json: This file stores all ratings from users. This includes movielens users and users registered on the website. Each user has an userId, movieId, rating and timestamp.

	TEST FILES:
		endtoend.test.js : This file is for doing the end to end test explained in the report. The test goes through the whole webpage, and test every function.
		server.test.js : This file includes all integration tests done on the functions from the server.js file.
		factorize.test.js : This file includes all unit tests done on the function from factorize.js file.
		*** NOTICE THAT ALL THESE TEST REQUIRE PUPPETEER AND JEST ***

A FULLY WORKING VERSION OF THE PROGRAM CAN BE FOUND ON http://www.goesmago.com
