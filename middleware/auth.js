// auth.js

const jwt = require('jsonwebtoken');

function authorization(req, res, next) {
    let token = jwt.sign({
        data: '1',
        role: 'admin'
    }, 'secrets_value', { expiresIn: 60 * 60 });

    try {
        let verify = jwt.verify(token, 'secrets_value');
        if (verify) {
            req.role = verify.role;
            next();
        } else {
            return res.status(400).json({ message: "user not found" });
        }

    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(500).json({ error: "Internal Server Error" });
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
