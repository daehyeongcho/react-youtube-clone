const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

const { Video } = require("../models/Video");
const { Subscriber } = require("../models/Subscriber");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".mp4" && ext !== ".png") {
      return cb(new Error("only mp4, png is allowed"), false);
    }
    cb(null, true);
  },
}).single("file");

//=============================
//            Video
//=============================

router.post("/uploadfiles", (req, res) => {
  // 비디오를 서버에 저장한다.
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.json({ success: false, err });
    }
    return res.json({
      success: true,
      filePath: res.req.file.path,
      fileName: res.req.file.filename,
    });
  });
});

router.get("/getVideos", (req, res) => {
  // 비디오를 DB에서 가져와서 클라이언트에 보낸다.
  Video.find()
    .populate("writer") // 이걸 해줘야 writer로 연결된 Users에서 정보를 가져옴
    .exec((err, videos) => {
      if (err) return res.status(400).send(err);
      return res.status(200).json({ success: true, videos });
    });
});

router.post("/getVideoDetail", (req, res) => {
  Video.findOne({ _id: req.body.videoId })
    .populate("writer")
    .exec((err, videoDetail) => {
      if (err) return res.status(400).send(err);
      return res.status(200).json({ success: true, videoDetail });
    });
});

router.post("/thumbnail", (req, res) => {
  // 썸네일 생성하고 비디오 러닝타임 가져오기

  let filePath = "";
  let fileDuration = "";

  // 비디오 정보 가져오기
  ffmpeg.ffprobe(req.body.filePath, (err, metadata) => {
    console.dir(metadata); // all metadata
    console.log(metadata.format.duration);
    fileDuration = metadata.format.duration;
  });

  // 썸네일 생성
  ffmpeg(req.body.filePath)
    .on("filenames", (filenames) => {
      console.log(`Will generate ${filenames.join(", ")}`);
      console.log(filenames);

      filePath = `uploads/thumbnails/${filenames[0]}`;
    })
    .on("end", () => {
      console.log("Screenshots taken");
      return res.json({
        success: true,
        fileDuration,
        thumbnailPath: filePath,
      });
    })
    .on("error", (err) => {
      console.error(err);
      return res.json({ success: false, err });
    })
    .screenshots({
      // Will take screenshots at 20%, 40%, 60% and 80% of the video
      count: 3,
      folder: "uploads/thumbnails",
      size: "320x240",
      //'%b': input base name (filename w/o extension)
      filename: "thumbnail-%b.png",
    });
});

router.post("/uploadVideo", (req, res) => {
  // 비디오 정보들을 저장한다.
  const video = new Video(req.body);

  video.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

router.post("/getSubscriptionVideos", (req, res) => {
  // 자신의 아이디를 가지고 구독하는 사람들을 찾는다.
  const { userFrom } = req.body;
  Subscriber.find({ userFrom }).exec((err, subscriberInfo) => {
    if (err) return res.status(400).send(err);

    const subscribedUser = [];
    subscriberInfo.map((subscriber, index) => {
      subscribedUser.push(subscriber.userTo);
    });

    // 찾은 사람들의 비디오를 가지고 온다.
    Video.find({ writer: { $in: subscribedUser } })
      .populate("writer")
      .exec((err, videos) => {
        if (err) return res.status(400).send(err);
        return res.status(200).json({ success: true, videos });
      });
  });
});

module.exports = router;
