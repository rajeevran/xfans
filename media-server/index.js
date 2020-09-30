const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer  = require('multer');
const async = require('async');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.' + file.originalname.split('.').pop());
  }
})
const upload = multer({ storage: storage })
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/media-server');
const Video = require('./model');
const Queue = require('./components/Queue');

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

require('./queue');

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/videos', upload.single('file'), (req, res) => {
  let video = new Video({
    file: req.file,
    hash: req.body.hash,
    type: req.body.type
  });

  video.save(function(err, video) {
    if (err) {
      return res.status(400).send(err);
    }

    //do queue for convert file and upload to S3
    Queue.create('CONVERT_VIDEO', video.toObject()).save(function(err){
      res.status(200).send({ok: true});
    });
  });
});

const ES = require('./components/ElasticTranscoder');
ES.convertVideo('video.mp4', 'test1.mp4', function(err, data) {
  console.log(err, data)
});

app.listen(PORT, () => console.log(`Running at port ${PORT}`));
