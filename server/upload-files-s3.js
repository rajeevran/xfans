'use strict';

// Set default node environment to development
var env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  // Register the Babel require hook
  require('babel-register');
}

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var config = require('./config/environment');

import { VideoModel, PhotoModel, SettingModel, BannerModel, UserModel, PerformerModel, ProductModel } from './models';
import { AWSS3 } from './components';
import { StringHelper } from './helpers';
import async from 'async';
import path from 'path';

// Connect to MongoDB
mongoose.connect('mongodb://localhost/xfans-prod', config.mongo.options);
mongoose.connection.on('error', function (err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});
console.log('config.clientFolder', config.clientFolder);
async.waterfall([
  function (cb) {
    VideoModel.find({}).limit(1500).exec(function (err, videos) {
      if (err) {
        return cb(err);
      }

      async.eachSeries(videos, function (video, cb) {
        console.log('Start upload ' + video._id);
        async.auto({
          filePath(cb) {
            console.log('Upload filePath ' + video.filePath);
            if (video.filePath && !StringHelper.isUrl(video.filePath)) {
              var filePath = path.join(config.clientFolder, video.filePath);
              AWSS3.uploadFile({
                filePath,
                fileName: StringHelper.getFileName(video.filePath)
              }, function (err, data) {
                if (err || !data) {
                  console.log('upload filePath error', err);
                  return cb(null, 'error');
                }

                cb(null, data.url);
              });
            } else {
              video.filePath = video.filePath ? video.filePath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : video.filePath;
              cb(null, video.filePath);
            }
          },
          fileTrailerPath(cb) {
            console.log('Upload fileTrailerPath ' + video.fileTrailerPath);
            if (video.fileTrailerPath && !StringHelper.isUrl(video.fileTrailerPath)) {
              var filePath = path.join(config.clientFolder, video.fileTrailerPath);

              AWSS3.uploadFile({
                filePath,
                fileName: StringHelper.getFileName(video.fileTrailerPath)
              }, function (err, data) {
                console.log('upload fileTrailerPath error', err);
                if (err || !data) {
                  return cb(null, '');
                }

                cb(null, data.url);
              });
            } else {
              video.fileTrailerPath = video.fileTrailerPath ? video.fileTrailerPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : video.fileTrailerPath;
              cb(null, video.fileTrailerPath);
            }
          },
          clipUrl(cb) {
            console.log('Upload clipUrl ' + video.clipUrl);
            if (video.clipUrl && !StringHelper.isUrl(video.clipUrl)) {
              var filePath = path.join(config.clientFolder, video.clipUrl);

              AWSS3.uploadFile({
                filePath,
                fileName: StringHelper.getFileName(video.clipUrl)
              }, function (err, data) {
                console.log('upload clipUrl error', err);
                if (err || !data) {
                  return cb(null, '');
                }

                cb(null, data.url);
              });
            } else {
              video.clipUrl = video.clipUrl ? video.clipUrl.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : video.clipUrl;
              cb(null, video.clipUrl);
            }
          },
          convertedFiles(cb) {
            console.log('Upload convertedFiles ' + video.convertedFiles);
            var files = [];
            async.eachSeries(video.convertedFiles, function (convertedFile, cb) {
              if (convertedFile.path && !StringHelper.isUrl(convertedFile.path)) {
                var filePath = path.join(config.clientFolder, convertedFile.path);

                AWSS3.uploadFile({
                  filePath,
                  fileName: StringHelper.getFileName(convertedFile.path)
                }, function (err, data) {
                  console.log('upload convertedFile error', err);
                  if (err || !data) {
                    return cb(null, '');
                  }

                  convertedFile.path = data.url;
                  files.push(convertedFile);
                  cb();
                });
              } else {
                convertedFile.path = convertedFile.path ? convertedFile.path.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : convertedFile.path;
                files.push(convertedFile);
                cb();
              }
            }, function () {
              cb(null, files);
            });
          },
          imageFullPath(cb) {
            console.log('Upload imageFullPath ' + video.imageFullPath);
            if (video.imageFullPath && !StringHelper.isUrl(video.imageFullPath)) {
              var filePath = path.join(config.clientFolder, video.imageFullPath);

              AWSS3.uploadFile({
                ACL: 'public-read',
                contentType: 'image/png',
                filePath,
                fileName: StringHelper.getFileName(video.imageFullPath)
              }, function (err, data) {
                console.log('upload imageFullPath error', err);
                if (err || !data) {
                  return cb(null, '');
                }

                cb(null, data.url);
              });
            } else {
              video.imageFullPath = video.imageFullPath ? video.imageFullPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : video.imageFullPath;
              cb(null, video.imageFullPath);
            }
          },
          imageThumbPath(cb) {
            console.log('Upload imageThumPath ' + video.imageThumbPath);
            if (video.imageThumbPath && !StringHelper.isUrl(video.imageThumbPath)) {
              var filePath = path.join(config.clientFolder, video.imageThumbPath);

              AWSS3.uploadFile({
                ACL: 'public-read',
                contentType: 'image/png',
                filePath,
                fileName: StringHelper.getFileName(video.imageThumbPath)
              }, function (err, data) {
                console.log('upload imageThumbPath error', err);
                if (err || !data) {
                  return cb(null, '');
                }

                cb(null, data.url);
              });
            } else {
              video.imageThumbPath = video.imageThumbPath ? video.imageThumbPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : video.imageThumbPath;
              cb(null, video.imageThumbPath);
            }
          },
          imageMediumPath(cb) {
            console.log('Upload imageMediumPath ' + video.imageMediumPath);
            if (video.imageMediumPath && !StringHelper.isUrl(video.imageMediumPath)) {
              var filePath = path.join(config.clientFolder, video.imageMediumPath);

              AWSS3.uploadFile({
                ACL: 'public-read',
                contentType: 'image/png',
                filePath,
                fileName: StringHelper.getFileName(video.imageMediumPath)
              }, function (err, data) {
                console.log('upload imageMediumPath error', err);
                if (err || !data) {
                  return cb(null, '');
                }

                cb(null, data.url);
              });
            } else {
              video.imageMediumPath = video.imageMediumPath ? video.imageMediumPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : video.imageMediumPath;
              cb(null, video.imageMediumPath);
            }
          },
          chanelsInfo(cb) {
            console.log('Chanel info ' + video.chanelsInfo);
            var chanels = []
            async.eachSeries(video.chanelsInfo, (chanel, cb) => {
              async.auto({
                imageFullPath(cb) {
                  if (chanel.imageFullPath && !StringHelper.isUrl(chanel.imageFullPath)) {
                    var filePath = path.join(config.clientFolder, chanel.imageFullPath);

                    AWSS3.uploadFile({
                      ACL: 'public-read',
                      contentType: 'image/png',
                      filePath,
                      fileName: StringHelper.getFileName(chanel.imageFullPath)
                    }, function (err, data) {
                      console.log('upload imageFullPath error', err);
                      if (err || !data) {
                        return cb(null, '');
                      }

                      cb(null, data.url);
                    });
                  } else {
                    chanel.imageFullPath = chanel.imageFullPath ? chanel.imageFullPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : chanel.imageFullPath;
                    return cb(null, chanel.imageFullPath);
                  }
                },
                imageMediumPath(cb) {
                  if (chanel.imageMediumPath && !StringHelper.isUrl(chanel.imageMediumPath)) {
                    var filePath = path.join(config.clientFolder, chanel.imageMediumPath);

                    AWSS3.uploadFile({
                      ACL: 'public-read',
                      contentType: 'image/png',
                      filePath,
                      fileName: StringHelper.getFileName(chanel.imageMediumPath)
                    }, function (err, data) {
                      console.log('upload imageMediumPath error', err);
                      if (err || !data) {
                        return cb(null, '');
                      }

                      cb(null, data.url);
                    });
                  } else {
                    chanel.imageMediumPath = chanel.imageMediumPath ? chanel.imageMediumPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : chanel.imageMediumPath;
                    return cb(null, chanel.imageMediumPath);
                  }
                },
                imageThumbPath(cb) {
                  if (chanel.imageThumbPath && !StringHelper.isUrl(chanel.imageThumbPath)) {
                    var filePath = path.join(config.clientFolder, chanel.imageThumbPath);

                    AWSS3.uploadFile({
                      ACL: 'public-read',
                      contentType: 'image/png',
                      filePath,
                      fileName: StringHelper.getFileName(chanel.imageThumbPath)
                    }, function (err, data) {
                      console.log('upload imageThumbPath error', err);
                      if (err || !data) {
                        return cb(null, '');
                      }

                      cb(null, data.url);
                    });
                  } else {
                    chanel.imageThumbPath = chanel.imageThumbPath ? chanel.imageThumbPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : chanel.imageThumbPath;
                    return cb(null, chanel.imageThumbPath);
                  }
                }
              }, (err, result) => {
                if (err) {
                  return cb(null, '');
                }

                chanel.imageFullPath = result.imageFullPath;
                chanel.imageMediumPath = result.imageMediumPath;
                chanel.imageThumbPath = result.imageThumbPath;
                chanels.push(chanel);
                cb();
              })
            }, () => {
              cb(null, chanels);
            })
          },
          moreImages(cb) {
            console.log('More Image ' + video.moreImages);
            var moreImages = []
            async.eachSeries(video.moreImages, (moreImage, cb) => {
              async.auto({
                imageFullPath(cb) {
                  if (moreImage.imageFullPath && !StringHelper.isUrl(moreImage.imageFullPath)) {
                    var filePath = path.join(config.clientFolder, moreImage.imageFullPath);

                    AWSS3.uploadFile({
                      ACL: 'public-read',
                      contentType: 'image/png',
                      filePath,
                      fileName: StringHelper.getFileName(moreImage.imageFullPath)
                    }, function (err, data) {
                      console.log('upload imageFullPath error', err);
                      if (err || !data) {
                        return cb(null, '');
                      }

                      cb(null, data.url);
                    });
                  } else {
                    moreImage.imageFullPath = moreImage.imageFullPath ? moreImage.imageFullPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : moreImage.imageFullPath;
                    return cb(null, moreImage.imageFullPath);
                  }
                },
                imageMediumPath(cb) {
                  if (moreImage.imageMediumPath && !StringHelper.isUrl(moreImage.imageMediumPath)) {
                    var filePath = path.join(config.clientFolder, moreImage.imageMediumPath);

                    AWSS3.uploadFile({
                      ACL: 'public-read',
                      contentType: 'image/png',
                      filePath,
                      fileName: StringHelper.getFileName(moreImage.imageMediumPath)
                    }, function (err, data) {
                      console.log('upload imageMediumPath error', err);
                      if (err || !data) {
                        return cb(null, '');
                      }

                      cb(null, data.url);
                    });
                  } else {
                    moreImage.imageMediumPath = moreImage.imageMediumPath ? moreImage.imageMediumPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : moreImage.imageMediumPath;
                    return cb(null, moreImage.imageMediumPath);
                  }
                },
                imageThumbPath(cb) {
                  if (moreImage.imageThumbPath && !StringHelper.isUrl(moreImage.imageThumbPath)) {
                    var filePath = path.join(config.clientFolder, moreImage.imageThumbPath);

                    AWSS3.uploadFile({
                      ACL: 'public-read',
                      contentType: 'image/png',
                      filePath,
                      fileName: StringHelper.getFileName(moreImage.imageThumbPath)
                    }, function (err, data) {
                      console.log('upload imageThumbPath error', err);
                      if (err || !data) {
                        return cb(null, '');
                      }

                      cb(null, data.url);
                    });
                  } else {
                    moreImage.imageThumbPath = moreImage.imageThumbPath ? moreImage.imageThumbPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : moreImage.imageThumbPath;
                    return cb(null, moreImage.imageThumbPath);
                  }
                }
              }, (err, result) => {
                if (err) {
                  return cb(null, '');
                }

                moreImage.imageFullPath = result.imageFullPath;
                moreImage.imageMediumPath = result.imageMediumPath;
                moreImage.imageThumbPath = result.imageThumbPath;
                moreImages.push(moreImage);
                cb();
              })
            }, () => {
              cb(null, moreImages);
            })
          },
          thumbs(cb) {
            console.log('Thumbs ' + video.thumbs);
            var thumbs = [];
            async.eachSeries(video.thumbs, function(thumb, cb) {
              if (thumb && !StringHelper.isUrl(thumb)) {
                var filePath = path.join(config.clientFolder, thumb);

                AWSS3.uploadFile({
                  ACL: 'public-read',
                  contentType: 'image/png',
                  filePath,
                  fileName: StringHelper.getFileName(thumb)
                }, function (err, data) {
                  if (err || !data) {
                    console.log('upload video thumb error', err);
                    cb();
                  } else {
                    thumbs.push(data.url);
                    cb();
                  }
                });
              }

              if (thumb && StringHelper.isUrl(thumb)) {
                thumbs.push(thumb);
                cb();
              }
            }, function() {
              cb(null, thumbs);
            })
          }
        }, function (err, result) {
          if (err) {
            console.log(err);
            return cb();
          }
          console.log(result);
          VideoModel.update({
            _id: video._id
          }, {
              $set: result
            }, function () {
              console.log('Done for ' + video._id);
              cb();
            });
        });
      }, cb);
    }, function () {
      cb();
    });
  },
  function (cb) {
    PhotoModel.find({}).limit(2000).exec(function (err, photos) {
      if (err) {
        return cb(err);
      }

      async.eachSeries(photos, function (photo, cb) {
        async.auto({
          imageFullPath(cb) {
            if (StringHelper.isUrl(photo.imageFullPath)) {
              photo.imageFullPath = photo.imageFullPath ? photo.imageFullPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : photo.imageFullPath;
              return cb(null, photo.imageFullPath);
            }
            var filePath = path.join(config.clientFolder, photo.imageFullPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(photo.imageFullPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          },
          imageThumbPath(cb) {
            if (StringHelper.isUrl(photo.imageThumbPath)) {
              photo.imageThumbPath = photo.imageThumbPath ? photo.imageThumbPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : photo.imageThumbPath;
              return cb(null, photo.imageThumbPath);
            }
            var filePath = path.join(config.clientFolder, photo.imageThumbPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(photo.imageThumbPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          },
          imageMediumPath(cb) {
            if (StringHelper.isUrl(photo.imageMediumPath)) {
              photo.imageMediumPath = photo.imageMediumPath ? photo.imageMediumPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : photo.imageMediumPath;
              return cb(null, photo.imageMediumPath);
            }
            var filePath = path.join(config.clientFolder, photo.imageMediumPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(photo.imageMediumPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          }
        }, function (err, result) {
          result.images = [result.imageFullPath];
          PhotoModel.update({
            _id: photo._id
          }, {
              $set: result
            }, function () {
              console.log('Synced photo ' + photo._id);
              cb();
            });
        });
      }, function () {
        cb();
      })
    });
  },
  function (cb) {
    SettingModel.findOne({}).exec((err, setting) => {
      if (err) {
        return cb(err);
      }

      async.auto({
        imageHomeFullPath(cb) {
          console.log('Upload Image Home Full Patch ' + setting.imageHomeFullPath);
          if (setting.imageHomeFullPath && !StringHelper.isUrl(setting.imageHomeFullPath)) {
            var filePath = path.join(config.clientFolder, setting.imageHomeFullPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath,
              fileName: StringHelper.getFileName(setting.imageHomeFullPath)
            }, function (err, data) {
              console.log('upload filePath error', err);
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          } else {
            setting.imageHomeFullPath = setting.imageHomeFullPath ? setting.imageHomeFullPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : setting.imageHomeFullPath;
            cb(null, setting.imageHomeFullPath)
          }
        },
        imageWelcomeFullPath(cb) {
          console.log('Upload Image Welcome Full Patch ' + setting.imageWelcomeFullPath);
          if (setting.imageWelcomeFullPath && !StringHelper.isUrl(setting.imageWelcomeFullPath)) {
            var filePath = path.join(config.clientFolder, setting.imageWelcomeFullPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath,
              fileName: StringHelper.getFileName(setting.imageWelcomeFullPath)
            }, function (err, data) {
              console.log('upload filePath error', err);
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          } else {
            setting.imageWelcomeFullPath = setting.imageWelcomeFullPath ? setting.imageWelcomeFullPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : setting.imageWelcomeFullPath;
            cb(null, setting.imageWelcomeFullPath)
          }
        },
        imageMemberNotVip(cb) {
          console.log('Upload Image Member Not Vip ' + setting.imageMemberNotVip);
          if (setting.imageMemberNotVip && !StringHelper.isUrl(setting.imageMemberNotVip)) {
            var filePath = path.join(config.clientFolder, setting.imageMemberNotVip);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath,
              fileName: StringHelper.getFileName(setting.imageMemberNotVip)
            }, function (err, data) {
              console.log('upload filePath error', err);
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          } else {
            setting.imageMemberNotVip = setting.imageMemberNotVip ? setting.imageMemberNotVip.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : setting.imageMemberNotVip;
            cb(null, setting.imageMemberNotVip)
          }
        },
        favicon(cb) {
          console.log('Upload Favicon ' + setting.favicon);
          if (setting.favicon && !StringHelper.isUrl(setting.favicon)) {
            var filePath = path.join(config.clientFolder, setting.favicon);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath,
              fileName: StringHelper.getFileName(setting.favicon)
            }, function (err, data) {
              console.log('upload filePath error', err);
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          } else {
            setting.favicon = setting.favicon ? setting.favicon.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : setting.favicon;
            cb(null, setting.favicon)
          }
        },
        logoFullPath(cb) {
          console.log('Upload Logo Full Patch ' + setting.logoFullPath);
          if (setting.logoFullPath && !StringHelper.isUrl(setting.logoFullPath)) {
            var filePath = path.join(config.clientFolder, setting.logoFullPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath,
              fileName: StringHelper.getFileName(setting.logoFullPath)
            }, function (err, data) {
              console.log('upload filePath error', err);
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          } else {
            setting.logoFullPath = setting.logoFullPath ? setting.logoFullPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : setting.logoFullPath;
            cb(null, setting.logoFullPath)
          }
        },
        fullAccessVideoText(cb) {
          console.log('Upload Logo Full Patch ' + setting.fullAccessVideoText.icon);
          if (setting.fullAccessVideoText && setting.fullAccessVideoText.icon && !StringHelper.isUrl(setting.fullAccessVideoText.icon)) {
            var filePath = path.join(config.clientFolder, setting.fullAccessVideoText.icon);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath,
              fileName: StringHelper.getFileName(setting.fullAccessVideoText.icon)
            }, function (err, data) {
              console.log('upload filePath error', err);
              if (err || !data) {
                return cb(null, setting.fullAccessVideoText);
              }

              setting.fullAccessVideoText.icon = data.url;
              cb(null, setting.fullAccessVideoText);
            });
          } else {
            setting.fullAccessVideoText.icon = setting.fullAccessVideoText ? setting.fullAccessVideoText.icon.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : setting.fullAccessVideoText.icon;
            cb(null, setting.fullAccessVideoText)
          }
        }
      }, (err, result) => {
        if (err) {
          return cb(err)
        }

        SettingModel.update({ _id: setting._id}, {$set: result}, () => {
          console.log('synced Image Home Full Patch');
          cb();
        });
      })
    })
  },
  // function (cb) {
  //   ExternalSite.find({}).limit(1000).exec((err, sites) => {
  //     if (err) {
  //       return cb(err);
  //     }

  //     async.eachSeries(sites, (site, cb) => {
  //       console.log('Upload External Site ' + site.logoPath);
  //       if (site.logoPath && !StringHelper.isUrl(site.logoPath)) {
  //         var filePath = path.join(config.clientFolder, site.logoPath);
  //         AWSS3.uploadFile({
  //           ACL: 'public-read',
  //           contentType: 'image/png',
  //           filePath,
  //           fileName: StringHelper.getFileName(site.logoPath)
  //         }, function (err, data) {
  //           if (err || !data) {
  //             console.log('upload filePath error', err);
  //             return cb(err);
  //           }
  //           console.log(data.url)
  //           ExternalSite.update({
  //             _id: site._id
  //           }, {
  //             $set: { logoPath: data.url}
  //           }, () => {
  //             console.log('Synced External Site ' + site.name);
  //             cb();
  //           });
  //         });
  //       } else {
  //         site.logoPath = site.logoPath ? site.logoPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : site.logoPath;
  //         ExternalSite.update({
  //           _id: site._id
  //         }, {
  //           $set: { logoPath: site.logoPath}
  //         }, () => {
  //           console.log('Synced External Site ' + site.name);
  //           cb();
  //         });
  //       }
  //     }, () => {
  //       cb();
  //     })
  //   })
  // },
  function (cb) {
    BannerModel.find({}).limit(1000).exec(function (err, banners) {
      if (err) {
        return cb(err);
      }

      async.eachSeries(banners, function (banner, cb) {
        async.auto({
          imageFullPath(cb) {
            if (StringHelper.isUrl(banner.imageFullPath)) {
              banner.imageFullPath = banner.imageFullPath ? banner.imageFullPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : banner.imageFullPath;
              return cb(null, banner.imageFullPath);
            }
            var filePath = path.join(config.clientFolder, banner.imageFullPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(banner.imageFullPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          },
          imageThumbPath(cb) {
            if (StringHelper.isUrl(banner.imageThumbPath)) {
              banner.imageThumbPath = banner.imageThumbPath ? banner.imageThumbPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : banner.imageThumbPath;
              return cb(null, banner.imageThumbPath);
            }
            var filePath = path.join(config.clientFolder, banner.imageThumbPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(banner.imageThumbPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          },
          imageMediumPath(cb) {
            if (StringHelper.isUrl(banner.imageMediumPath)) {
              banner.imageMediumPath = banner.imageMediumPath ? banner.imageMediumPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : banner.imageMediumPath;
              return cb(null, banner.imageMediumPath);
            }
            var filePath = path.join(config.clientFolder, banner.imageMediumPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(banner.imageMediumPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          }
        }, function (err, result) {
          result.images = [result.imageFullPath];
          BannerModel.update({
            _id: banner._id
          }, {
              $set: result
            }, function () {
              console.log('Synced banner ' + banner._id);
              cb();
            });
        });
      }, function () {
        cb();
      })
    });
  },
  function (cb) {
    PerformerModel.find({}).limit(1000).exec(function (err, performers) {
      if (err) {
        return cb(err);
      }

      async.eachSeries(performers, function (performer, cb) {
        async.auto({
          imageFullPath(cb) {
            if (!performer.imageFullPath) {
              return cb(null, '');
            }

            if (StringHelper.isUrl(performer.imageFullPath)) {
              performer.imageFullPath = performer.imageFullPath ? performer.imageFullPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : performer.imageFullPath;
              return cb(null, performer.imageFullPath);
            }

            var filePath = path.join(config.clientFolder, performer.imageFullPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(performer.imageFullPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          },
          imageThumbPath(cb) {
            if (!performer.imageThumbPath) {
              return cb(null, '');
            }

            if (StringHelper.isUrl(performer.imageThumbPath)) {
              performer.imageThumbPath = performer.imageThumbPath ? performer.imageThumbPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : performer.imageThumbPath;
              return cb(null, performer.imageThumbPath);
            }
            var filePath = path.join(config.clientFolder, performer.imageThumbPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(performer.imageThumbPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          },
          imageMediumPath(cb) {
            if (!performer.imageMediumPath) {
              return cb(null, '');
            }

            if (StringHelper.isUrl(performer.imageMediumPath)) {
              performer.imageMediumPath = performer.imageMediumPath ? performer.imageMediumPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : performer.imageMediumPath;
              return cb(null, performer.imageMediumPath);
            }
            var filePath = path.join(config.clientFolder, performer.imageMediumPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(performer.imageMediumPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          },
          welcomeVideo(cb) {
            console.log('Upload welcomeVideo ' + performer.welcomeVideo);
            if (performer.welcomeVideo && !StringHelper.isUrl(performer.welcomeVideo)) {
              var filePath = path.join(config.clientFolder, performer.welcomeVideo);

              AWSS3.uploadFile({
                filePath,
                fileName: StringHelper.getFileName(performer.welcomeVideo)
              }, function (err, data) {
                console.log('upload welcomeVideo error', err);
                if (err || !data) {
                  return cb(null, '');
                }

                cb(null, data.url);
              });
            } else {
              performer.welcomeVideo = performer.welcomeVideo ? performer.welcomeVideo.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : performer.welcomeVideo;
              cb(null, performer.welcomeVideo);
            }
          },
          welcomePhoto(cb) {
            if (!performer.welcomePhoto) {
              return cb(null, '');
            }

            if (StringHelper.isUrl(performer.welcomePhoto)) {
              performer.welcomePhoto = performer.welcomePhoto ? performer.welcomePhoto.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : performer.welcomePhoto;
              return cb(null, performer.welcomePhoto);
            }
            var filePath = path.join(config.clientFolder, performer.welcomePhoto);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(performer.welcomePhoto)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          }
        }, function (err, result) {
          PerformerModel.update({
            _id: performer._id
          }, {
              $set: result
            }, function () {
              console.log('Synced performer ' + performer._id);
              cb();
            });
        });
      }, function () {
        cb();
      })
    });
  },
  // function (cb) {
  //   ImageModel.find({}).limit(1000).exec(function (err, images) {
  //     if (err) {
  //       return cb(err);
  //     }

  //     async.eachSeries(images, function (image, cb) {
  //       async.auto({
  //         imageFullPath(cb) {
  //           if (StringHelper.isUrl(image.imageFullPath)) {
  //             image.imageFullPath = image.imageFullPath ? image.imageFullPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : image.imageFullPath;
  //             return cb(null, image.imageFullPath);
  //           }
  //           var filePath = path.join(config.clientFolder, image.imageFullPath);
  //           AWSS3.uploadFile({
  //             ACL: 'public-read',
  //             contentType: 'image/png',
  //             filePath: filePath,
  //             fileName: StringHelper.getFileName(image.imageFullPath)
  //           }, function (err, data) {
  //             if (err || !data) {
  //               return cb(null, '');
  //             }

  //             cb(null, data.url);
  //           });
  //         },
  //         imageThumbPath(cb) {
  //           if (StringHelper.isUrl(image.imageThumbPath)) {
  //             image.imageThumbPath = image.imageThumbPath ? image.imageThumbPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : image.imageThumbPath;
  //             return cb(null, image.imageThumbPath);
  //           }
  //           var filePath = path.join(config.clientFolder, image.imageThumbPath);
  //           AWSS3.uploadFile({
  //             ACL: 'public-read',
  //             contentType: 'image/png',
  //             filePath: filePath,
  //             fileName: StringHelper.getFileName(image.imageThumbPath)
  //           }, function (err, data) {
  //             if (err || !data) {
  //               return cb(null, '');
  //             }

  //             cb(null, data.url);
  //           });
  //         },
  //         imageMediumPath(cb) {
  //           if (StringHelper.isUrl(image.imageMediumPath)) {
  //             image.imageMediumPath = image.imageMediumPath ? image.imageMediumPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : image.imageMediumPath;
  //             return cb(null, image.imageMediumPath);
  //           }
  //           var filePath = path.join(config.clientFolder, image.imageMediumPath);
  //           AWSS3.uploadFile({
  //             ACL: 'public-read',
  //             contentType: 'image/png',
  //             filePath: filePath,
  //             fileName: StringHelper.getFileName(image.imageMediumPath)
  //           }, function (err, data) {
  //             if (err || !data) {
  //               return cb(null, '');
  //             }

  //             cb(null, data.url);
  //           });
  //         }
  //       }, function (err, result) {
  //         ImageModel.update({
  //           _id: image._id
  //         }, {
  //             $set: result
  //           }, function () {
  //             console.log('Synced image ' + image._id);
  //             cb();
  //           });
  //       });
  //     }, function () {
  //       cb();
  //     })
  //   });
  // },
  // function (cb) {
  //   CategoryModel.find({}).limit(1000).exec(function (err, categories) {
  //     if (err) {
  //       return cb(err);
  //     }

  //     async.eachSeries(categories, function (category, cb) {
  //       async.auto({
  //         imageFullPath(cb) {
  //           if (category.imageFullPath && !StringHelper.isUrl(category.imageFullPath)) {
  //             var filePath = path.join(config.clientFolder, category.imageFullPath);
  //             AWSS3.uploadFile({
  //               ACL: 'public-read',
  //               contentType: 'image/png',
  //               filePath: filePath,
  //               fileName: StringHelper.getFileName(category.imageFullPath)
  //             }, function (err, data) {
  //               if (err || !data) {
  //                 return cb(null, '');
  //               }

  //               cb(null, data.url);
  //             });
  //           } else {
  //             category.imageFullPath = category.imageFullPath ? category.imageFullPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : category.imageFullPath;
  //             return cb(null, category.imageFullPath);
  //           }
  //         },
  //         imageThumbPath(cb) {
  //           if (category.imageThumbPath && !StringHelper.isUrl(category.imageThumbPath)) {
  //             var filePath = path.join(config.clientFolder, category.imageThumbPath);
  //             AWSS3.uploadFile({
  //               ACL: 'public-read',
  //               contentType: 'image/png',
  //               filePath: filePath,
  //               fileName: StringHelper.getFileName(category.imageThumbPath)
  //             }, function (err, data) {
  //               if (err || !data) {
  //                 return cb(null, '');
  //               }

  //               cb(null, data.url);
  //             });
  //           } else {
  //             category.imageThumbPath = category.imageThumbPath ? category.imageThumbPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : category.imageThumbPath;
  //             return cb(null, category.imageThumbPath);
  //           }
  //         },
  //         imageMediumPath(cb) {
  //           if (category.imageMediumPath && !StringHelper.isUrl(category.imageMediumPath)) {
  //             var filePath = path.join(config.clientFolder, category.imageMediumPath);
  //             AWSS3.uploadFile({
  //               ACL: 'public-read',
  //               contentType: 'image/png',
  //               filePath: filePath,
  //               fileName: StringHelper.getFileName(category.imageMediumPath)
  //             }, function (err, data) {
  //               if (err || !data) {
  //                 return cb(null, '');
  //               }

  //               cb(null, data.url);
  //             });
  //           } else {
  //             category.imageMediumPath = category.imageMediumPath ? category.imageMediumPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : category.imageMediumPath;
  //             return cb(null, category.imageMediumPath);
  //           }
  //         }
  //       }, function (err, result) {
  //         CategoryModel.update({
  //           _id: category._id
  //         }, {
  //             $set: result
  //           }, function () {
  //             console.log('Synced Category ' + category._id);
  //             cb();
  //           });
  //       });
  //     }, function () {
  //       cb();
  //     })
  //   });
  // },
  function (cb) {
    UserModel.find({}).limit(10000).exec(function (err, users) {
      if (err) {
        return cb(err);
      }

      async.eachSeries(users, function (user, cb) {
        async.auto({
          imageThumbPath(cb) {
            if (!user.imageThumbPath) {
              return cb(null, '');
            }

            if (user.imageThumbPath && StringHelper.isUrl(user.imageThumbPath)) {
              user.imageThumbPath = user.imageThumbPath ? user.imageThumbPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : user.imageThumbPath;
              return cb(null, user.imageThumbPath);
            }
            var filePath = path.join(config.clientFolder, user.imageThumbPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(user.imageThumbPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          },
          imageMediumPath(cb) {
            if (!user.imageMediumPath) {
              return cb(null, '');
            }

            if (user.imageMediumPath && StringHelper.isUrl(user.imageMediumPath)) {
              user.imageMediumPath = user.imageMediumPath ? user.imageMediumPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : user.imageMediumPath;
              return cb(null, user.imageMediumPath);
            }

            var filePath = path.join(config.clientFolder, user.imageMediumPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(user.imageMediumPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          },
          photo(cb) {
            if (!user.photo) {
              return cb(null, '');
            }
            if (user.photo && StringHelper.isUrl(user.photo)) {
              return cb(null, user.photo);
            }

            var filePath = path.join(config.clientFolder, user.photo);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(user.photo)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          }
        }, function (err, result) {
          UserModel.update({
            _id: user._id
          }, {
              $set: result
            }, function () {
              console.log('Synced User ' + user._id);
              cb();
            });
        });
      }, function () {
        cb();
      })
    });
  },
  function(cb) {
    ProductModel.find({}).limit(1000).exec(function(err, products) {
      if (err) {
        return cb(err)
      }

      async.eachSeries(products, function(product, cb) {
        async.auto({
          imageThumbPath(cb) {
            if (product.imageThumbPath && StringHelper.isUrl(product.imageThumbPath)) {
              product.imageThumbPath = product.imageThumbPath ? product.imageThumbPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : product.imageThumbPath;
              return cb(null, product.imageThumbPath);
            }
            var filePath = path.join(config.clientFolder, product.imageThumbPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(product.imageThumbPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          },
          imageMediumPath(cb) {
            if (product.imageMediumPath && StringHelper.isUrl(product.imageMediumPath)) {
              product.imageMediumPath = product.imageMediumPath ? product.imageMediumPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : product.imageMediumPath;
              return cb(null, product.imageMediumPath);
            }

            var filePath = path.join(config.clientFolder, product.imageMediumPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(product.imageMediumPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          },
          imageFullPath(cb) {
            if (product.imageFullPath && StringHelper.isUrl(product.imageFullPath)) {
              product.imageFullPath = product.imageFullPath ? product.imageFullPath.replace("balkansins.com.s3.amazonaws.com", "s3.us-east-2.amazonaws.com/balkansins.com") : product.imageFullPath;
              return cb(null, product.imageFullPath);
            }

            var filePath = path.join(config.clientFolder, product.imageFullPath);
            AWSS3.uploadFile({
              ACL: 'public-read',
              contentType: 'image/png',
              filePath: filePath,
              fileName: StringHelper.getFileName(product.imageFullPath)
            }, function (err, data) {
              if (err || !data) {
                return cb(null, '');
              }

              cb(null, data.url);
            });
          }
        }, function (err, result) {
          ProductModel.update({
            _id: product._id
          }, {
              $set: result
            }, function () {
              console.log('Synced Product ' + product._id);
              cb();
            });
        });
      }, function () {
        cb();
      })
    })
  }
], function () {
  console.log('Synced done')
  process.exit();
});