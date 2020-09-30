const mongoose = require('mongoose');

module.exports = mongoose.model('Video', {
  hash: {
    type: String,
    index: true
  },
  type: {
    type: String,
    //trailer or mainVideo
  },
  file: {
    type: mongoose.Schema.Types.Mixed
  },
  convertStatus: {
    //'pending', 'processing', 'done'
    type: String
  },
  convertedFiles: [{
    name: String,
    width: Number,
    height: Number,
    path: String
  }],
  data: {
    type: mongoose.Schema.Types.Mixed
  }
});
