import { VideoConverter, Queue, AWSS3, ElasticTranscoder } from '../components';
import { VideoModel, TmpFile } from '../models';
import { StringHelper } from '../helpers';
import config from '../config/environment';
import path from 'path';
import fs from 'fs';
import async from 'async';

function convertTime(second) {
  var hours = Math.floor(second / 3600) < 10 ? ("00" + Math.floor(second / 3600)).slice(-2) : Math.floor(second / 3600);
  var minutes = ("00" + Math.floor((second % 3600) / 60)).slice(-2);
  var seconds = ("00" + Math.floor((second % 3600) % 60)).slice(-2);
  return hours + ":" + minutes + ":" + seconds;
}

module.exports = function (queue) {
  queue.process('CONVERT_TRAILER_VIDEO', function (job, done) {
    let orgPath = job.data.filePath;
    let filePath = path.join(config.clientFolder, orgPath);
    let videoId = job.data.videoId;
    let key = job.data.key;
    let createVideoThumb = job.data.createVideoThumb || false;
    let deleteOldFile = job.data.deleteOldFile || false;

    let convertStatus = {
      $set: {}
    };
    convertStatus.$set['convertStatus.' + key] = 'processing';
    VideoModel.update({
      _id: videoId
    }, convertStatus, function () {
      VideoConverter.videoToMp4({
        filePath
      }, function (err, newPath) {
        if (err) {
          console.log('Convert video failed', err);
          return done();
        }
        newPath = (orgPath.charAt(0) === '/' ? '' : '/') + StringHelper.getFilePath(orgPath) + '/' + newPath;

        let newUpdate = {
          $set: {}
        };
        newUpdate.$set.fileTrailerPath = newPath;
        newUpdate.$set['convertStatus.trailer'] = 'done';

        VideoModel.update({
          _id: videoId
        }, newUpdate, {
            upsert: true
          }, function () {
            if (deleteOldFile) {
              fs.unlinkSync(filePath);
            }

            done();
          });
      });
    });
  });

  queue.process('CONVERT_MAIN_VIDEO', function (job, done) {
    let orgPath = job.data.filePath;
    let filePath = path.join(config.clientFolder, orgPath);
    let videoId = job.data.videoId;
    let key = job.data.key;
    let createVideoThumb = job.data.createVideoThumb || false;
    let deleteOldFile = job.data.deleteOldFile || false;
    let videoToGetThumbPath;

    let convertStatus = {
      $set: {}
    };

    convertStatus.$set['convertStatus.mainVideo'] = 'processing';
    VideoModel.update({
      _id: videoId
    }, convertStatus, function () {
      VideoConverter.getSizes(filePath, function (err, sizes) {
        if (err) {
          return done();
        }

        let convertedVideos = [];
        async.eachSeries(sizes, function (size, cb) {
          let sizeText = `${size.width}x?`;
          VideoConverter.videoToMp4({
            filePath,
            size: sizeText
          }, function (err, newPath) {
            if (err) {
              console.log('Convert video failed', err);
              return cb();
            }
            newPath = (orgPath.charAt(0) === '/' ? '' : '/') + StringHelper.getFilePath(orgPath) + '/' + newPath;
            videoToGetThumbPath = newPath;
            let newVideo = {
              name: sizeText,
              width: size.width,
              height: size.height,
              path: newPath
            };
            convertedVideos.push(newVideo);
            cb();
          });
        }, function () {
          let newUpdate = {
            $set: {
              convertedFiles: convertedVideos
            }
          };
          newUpdate.$set['convertStatus.mainVideo'] = 'done';

          VideoModel.update({
            _id: videoId
          }, newUpdate, {
              upsert: true
            }, function () {

              if (deleteOldFile) {
                //fs.unlinkSync(filePath);
              }

              // if (createVideoThumb) {
              //   Queue.create('CREATE_THUMB', {
              //     videoId,
              //     filePath: videoToGetThumbPath
              //   }).save();
              // }

              done();
            });
        });
      });
    });
  });

  queue.process('CREATE_THUMB', function (job, done) {
    let filePath = path.join(config.clientFolder, job.data.filePath);
    let videoId = job.data.videoId;

    VideoConverter.getThumb({
      filePath
    }, function (err, thumbPath) {
      if (err) {
        console.log('Create thumb video failed', err);
        return done();
      }

      VideoModel.update({
        _id: videoId
      }, {
          imageFullPath: thumbPath,
          imageMediumPath: thumbPath,
          imageThumbPath: thumbPath
        }, {
          upsert: true
        }, () => done());
    });
  });

  queue.process('CREATE_THUMBS', function (job, done) {
    let orgPath = job.data.filePath;
    let filePath = path.join(config.clientFolder, orgPath);
    let videoId = job.data.videoId;

    VideoConverter.getMultipleScreenshots({
      filePath,
      count: 10
    }, function (err, thumbs) {
      if (err) {
        console.log('Create thumbs video failed', err);
        return done();
      }
      //TODO - upload to s3 for thumbs
      VideoModel.update({
        _id: videoId
      }, {
          $set: {
            thumbs
          }
        }, function () {
          if (config.fileType === 's3') {
            Queue.create('UPLOAD_THUMBS_S3', {
              videoId,
              thumbs
            })
              .save(() => { return done(); });
          }
          done();
        });
    });
  });

  queue.process('UPLOAD_THUMBS_S3', function (job, done) {
    let data = job.data;
    let newThumbs = [];
    async.eachSeries(data.thumbs, function (thumb, cb) {
      let filePath = path.join(config.clientFolder, thumb);
      let fileName = 'thumb_' + StringHelper.getFileName(thumb);
      AWSS3.uploadFile({
        filePath,
        fileName,
        ACL: 'public-read',
        contentType: 'image/png'
      }, function (err, data) {
        newThumbs.push(AWSS3.getPublicUrl(fileName));
        cb();
      });
    }, function () {
      VideoModel.update({
        _id: data.videoId
      }, {
          $set: {
            thumbs: newThumbs
          }
        }, {
          upsert: true
        }, function () {
          data.thumbs.forEach(t => fs.unlinkSync(path.join(config.clientFolder, t)));

          done();
        });
    });
  });

  queue.process('GET_SIZE_AND_UPLOAD_S3', function (job, done) {
    let video = job.data;
    let filePath = path.join(config.clientFolder, video.filePath);
    let fileName = StringHelper.getFileName(video.filePath);
    let duration = 0;

    var stats = fs.statSync(filePath);
    if (stats.size < 1000) {
      return VideoModel.update({
        _id: video._id
      }, {
          $set: {
            brokenFile: true,
            status: 'inactive'
          }
        }, function () {
          fs.unlink(filePath, function () {
            done();
          });
        });
    }

    VideoConverter.getDuration(filePath, function (err, d) {
      if (err) {
        return VideoModel.update({
          _id: video._id
        }, {
            $set: {
              brokenFile: true,
              status: 'inactive'
            }
          }, function () {
            fs.unlink(filePath, function () {
              done();
            });
          });
      }

      duration = d;
      let clipUrl;
      async.auto({
        sizes(cb) {
          VideoConverter.getSizes(filePath, cb);
        },
        clip: ['sizes', function (result, cb) {
          //create clip manually
          VideoConverter.createClip({
            filePath,
            fromTime: !duration ? '0' : convertTime(duration / 2)
          }, function (err, clipFile) {
            if (err) {
              return cb();
            }
            let clipName = 'clip_' + StringHelper.getFileName(fileName, true) + '.mp4';
            AWSS3.uploadFile({
              filePath: clipFile,
              fileName: clipName,
              ACL: 'public-read'
            }, function (err) {
              if (!err) {
                clipUrl = AWSS3.getPublicUrl(clipName);
              }
              TmpFile.create({
                filePath: path.join(config.fileTempFolder, clipName)
              }, {
                  filePath: path.join(config.clientFolder, clipName)
                });
              cb();
            });
          });
        }]
      }, function (err, result) {
        if (err) {
          return done();
        }

        let sizes = result.sizes;
        AWSS3.uploadFile({
          filePath: filePath,
          fileName: fileName
        }, function (err, data) {
          if (err) {
            return done();
          }

          //try to convert and save to db
          //TODO - remove file
          let convertedFiles = [];
          async.eachSeries(sizes, function (size, cb) {
            ElasticTranscoder.convertVideo({
              inputFile: fileName,
              outputFile: size.width + '_' + size.height + '_' + fileName,
              width: size.width
            }, function (err, etData) {
              if (err) {
                return cb();
              }

              convertedFiles.push({
                name: size.width + 'x' + size.height,
                width: size.width,
                height: size.height,
                path: etData.url
              });

              cb();
            });
          }, function () {
            let update = {
              convertedFiles: convertedFiles,
              'convertStatus.mainVideo': 'done',
              filePath: AWSS3.getPublicUrl(fileName),
              clipUrl
            };
            if (duration) {
              update.duration = duration;
            }

            VideoModel.update({
              _id: video._id
            }, {
                $set: update
              }, {
                upsert: true
              }, function () {

                if (video.status === 'active' && clipUrl) {
                  Queue.create('AUTO_POST_TWITTER', {
                    videoId: video._id,
                    performerId: video.user
                  }).save();
                }

                TmpFile.create({
                  filePath: path.join(config.clientFolder, video.filePath)
                }, {
                    filePath: path.join(config.fileTempFolder, video.filePath)
                  });
                done();
              });
          });
        });
      });
    });
  });

  queue.process('GET_SIZE_AND_STORE', function (job, done) {
    let orgPath = job.data.filePath;
    let video = job.data;
    let filePath = path.join(config.clientFolder, video.filePath);
    let fileName = StringHelper.getFileName(video.filePath);
    let duration = 0;

    var stats = fs.statSync(filePath);
    if (stats.size < 1000) {
      return VideoModel.update({
        _id: video._id
      }, {
          $set: {
            brokenFile: true,
            status: 'inactive'
          }
        }, function () {
          fs.unlink(filePath, function () {
            done();
          });
        });
    }

    VideoConverter.getDuration(filePath, function (err, d) {
      if (err) {
        return VideoModel.update({
          _id: video._id
        }, {
            $set: {
              brokenFile: true,
              status: 'inactive'
            }
          }, function () {
            fs.unlink(filePath, function () {
              done();
            });
          });
      }
      duration = d;
      // let clipUrl;
      async.auto({
        sizes(cb) {
          VideoConverter.getSizes(filePath, cb);
        },
        // clip: ['sizes', function (result, cb) {
        //   //create clip manually
        //   VideoConverter.createClip({
        //     filePath,
        //     fromTime: !duration ? '0' : convertTime(duration / 2)
        //   }, function (err, clipFile) {
        //     if (err) {
        //       return cb();
        //     }
        //     clipUrl = (orgPath.charAt(0) === '/' ? '' : '/') + StringHelper.getFilePath(orgPath) + '/' + clipFile;
        //     cb();
        //   });
        // }]
      }, function (err, result) {
        if (err) {
          return done();
        }

        let sizes = result.sizes;

        //try to convert and save to db
        //TODO - remove file
        let convertedFiles = [];
        async.eachSeries(sizes, function (size, cb) {
          let sizeText = `${size.width}x?`;
          VideoConverter.videoToMp4({
            filePath,
            outputFile: size.width + '_' + size.height + '_' + fileName,
            size: sizeText
          }, function (err, newPath) {
            if (err) {
              return cb();
            }
            newPath = (orgPath.charAt(0) === '/' ? '' : '/') + StringHelper.getFilePath(orgPath) + '/' + newPath;
            convertedFiles.push({
              name: size.width + 'x' + size.height,
              width: size.width,
              height: size.height,
              path: newPath
            });

            cb();
          });
        }, function () {
          let update = {
            convertedFiles: convertedFiles,
            'convertStatus.mainVideo': 'done',
            // filePath: AWSS3.getPublicUrl(fileName),
            // clipUrl
          };
          if (duration) {
            update.duration = duration;
          }

          VideoModel.update({
            _id: video._id
          }, {
              $set: update
            }, {
              upsert: true
            }, function () {

              // if (video.status === 'active' && clipUrl) {
              //   Queue.create('AUTO_POST_TWITTER', {
              //     videoId: video._id,
              //     performerId: video.user
              //   }).save();
              // }

              // TmpFile.create({
              //   filePath: path.join(config.clientFolder, video.filePath)
              // }, {
              //     filePath: path.join(config.fileTempFolder, video.filePath)
              //   });
              done();
            });
        });
      });
    });
  });

  queue.process('UPLOAD_TRAILER_TO_S3', function (job, done) {
    let orgPath = job.data.filePath;
    let video = job.data;
    let filePath = path.join(config.clientFolder, video.fileTrailerPath);
    let fileName = StringHelper.getFileName(video.fileTrailerPath);
    AWSS3.uploadFile({
      filePath: filePath,
      fileName: fileName,
      ACL: 'public-read'
    }, function (err, data) {
      if (err) {
        return done();
      }

      ElasticTranscoder.convertVideo({
        inputFile: fileName,
        outputFile: fileName,
        width: 720
      }, function (err, etData) {
        if (err) {
          return done();
        }

        VideoModel.update({
          _id: video._id
        }, {
            $set: {
              'convertStatus.trailer': 'done',
              fileTrailerPath: etData.url
            }
          }, {
            upsert: true
          }, function () {
            TmpFile.create({
              filePath: path.join(config.clientFolder, video.fileTrailerPath)
            });
            done();
          });
      });
    });
  });

  queue.process('UPLOAD_TRAILER_TO_STORE', function (job, done) {
    let video = job.data;
    let filePath = path.join(config.clientFolder, video.fileTrailerPath);
    let fileName = StringHelper.getFileName(video.fileTrailerPath);
    VideoConverter.videoToMp4({
      filePath,
      width: `720x?`
    }, function (err, newPath) {
      if (err) {
        return done();
      }
      newPath = (orgPath.charAt(0) === '/' ? '' : '/') + StringHelper.getFilePath(orgPath) + '/' + newPath;
      VideoModel.update({
        _id: video._id
      }, {
          $set: {
            'convertStatus.trailer': 'done',
            fileTrailerPath: newPath
          }
        }, {
          upsert: true
        }, function () {
          TmpFile.create({
            filePath: path.join(config.clientFolder, video.fileTrailerPath)
          });
          done();
        });
    });
  });
};
