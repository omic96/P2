const express = require('express');
const router = express.Router();

//Main page of login/register
router.get('/', (req, res) => res.render('welcome'));

//Main page of movie site goes here
router.get('/movie_main_page', (req, res) => res.render('movie_main_page'));

module.exports = router;