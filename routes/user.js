const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
// model
const { User } = require('../models/User');

router.get('/check', async (req, res) => {
  const token = req.cookies.access_token;

  if (!token) return;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { _id, email, name } = decoded;

    res
      .cookie('access_token', token, {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일, 토큰하고 동일하게 세팅하는 듯
        httpOnly: true,
      })
      .status(200)
      .json({
        success: true,
        user: { _id, email, name },
      });
  } catch (e) {
    res.status(403).json({
      errMsg: e.message,
    });
  }
});

router.post('/join', (req, res) => {
  const user = new User(req.body);
  const { email, name, password } = req.body;

  User.findOne({ email }, (err, data) => {
    if (data) return res.status(403).json({ errMsg: 'already exist' });
    if (err) return res.status(400).json({ errMsg: err });

    user.save((err, result) => {
      if (err) return res.status(400).json({ errMsg: err });
      // delete 로 제거가 되지 않아 아래와 같이 비구조로 풀어서 세팅
      // const { _id, email, name } = result;
      return res.status(200).json({
        joinSuccess: true,
        // user: { _id, email, name },
      });
    });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }, (err, user) => {
    if (!user) {
      return res.status(403).json({
        errMsg: 'Auth failed, email not found',
      });
    }

    user.comparePassword(password, (err, isMatch) => {
      // password is not match
      if (!isMatch) return res.status(403).json({ errMsg: 'Wrong password' });

      // password is match
      user.generateToken((err, token, user) => {
        if (err) return res.status(400).send(err);
        res
          .cookie('access_token', token, {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7일, 토큰하고 동일하게 세팅하는 듯
            httpOnly: true,
          })
          .status(200)
          .json({
            success: true,
            user,
          });
      });
    });
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('access_token').sendStatus(204);
});

module.exports = router;
