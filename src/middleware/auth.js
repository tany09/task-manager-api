const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const verify = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findOne({_id: verify.id, 'tokens.token': token});

        if(!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();
    } catch (e) {
        res.status(401).send('Plaese Authenticate');
    }
}

module.exports = auth;
