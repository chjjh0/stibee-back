const express = require('express');
const fs = require('fs');
const router = express.Router();
const nodemailer = require('nodemailer');
const moment = require('moment');
const { Post } = require('../models/Post');





router.post('/save', (req, res) => {
  // screenshot img 파일명
  const randomStr = Math.random().toString(16).substr(2, 5);
  const date = moment().format('YYYY-MM-DD');
  const pngExt = '.png';
  const imgName = `${date}_${req.body.title}_${randomStr}${pngExt}`

  const base64Img = req.body.screenshot.split(',')[1]

  const submitProc = (screenshot) => {
    
    const post = new Post({
      ...req.body,
      screenshot
    });

    post.save((err, post) => {
      if (err) return res.json({ success: false, err })
      return res.status(200).json({ success: true })
    })
  }


  try {
    fs.writeFile(
      imgName, 
      base64Img, 
      { encoding: 'base64' }, 
      (err) => {
        if (err) throw err;
        submitProc(imgName)
      }
    )
  } catch (e) {
    console.log('파일 업로드 오류', e);
    res.json({ success: false, e })
  }
    

    
      

    // const check = emailContent => {
    //     return new Promise((resolve, reject) => {
    //         console.log('함수 테스트', emailContent);
    //         resolve(emailContent)
    //     })
    // }

    // check(emailContent).then(check).then(res => {
    //     console.log('최종', res);
    // })

    // let transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //       user: 'chjjh0@gmail.com',  // gmail 계정 아이디를 입력
    //       pass: 'godthanks2'          // gmail 계정의 비밀번호를 입력
    //     }
    //   });

    // let mailOptions = {
    //     from: 'chjjh0@gmail.com',    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
    //     to: 'chjjh@naver.com' ,          // 수신 메일 주소
    //     subject: 'nodemailer',   // 제목
    //     html: emailContent  
    // };

    // transporter.sendMail(mailOptions, function(error, info){
    // if (error) {
    //     console.log(error);
    // }
    // else {
    //     console.log('Email sent: ' + info.response);
    //     res.status(200).json({ success: true })
    // }
    // });
  })

module.exports = router;
