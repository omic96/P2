const express = require('express');
const ejs_express_layouts = require('express-ejs-layouts');
const mongoose_database = require('mongoose');
const passport = require('passport');

const express_app = express();

//Require passport authetication config
require('./config/passport_auth')(passport);

//Database Connect
const data_base = require('./config/mongodb_auth').MongoURI;
mongoose_database.connect(data_base, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("Connected to database: " + data_base))
.catch(err => console.log("ERROR:" + err));


//EJS
express_app.use(ejs_express_layouts);
express_app.set('view engine', 'ejs');

//Bodyparser
express_app.use(express.urlencoded( { extended: false } ));

express_app.use(passport.initialize());
express_app.use(passport.session());

//Routes
express_app.use('/', require('./routes/index'));
express_app.use('/users', require('./routes/users'));


//PORT to run app
const port = 5000;

express_app.listen(port, console.log(`SERVER START PORT: ${port}`));