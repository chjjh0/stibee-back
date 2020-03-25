const express = require('express');
const fs = require('fs');
const router = express.Router();
const nodemailer = require('nodemailer');
const moment = require('moment');
const path = require('path');
const { Post } = require('../models/Post');

router.post('/sendMail', (req, res) => {
  const { title, emailCont, mailList } = req.body;

  let transporter = nodemailer.createTransport({
    service: process.env.MAILSERVICE,
    auth: {
      user: process.env.MAILUSER, // gmail 계정 아이디를 입력
      pass: process.env.MAILPASSWORD, // gmail 계정의 비밀번호를 입력
    },
  });

  let mailOptions = {
    from: process.env.MAILUSER, // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
    to: mailList, // 수신 메일 주소
    subject: title, // 제목
    html: emailCont,
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) res.status(400).json({ err });
    res.status(200).json({ success: true });
  });
});

module.exports = router;
