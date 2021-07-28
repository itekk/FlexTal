require('dotenv').config()
//importing express and mongoose
const express = require('express')
const mongoose = require('mongoose')

//Defining express app
const app = express()

//Connecting with the database
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true})
const con = mongoose.connection

//Use express json to read json properties
app.use(express.json())

//Defining and using user routes file
const userRouter = require('./routes/users')
app.use('/users', userRouter)

//App listens on port
app.listen(process.env.PORT)