const express = require('express');
const fs = require('fs');
const router = express.Router();
const nodemailer = require('nodemailer');
const moment = require('moment');
const path = require('path');
const { Post } = require('../models/Post');




router.get('/list/:currentPage', (req, res) => {
  const { currentPage } = req.params;
  // console.log('post/list', req.params);

  // const currentPage = req.body.
  // const encodeBase64Img = (img) => {
  //   const imgPath = path.join(path.resolve(), `/upload/${img}`)
  //   // console.log('base64 변환 중', path.join(__dirname, `${img}`));
  //   return new Promise((resolve, reject) => {
  //     const data = fs.readFileSync(imgPath, { encoding: 'base64' })

  //     // convert the file to base64 text
  //     resolve(data)
  //   })
  // }

  Post.find()
    .skip((currentPage-1)*4)
    .limit(4)
    .populate('writer')
    .exec(async (err, posts) => {
      if (err) return res.json({ success: false, err })
      if (posts.length === 0) return res.json({ success: false, msg: 'endPage' })

      await Promise.race(
        posts.map((post, idx) => {
          // console.log('post', post.screenshot);
          // upload폴더에 있는 스크린샷 파일을 base64 형태로 변환해서 보내줌
          // encodeBase64Img(post.screenshot)
          //   .then((data) => {
          //     posts[idx].screenshot = `data:image/png;base64,${data}`;
          //   })
          //   .catch(err => {
          //     // 예외처리 필요
          //   })
          post.encodeBase64Img(post.screenshot, (data) => {
            console.log('변환 완료 res');
            posts[idx].screenshot = `data:image/png;base64,${data}`;
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

router.post('/findByTag/:currentPage', (req, res) => {
  // console.log('findByTag', req.body.tag.nameKor);
  const { currentPage } = req.params;


  Post.find({ "tags": req.body.tag.nameKor })
    .skip((currentPage-1)*4)
    .limit(4)
    .populate('writer')
    .exec(async (err, posts) => {
      if (err) return res.status(400).send(err);
      if (posts.length === 0) return res.json({ success: false, msg: 'endPage' })

      await Promise.race(
        posts.map((post, idx) => {
          // console.log('post', post.screenshot);
          // upload폴더에 있는 스크린샷 파일을 base64 형태로 변환해서 보내줌
          // encodeBase64Img(post.screenshot)
          //   .then((data) => {
          //     posts[idx].screenshot = `data:image/png;base64,${data}`;
          //   })
          //   .catch(err => {
          //     // 예외처리 필요
          //   })
          post.encodeBase64Img(post.screenshot, (data) => {
            posts[idx].screenshot = `data:image/png;base64,${data}`;
          })
        })
      )
      // console.log('findByTag 변환 완료 res', posts);
      return res.status(200).json({ success: true, posts });
    })
})

router.put('/update/:postId', (req, res) => {
  // console.log('postUpdate', typeof req.params.postId);
  // console.log('postUpdate', req.body);

  const updateProc = (screenshot) => {

    // const post = new Post({
    //   ...req.body,
    //   screenshot
    // })

    // 위에 new Post로 만든 객체는 delete로 key 삭제가 되지 않아 아래처럼 작성
    const post = {
      ...req.body,
      screenshot
    }
    delete post._id;

    Post.replaceOne(
      { _id: req.params.postId }, 
      post, 
      {new: true}, 
      (err, post) => {
        if (err) return res.status(400).send(err);
        return res.status(200).json({ success: true });
    })
  }

  // 기존 포스터의 스크린샷명을 가져오기 위함
  Post.findOne({ _id: req.params.postId })
    .exec((err, post) => {
      if (err) return res.json({ success: false, err })
      
      const base64Img = req.body.screenshot.split(',')[1]
      const screenshot = post.screenshot;
      const saveImgPath = `${path.resolve()}/upload/${screenshot}`

      try {
        fs.writeFile(
          saveImgPath, 
          base64Img, 
          { encoding: 'base64' }, 
          (res, err) => {
            if (err) throw err;
            // console.log('update 파일 쓰기 끝', res);
            updateProc(screenshot)
          }
        )
      } catch (e) {
        console.log('update 파일 업로드 오류', e);
        res.json({ success: false, e })
      }
    })
})

router.delete('/delete/:postId', (req, res) => {
  console.log('postDelete', req.params.postId);

  Post.findByIdAndRemove(req.params.postId, (err) => {
    if (err) return res.status(400).send(err);
    // console.log('delete res', res);
    return res.status(200).json({ success: true });
  })
})

router.post('/save', (req, res) => {
  // screenshot img 파일명
  const randomStr = Math.random().toString(16).substr(2, 5);
  const date = moment().format('YYYY-MM-DD');
  const ext = '.png';
  const imgName = `${date}_${req.body.title}_${randomStr}${ext}`
  const saveImgPath = `${path.resolve()}/upload/${imgName}`



  const base64Img = req.body.screenshot.split(',')[1]

  const submitProc = (screenshot) => {
    // console.log('screenshot', screenshot);

    const post = new Post({
      writer: req.cookies.userId,
      ...req.body,
      screenshot
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
      (res, err) => {
        if (err) throw err;
        // console.log('파일 쓰기 끝', imgName);
        submitProc(imgName)
      }
    )
  } catch (e) {
    console.log('파일 업로드 오류', e);
    res.json({ success: false, e })
  }
})


module.exports = router;