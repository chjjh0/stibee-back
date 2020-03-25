const express = require('express');
const fs = require('fs');
const router = express.Router();
const moment = require('moment');
const path = require('path');
const { Post } = require('../models/Post');

router.get('/list/:currentPage', (req, res) => {
  const { currentPage } = req.params;

  Post.find()
    .skip((currentPage - 1) * 4)
    .limit(4)
    .populate('writer')
    .exec(async (err, posts) => {
      if (err) return res.json({ err });
      if (posts.length === 0) {
        return res.status(400).json({ errMsg: 'endPage' });
      }

      await Promise.race(
        posts.map((post, idx) => {
          post.encodeBase64Img(post.screenshot, data => {
            posts[idx].screenshot = `data:image/png;base64,${data}`;
          });
        }),
      );

      return res.status(200).json({ posts });
    });
});

router.get('/postOrigin/:postId', (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate('writer')
    .exec((err, post) => {
      if (err) return res.status(400).send(err);
      return res.status(200).json({ post });
    });
});

router.post('/findByTag/:currentPage', (req, res) => {
  const { currentPage } = req.params;

  Post.find({ tags: req.body.tag.nameKor })
    .skip((currentPage - 1) * 4)
    .limit(4)
    .populate('writer')
    .exec(async (err, posts) => {
      if (err) return res.status(400).send(err);
      if (posts.length === 0) {
        return res.status(400).json({ errMsg: 'endPage' });
      }

      await Promise.race(
        posts.map((post, idx) => {
          post.encodeBase64Img(post.screenshot, data => {
            posts[idx].screenshot = `data:image/png;base64,${data}`;
          });
        }),
      );
      return res.status(200).json({ posts });
    });
});

router.put('/update/:postId', (req, res) => {
  const updateProc = screenshot => {
    const post = {
      ...req.body,
      screenshot,
    };
    delete post._id;

    Post.replaceOne(
      { _id: req.params.postId },
      post,
      { new: true },
      (err, post) => {
        if (err) return res.status(400).send(err);
        return res.status(200).json({ success: true });
      },
    );
  };

  // 기존 포스터의 스크린샷명을 가져오기 위함
  Post.findOne({ _id: req.params.postId }).exec((err, post) => {
    if (err) return res.json({ success: false, err });

    const base64Img = req.body.screenshot.split(',')[1];
    const screenshot = post.screenshot;
    const saveImgPath = `${path.resolve()}/upload/${screenshot}`;

    try {
      fs.writeFile(
        saveImgPath,
        base64Img,
        { encoding: 'base64' },
        (res, err) => {
          if (err) throw err;
          updateProc(screenshot);
        },
      );
    } catch (e) {
      res.json({ success: false, e });
    }
  });
});

router.delete('/delete/:postId', (req, res) => {
  Post.findByIdAndRemove(req.params.postId, (err, post) => {
    if (err) return res.status(400).send(err);
    try {
      fs.unlink(`${path.resolve()}/upload/${post.screenshot}`, err => {
        if (err) return res.status(400).send(err);
        return res.status(200).json({ success: true });
      });
    } catch (e) {
      res.status(400).json({ e });
    }
  });
});

router.post('/save', (req, res) => {
  // screenshot 파일명 세팅
  const randomStr = Math.random()
    .toString(16)
    .substr(2, 5);
  const date = moment().format('YYYY-MM-DD');
  const ext = '.png';
  const imgName = `${date}_${req.body.title}_${randomStr}${ext}`;
  const saveImgPath = `${path.resolve()}/upload/${imgName}`;

  const base64Img = req.body.screenshot.split(',')[1];

  const submitProc = screenshot => {
    const post = new Post({
      writer: req.cookies.userId,
      ...req.body,
      screenshot,
    });

    post.save((err, post) => {
      if (err) return res.json({ err });
      return res.status(200).json({ success: true });
    });
  };

  // 스크린샷 저장
  try {
    fs.writeFile(saveImgPath, base64Img, { encoding: 'base64' }, (res, err) => {
      if (err) throw err;
      // console.log('파일 쓰기 끝', imgName);
      submitProc(imgName);
    });
  } catch (err) {
    res.status(400).json({ err });
  }
});

module.exports = router;
