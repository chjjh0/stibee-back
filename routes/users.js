const express = require('express');
const router = express.Router();
// model
const { User } = require("../models/User");
// middleware
const { auth } = require("../middleware/auth");


//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => {
    // console.log('auth success', req.decode);
    // console.log('auth err', req.err );
    if (req.err) {
        // res.clearCookie('userId');
        // res.clearCookie('w_auth');
        res.status(400).json({ err: req.err })
    } else {
        res.status(200).json({
            token: req.decode,
            success: true
        });
    }
});

// router.post("/register", (req, res) => {

//     const user = new User(req.body);

//     user.save((err, doc) => {
//         if (err) return res.json({ success: false, err });
//         return res.status(200).json({
//             success: true
//         });
//     });
// });

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    // console.log('로그인', req);

    User.findOne({ email }, (err, user) => {
        if (!user)
            return res.json({
                loginSuccess: false,
                message: "Auth failed, email not found"
            });

        // console.log('로그인 성공', user);
        // res.status(200).json({ success: true, userId: user._id })

        user.comparePassword(req.body.password, (err, isMatch) => {
            // console.log('isMatch', isMatch);
            // password is not match
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "Wrong password" });

            // password is match
            user.generateToken((err, token) => {
                if (err) return res.status(400).send(err);
                // console.log('token 발급 전', user);
                res.cookie('userId', user._id)
                res.cookie("w_auth", token, {
                    httpOnly: false
                    })
                    .status(200)
                    .json({
                        success: true
                    });
            });
        });
    });
});

// router.get("/logout", auth, (req, res) => {
//     User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
//         if (err) return res.json({ success: false, err });
//         return res.status(200).send({
//             success: true
//         });
//     });
// });

module.exports = router;
