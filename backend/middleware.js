const JWT_SECRET = require("./config")
const jwt = require("jsonwebtoken")

const authMiddleware = (req,res,next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(403).json({msg : "incorrect token"});
    }
    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token,JWT_SECRET);
        if(!decoded.userId){
           return res.status(403).json({msg : "Token can't verified"});
        }
        else{
            req.userId = decoded.userId;
            next();
        }
    }
    catch(err){
        res.status(403).json({
            error : err.message
        })
    }
}

module.exports = {
    authMiddleware
}