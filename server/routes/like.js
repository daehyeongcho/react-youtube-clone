const express = require("express");
const router = express.Router();

const { Like } = require("../models/Like");
const { Dislike } = require("../models/Dislike");

//=============================
//            Like
//=============================

router.post("/getLikes", (req, res) => {
  const variable = {};

  if (req.body.videoId) {
    variable.videoId = req.body.videoId;
  } else {
    variable.commentId = req.body.commentId;
  }

  Like.find(variable).exec((err, likes) => {
    if (err) return res.status(400).send(err);
    return res.status(200).json({ success: true, likes });
  });
});

router.post("/getDislikes", (req, res) => {
  const variable = {};

  if (req.body.videoId) {
    variable.videoId = req.body.videoId;
  } else {
    variable.commentId = req.body.commentId;
  }

  Dislike.find(variable).exec((err, dislikes) => {
    if (err) return res.status(400).send(err);
    return res.status(200).json({ success: true, dislikes });
  });
});

router.post("/upLike", (req, res) => {
  // Like collection에 클릭 정보를 넣음.
  const like = new Like(req.body);

  like.save((err, likeResult) => {
    if (err) return res.json({ success: false, err });

    // 만약에 dislike이 이미 클릭이 되어있다면, dislike을 1 줄여준다.
    Dislike.findOneAndDelete(req.body).exec((err, dislikeResult) => {
      if (err) return res.status(400).json({ success: false, err });
      res.status(200).json({ success: true });
    });
  });
});

router.post("/unLike", (req, res) => {
  Like.findOneAndDelete(req.body).exec((err, result) => {
    if (err) return res.status(400).json({ success: false, err });
    res.status(200).json({ success: true, result });
  });
});

router.post("/upDislike", (req, res) => {
  // Dislike collection에 클릭 정보를 넣음.
  const dislike = new Dislike(req.body);

  dislike.save((err, dislikeResult) => {
    if (err) return res.json({ success: false, err });

    // 만약에 Like이 이미 클릭이 되어있다면, Like을 1 줄여준다.
    Like.findOneAndDelete(req.body).exec((err, likeResult) => {
      if (err) return res.status(400).json({ success: false, err });
      res.status(200).json({ success: true });
    });
  });
});

router.post("/unDislike", (req, res) => {
  Dislike.findOneAndDelete(req.body).exec((err, result) => {
    if (err) return res.status(400).json({ success: false, err });
    res.status(200).json({ success: true, result });
  });
});

module.exports = router;
