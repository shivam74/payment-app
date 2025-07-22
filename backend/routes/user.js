const express = require('express');
const zod = require('zod')
const router = express.Router();
const {User, Account} = require("../db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const { authMiddleware } = require('../middleware');
const bcrypt = require('bcrypt');

const signupSchema = zod.object({
    userName : zod.string().email(),
    password : zod.string(),
    firstName : zod.string(),
    lastName : zod.string()
})

router.post("/signup", async (req, res) => {
    try {
        const body = req.body;
        const { success } = signupSchema.safeParse(req.body);
        if (!success) {
            return res.status(411).json({
                message: "Incorrect inputs"
            });
        }
        const existingUser = await User.findOne({
            userName: body.userName
        });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already taken"
            });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const dbUser = await User.create({
            ...body,
            password: hashedPassword
        });
        const userId = dbUser._id;
        await Account.create({
            userId,
            balance: 1 + Math.random() * 10000
        });
        // JWT with expiration
        const token = jwt.sign({
            userId: dbUser._id
        }, JWT_SECRET, { expiresIn: '1h' });
        res.json({
            message: "User created successfully",
            token: token
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

const signinSchema = zod.object({
    userName : zod.string(),
    password : zod.string()
})

router.post("/signin", async (req, res) => {
    try {
        const { success } = signinSchema.safeParse(req.body);
        if (!success) {
            return res.status(400).json({
                message: "Invalid input"
            });
        }
        const user = await User.findOne({
            userName: req.body.userName
        });
        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }
        // Compare password hash
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({
            token: token
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

const updateSchema = zod.object({
    password : zod.string().optional(),
    firstName : zod.string().optional(),
    lastName : zod.string().optional()
})

router.put("/", authMiddleware, async (req, res) => {
    try {
        const { success } = updateSchema.safeParse(req.body);
        if (!success) {
            return res.status(411).json({
                message: "Error while updating information"
            });
        }
        let updateData = { ...req.body };
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        await User.updateOne({
            _id: req.userId
        }, updateData);
        res.json({
            message: "Updated successfully"
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

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

// ---
// Backend tests placeholder (use Jest/Mocha for real tests)
// Example: describe('User API', () => { ... })

module.exports = router;