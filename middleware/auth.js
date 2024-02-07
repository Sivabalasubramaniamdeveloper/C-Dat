// auth.js

const jwt = require('jsonwebtoken');

function authorization(req, res, next) {
    let auth = req.headers.authorization
    let token = auth.split(' ')

    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    try {
        let verify = jwt.verify(token[1], jwtSecretKey);

        if (verify) {
            req.role = verify.role;
            req.id = verify.uuid;
            next();
        } else {
            return res.status(400).json({ message: "user not found" });
        }

    } catch (error) {
        console.error("Error verifying token:", error.message );
        res.status(400).json({ error: "something went wrong", result : error.message });
    }
}

function authentication(permission, isSuperAdmin) {
    return async function (req, res, next) {
    try {
        let data = req.role; // Assuming req.role is set by the authorization middleware
        // console.log("data : ", data);
        // console.log("permission : ",permission[0]);
        if (data == permission[0]) {
            // console.log('true');
            next();
        } else {
            // console.log('false');
            return res.status(403).json({ error: 'access denied' });
        }
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
}

module.exports = { authorization, authentication };
