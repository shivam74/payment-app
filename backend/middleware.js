const JWT_SECRET = require("./config")
const jwt = require("jsonwebtoken")

const authMiddleware = (req,res,next)=>{
    const authHeader = req.headers.authorisation;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(403).json({});
    }
    const token = authHeader.split(" ")[1];

    try{
        const decoded = json.verify(token,JWT_SECRET);
        if(!decoded.userId){
            res.status(403).json({});
        }
        else{
            req.userId = decoded.userId;
            next();
        }
    }
    catch(err){
        res.status(403).json({
            error : err
        })
    }
}

module.exports = {
    authMiddleware
}