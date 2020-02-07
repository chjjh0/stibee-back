const express = require('express');
const fs = require('fs');
const router = express.Router();
const nodemailer = require('nodemailer');
const moment = require('moment');
const path = require('path');
const { Post } = require('../models/Post');


router.post('/sendMail', (req, res) => {

  const { title, emailCont, mailList } = req.body;

  // console.log('sendMail', req.body);


  // nodemailer setting
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'chjjh0@gmail.com',  // gmail 계정 아이디를 입력
      pass: 'godthanks2'          // gmail 계정의 비밀번호를 입력
    }
  });

  let mailOptions = {
    from: 'chjjh0@gmail.com',    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
    to: mailList,          // 수신 메일 주소
    subject: title,   // 제목
    html: emailCont
  };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          // console.log('sendMail error', error);
      }
      else {
          // console.log('sendMail success: ' + info.response);
          res.status(200).json({ success: true })
      }
    });
})

module.exports = router;
