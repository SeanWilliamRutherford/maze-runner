const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { Global } = require('@emotion/react');
const asyncHandler = require('express-async-handler')

const User = require('../models/userModel')

const registerUser = asyncHandler( async (req,res) => {
    const {name, email, password} = req.body

    if(!name || !email || !password){
        res.status(400)
        throw new Error('Please input all required fields')
    }

    //Check if email in use
    const userExists = await User.findOne({email})
    if(userExists){
        res.status(400)
        throw new Error('This email is already in use')
    }

    //Hashbrowns w/ salt
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //Create new user
    const user = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
        stats: {hiscore: 0},
    })

    if(user){
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            stats: user.stats,
            token: generateToken(user._id)
        })
    }
    else{
        res.status(400)
        throw new Error('User not created, check user input data')
    }
    
    res.json({message: 'Register'})
})

const loginUser = asyncHandler( async (req,res) => {
    const {email, password} = req.body

    const user = await User.findOne({email})

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            stats: user.stats,
            token: generateToken(user._id)
        })
    }
    else{
        res.status(400)
        throw new Error('invalid username or password')
    }


    res.json({message: 'Register'})
})

const getMe = asyncHandler( async (req,res) => {
    const {_id,name,email} = await User.findById(req.user.id)

    res.status(200).json({
        id: _id,
        name,
        email
    })
})

const updateMyStats = asyncHandler( async (req,res) => {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {new: true})
    res.status(200).json(
        user.stats
    )
})

//Generate a JWT
const generateToken = (id) => {
    
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: '30d' ,
    })    
    
}


module.exports ={
    registerUser,
    loginUser,
    getMe,
    updateMyStats
}