const mongoose = require('mongoose');

const user_template = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const user = mongoose.model('user', user_template);

module.exports = user;