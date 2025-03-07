const jwt = require('jsonwebtoken');
const User = require('../model/Users');

const authenticateToken = async (req, res, next) => {
    try {
        console.log(req)
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
        console.log("user is",user);
        if (!user) {
            return res.status(401).send("No match found in the database...");
        }
        
        // If everything is fine, proceed to the next middleware
        next();
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = authenticateToken;
