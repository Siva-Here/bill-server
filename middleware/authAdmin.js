const jwt = require('jsonwebtoken');
const User = require('../model/Users');

const authAdminToken = async (req, res, next) => {
    try {
        const jwtToken = req.headers.authorization;
        if (!jwtToken || !jwtToken.startsWith('Bearer ')) {
            return res.status(401).send("Token not found or invalid format...");
        }
        
    

        const token = jwtToken.split(" ")[1];
        let verifyUser;
        try {
            verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        } catch (error) {
            return res.status(401).send("Invalid token...");
        }
        
        const user = await User.findOne({ _id: verifyUser._id });
        if (!user || !(user.isAdmin=="true")){
            return res.status(401).send("You are not allowed to do this. You are not an Admin...");
        }
        
        // If everything is fine, proceed to the next middleware
        next();
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = authAdminToken;
