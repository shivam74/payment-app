const mongoose = require('mongoose')
require("dotenv").config()

const mongo_uri = process.env.MONGO_URI;
mongoose.connect(mongo_uri);

const userSchema = new mongoose.Schema({
    userName: {
        type : String,
        required : true,
        unique : true,
        trim : true,
        lowercase : true,
        minLength : 4,
        maxLength : 30
    },
    firstName : {
        type : String,
        required : true,
        trim : true,
        minLength : 3,
        maxLength : 30
    },
    lastName : {
        type : String,
        required : true,
        trim : true,
        minLength : 3,
        maxLength : 30
    },
    password : {
        type : String,
        required : true,
        minLength : 6
    }   
})

const accountSchema =new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    balance : {
        type : Number,
        required : true
    }
})

const User = mongoose.model ('User',userSchema);
const Account = mongoose.model ('Account',accountSchema);

module.exports= {
    User,
    Account
}