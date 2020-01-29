const express = require('express');
const fs = require('fs');
const router = express.Router();
const nodemailer = require('nodemailer');
const moment = require('moment');
const path = require('path');
const { Post } = require('../models/Post');




router.get('/list', (req, res) => {
  console.log('post/list');
  // console.log('lists', path.join(path.resolve(), `/upload/${img}`));

  // console.log('lists', path.join(__dirname, '2020-01-20_제목777_025c9.png'));
  // fs.readFile(path.join(__dirname, '2020-01-20_제목777_025c9.png'), { encoding: 'base64' }, (err, data) => {
  //   if (err) console.log('err', err);
  //   console.log('data: ', data);

  // })
  
  const encodeBase64Img = (img) => {
    const imgPath = path.join(path.resolve(), `/upload/${img}`)
    // console.log('base64 변환 중', path.join(__dirname, `${img}`));
    return new Promise((resolve, reject) => {
      const data = fs.readFileSync(imgPath, { encoding: 'base64' })
      // convert the file to base64 text
      resolve(data)
    })
  }

  Post.find().exec(async (err, posts) => {
    if (err) return res.json({ success: false, err })
    // console.log('posts: ', posts);

    await Promise.race(
      posts.map((post, idx) => {
        encodeBase64Img(post.screenshot)
          .then((data) => {
            // console.log('idx ', idx);
            posts[idx].screenshot = data;
            // console.log('적용 후');
          })
          .catch(err => {
            console.log('encodeBase64 err', err);
          })
      })
    )

    // console.log('반환', posts)
    return res.status(200).json({ success: true, posts })
  })
})

router.post('/postOrigin/:postId', (req, res) => {
  console.log('postOrigin', req.params.postId);
  Post.findOne({ "_id": req.params.postId })
      .populate('writer')
      .exec((err, post) => {
          if (err) return res.status(400).send(err);
          return res.status(200).json({ success: true, post });
      })
})

router.put('/update/:postId', (req, res) => {
  // console.log('postUpdate', req.params.postId);
  // console.log('postUpdate', req.body);

  Post.findByIdAndUpdate(
    req.params.postId, 
    req.body, 
    {new: true}, 
    (err, post) => {
      if (err) return res.status(400).send(err);
      return res.status(200).json({ success: true, post });
  })
})

router.delete('/delete/:postId', (req, res) => {
  console.log('postDelete', req.params.postId);

  Post.findByIdAndRemove(req.params.postId, (err, res) => {
    if (err) return res.status(400).send(err);
    console.log('delete res', res);
    return res.status(200).json({ success: true });
  })
  // Post.findByIdAndUpdate(
  //   req.params.postId, 
  //   req.body, 
  //   {new: true}, 
  //   (err, post) => {
  //     if (err) return res.status(400).send(err);
  //     return res.status(200).json({ success: true, post });
  // })
})

router.post('/save', (req, res) => {
  console.log('post save', req.cookies.userId);
  // screenshot img 파일명
  const randomStr = Math.random().toString(16).substr(2, 5);
  const date = moment().format('YYYY-MM-DD');
  const pngExt = '.png';
  const imgName = `${date}_${req.body.title}_${randomStr}${pngExt}`
  const saveImgPath = `${path.resolve()}/upload/${imgName}`



  const base64Img = req.body.screenshot.split(',')[1]

  const submitProc = (screenshot) => {

    const post = new Post({
      writer: req.cookies.userId,
      screenshot,
      ...req.body
    });

    // console.log('submitProc ', req.body);
    post.save((err, post) => {
      if (err) return res.json({ success: false, err })
      return res.status(200).json({ success: true })
    })
  }

  // 스크린샷 저장
  try {
    fs.writeFile(
      saveImgPath, 
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
})


module.exports = router;