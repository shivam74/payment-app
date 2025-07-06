const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://learnmangodb:29i0r9S28W4dyscE@cluster0.hqlek1n.mongodb.net/Paytm")

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
        unique : true,
        trim : true,
        lowercase : true,
        minLength : 4,
        maxLength : 30
    },
    lastName : String ,
    password : String
})

const User = mongoose.model ('User',userSchema);

module.exports= {
    User
}