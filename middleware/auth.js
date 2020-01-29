const jwt = require('jsonwebtoken');

let auth = (req, res, next) => {
    // check token from client
    let token = req.cookies.w_auth;

    // console.log('auth inside', token);

    jwt.verify(token, 'secret', function(err, decode) {
        if(err) req.err = err;
        // console.log('veritify inside', decode);
        req.decode = decode;
    })
    next();
};

module.exports = { auth };