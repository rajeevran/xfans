const Queue = require('../components/Queue');
const S3 = require('../components/S3');
const fs = require('fs');

Queue.process('CONVERT_VIDEO', function(job, done) {
  let data = job.data;

  Queue.create('UPLOAD_S3', {
    videoId: data._id,
    filePath: data.file.path,
    fileName: data.file.filename
  })
  .save(done);
});

Queue.process('UPLOAD_S3', function(job, done) {
  S3.uploadFile({
    filePath: job.data.filePath,
    fileName: job.data.fileName
  }, function(err, data) {
    console.log(err, data);
    done();
  });
});
