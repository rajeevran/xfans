import { AWSS3, Queue } from '../components';
import fs from 'fs';

module.exports = function(queue) {
  queue.process('UPLOAD_S3', function(job, done) {
    let data = job.data;
    AWSS3.uploadFile(data, function() {
      //TODO - unlink file
      fs.unlink(data.filePath, function() {
        done();
      });
    });
  });
};
