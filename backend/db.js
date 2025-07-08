const mongoose = require('mongoose')
require("dotenv").config()

const mongo_uri = process.env.MONGO_URI;
mongoose.connect(mongo_uri);

const userSchema = new mongoose.userSchema({
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

const User = mongoose.model ('User',userSchema);

module.exports= {
    User
}