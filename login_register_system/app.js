const express = require('express');
const express_layouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

const app = express();

//Database Connect
const db = require('./config/keys').MongoURI;
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("Connected to database..."))
.catch(err => console.log(err));


//EJS
app.use(express_layouts);
app.set('view engine', 'ejs');

//Bodyparser
app.use(express.urlencoded( { extended: false } ));

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));


//PORT to run app
const port = process.env.PORT || 5000;

app.listen(port, console.log(`Server started on PORT ${port}`));