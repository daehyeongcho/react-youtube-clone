const express = require("express");
const router = express.Router();

const { Subscriber } = require("../models/Subscriber");

//=============================
//            Subscribe
//=============================

router.post("/subscribeNumber", (req, res) => {
  const { userTo } = req.body;
  Subscriber.find({ userTo }).exec((err, subscribe) => {
    if (err) return res.status(400).send(err);
    return res
      .status(200)
      .json({ success: true, subscribeNumber: subscribe.length });
  });
});

router.post("/subscribed", (req, res) => {
  const { userTo, userFrom } = req.body;
  Subscriber.find({ userTo, userFrom }).exec((err, subscribe) => {
    if (err) return res.status(400).send(err);

    const result = !!subscribe.length;
    return res.status(200).json({ success: true, subscribed: result });
  });
});

router.post("/unSubscribe", (req, res) => {
  const { userTo, userFrom } = req.body;
  Subscriber.findOneAndDelete({ userTo, userFrom }).exec((err, doc) => {
    if (err) return res.status(400).send({ success: false, err });
    return res.status(200).json({ success: true, doc });
  });
});

router.post("/subscribe", (req, res) => {
  const subscribe = new Subscriber(req.body);

  subscribe.save((err, doc) => {
    if (err) return res.status(400).send({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

module.exports = router;
