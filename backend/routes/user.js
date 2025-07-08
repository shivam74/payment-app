const express = require('express');
const zod = require('zod')
const router = express.Router();
const {User} = require("../db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config")

const signupSchema = zod.object({
    userName : zod.string.email(),
    password : zod.string,
    firstName : zod.string,
    lastName : zod.string
})



router.post("/signup", async (req,res)=>{
    const body = req.body;
    const success = signupSchema.safeParse(req.body);
    if(!success){
        return res.json({
            message : "Email already taken/incorrect inputs"
        })
    }
    const user = User.findOne({
        userName : body.userName
    })
    if(user._id){
        return res.json({
            message : "Email already taken/incorrect inputs"
        })
    }
    const dbUser = await User.create(body);
    const token = jwt.sign({
        userId : dbUser._id
    },JWT_SECRET);
    res.json({
        message : "User created successfully",
        token : token
    })
})



module.exports = router;