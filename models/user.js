const mongoose = require('mongoose')

//Creating a schema for user table
const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    permission: {
        type: String,
        required: true
    }
})

//Exporting the module
module.exports = mongoose.model('user', userSchema)