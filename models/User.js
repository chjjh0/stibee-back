const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const moment = require("moment");

const userSchema = mongoose.Schema({
    name: {
        type:String,
        maxlength:50
    },
    email: {
        type:String,
        trim:true,
        unique: 1 
    },
    password: {
        type: String,
        minlength: 5
    },
    // token : {
    //     type: String,
    // },
    // tokenExp :{
    //     type: Number
    // }
})


// userSchema.pre('save', function( next ) {
//     var user = this;
    
//     if(user.isModified('password')){    
//         console.log('password changed')
//         bcrypt.genSalt(saltRounds, function(err, salt){
//             if(err) return next(err);
    
//             bcrypt.hash(user.password, salt, function(err, hash){
//                 if(err) return next(err);
//                 user.password = hash 
//                 next()
//             })
//         })
//     } else {
//         next()
//     }
// });

// 비밀번호 체크
userSchema.methods.comparePassword = function(plainPassword,cb){
    const user = this;
    // this 는 user 객체, user 객체에서 comparePassword 매소드를 호출했기 때문
    // user 객체는 User.findOne을 통해 받은 결과물
    // bcrypt가 암호화 되지 않은 비번과 암호화된 비번 비교를 해줌
    bcrypt.compare(plainPassword, user.password, function(err, isMatch){
        if (err) return cb(err);
        cb(null, isMatch)
    })
}

// token 발급
userSchema.methods.generateToken = function(cb) {
    const user = this;

    jwt.sign(
        { _id: user._id },
        'secret',
        {
            expiresIn: '1h'
        },
        (err, token) => {
            if (err) return cb(err);
            cb(null, token);
        })
}

userSchema.statics.findByToken = function (token, cb) {
    var user = this;

    jwt.verify(token,'secret',function(err, decode){
        user.findOne({"_id":decode, "token":token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mongoose.model('User', userSchema);

module.exports = { User }