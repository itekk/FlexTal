const express = require('express')

//Express routing object
const router = express.Router()

//importing user model
const User = require('../models/user')
const {check, validationResult} = require('express-validator')

//Importing hashing package
const bcrypt = require('bcrypt')

//Get all users list
router.get('/', async(req, res) => {
    let filter = {}
    let pageNumber = ''
    let limit = ''

    if(req.query.permission){
        filter.permission = req.query.permission
    }

    if(req.query.name){
        filter.name = {'$regex': req.query.name}
    }

    pageNumber = req.query.page_number ? parseInt(req.query.page_number) : 1
    limit = req.query.limit ? parseInt(req.query.limit) : 10

    try{
        const users = await User.find(filter)
                                .skip(pageNumber > 0 ? ( ( pageNumber - 1 ) * limit ) : 0)
                                .limit(limit)
        res.json(users)
    }catch(err){
        res.status(500).json({error: err})
    }
})

//Get a specific user by id
router.get('/:id', async(req, res) => {
    try{
        const user = await User.findById(req.params.id)
        res.json(user)
    }catch(err){
        res.status(500).json({error: err})
    }
})

//Create a user
router.post('/', [
    check('email')
    .isEmail()
    ],async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(422).json({error : "Email address is not valid."})
    }
    
    checkEmail(req, res)
    let hashedPassword = '';
	
    //Salting and hashing
    if(req.body.password) {
        hashedPassword = await bcrypt.hash(req.body.password, 10)
    }

    checkPermissions(req, res);

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        permission: req.body.permission
    })

    try{
        const newUser = await user.save()
        res.json(newUser)
    }catch(err){
        res.status(500).json({error: err})
    }
})

//Update a user
router.patch('/:id', [
    check('email')
    .isEmail()
    ],async(req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(422).json({error : "Email address is not valid."})
    }

    checkPermissions(req, res);

    try{
        const user = await User.findById(req.params.id)
        if(user) {
            if(user.email != req.body.email) {
                checkEmail(req, res)
            }
            
            let hashedPassword = '';
            if(req.body.password) {
                hashedPassword = await bcrypt.hash(req.body.password, 10)
            }

            user.name = req.body.name
            user.email = req.body.email
            user.password = hashedPassword
            user.permission = req.body.permission
        }
        const updatedUser = await user.save()
        res.json(updatedUser)
    }catch(err){
        res.status(500).json({error: err})
    }
})

//Delete a user
router.delete('/:id', async(req, res) => {
    try{
        const user = await User.deleteOne({_id: req.params.id})
        res.json(user)
    }catch(err){
        res.status(500).json({error: err})
    }
})

//Custom function
async function checkEmail(req, res) {
    count = await User.countDocuments({email: req.body.email})

    if(count > 0){
        res.status(409).json({error: 'E-mail already in use.'})
    }
}

async function checkPermissions(req, res) {
    permissions = process.env.PERMISSIONS.split(' ')
    if(!permissions.includes(req.body.permission)) {
        res.status(422).json({error: 'Invalid permission.'})
    }
}

//Exporting router module
module.exports = router