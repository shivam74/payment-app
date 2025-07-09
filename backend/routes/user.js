const express = require('express');
const zod = require('zod')
const router = express.Router();
const {User, Account} = require("../db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const { authMiddleware } = require('../middleware');

const signupSchema = zod.object({
    userName : zod.string().email(),
    password : zod.string(),
    firstName : zod.string(),
    lastName : zod.string()
})

router.post("/signup", async (req,res)=>{
    const body = req.body;
    const {success} = signupSchema.safeParse(req.body);
    if(!success){
        console.log("test");
        return res.status(411).json({
            message : "incorrect inputs"
        })
    }
    const existingUser =await User.findOne({
        userName : body.userName
    })
    if(existingUser){
        return res.json({ 
            message : "Email already taken"
        })
    }
    const dbUser = await User.create(body);

    const userId = dbUser._id;

    await Account.create({
        userId,
        balance : 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId : dbUser._id
    },JWT_SECRET);
    res.json({
        message : "User created successfully",
        token : token
    })
})

const signinSchema = zod.object({
    userName : zod.string(),
    password : zod.string()
})

router.post("/signin",async (req,res)=>{
    const {success} = signinSchema.safeParse(req.body);
    if(!success){
        res.status(411).json({
             message: "Email already taken / Incorrect inputs"
        })
        return;
    }
    const user =await User.findOne({
        userName : req.body.userName,
        password : req.body.password
    });

    if(!user){
        res.status(411).json({
            message: "wrong username/password"
        })
        return;
    }
    const token = jwt.sign({userId : user._id},JWT_SECRET);
    res.json({
        token : token
    });
    
})

const updateSchema = zod.object({
    password : zod.string().optional(),
    firstName : zod.string().optional(),
    lastName : zod.string().optional()
})

router.put("/",authMiddleware,async (req,res)=>{
    const {success} = updateSchema.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message :  "Error while updating information"
        })
    }
    await User.updateOne({
        _id : req.userId
    },req.body);

    res.json({
        message: "Updated successfully"
    })
})

router.get("/bulk",async (req,res)=>{
    const filter = req.query.filter || "";
    const users = await User.find({
        $or : [
            { firstName : { $regex : filter, $options: "i"}},
            { lastName : {$regex : filter,$options: "i"}}
        ]
    })

    res.json({
        user : users.map((user)=>({
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
    
})



module.exports = router;