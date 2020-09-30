(function(angular) {
  "use strict";

  angular.module("xMember").controller("MovieDetailCtrl", MovieDetailCtrl);

  function MovieDetailCtrl(
    $scope,
    $rootScope,
    growl,
    $sce,
    commentService,
    $state,
    Auth,
    Lightbox,
    settings,
    userService,
    saveVideoService,
    videoService,
    photoService,
    perfomerService,
    video,
    comments,
    SITENAME,
    appConfig,
    me
  ) {
    $scope.video = video;
    $scope.comments = comments;
    $scope.isSaleVideo = video.isSaleVideo;
    $scope.isLoggedIn = Auth.isLoggedIn();
    $scope.currentUser = me;
    $scope.isSubscribed = 0;
    videoService.increaseView(video._id);
    //check for sale video
    $scope.isBoughtVideo = false;
    if ($scope.isLoggedIn && video.isSaleVideo) {
      videoService
        .checkBuySaleVideo(video._id)
        .then(resp => ($scope.isBoughtVideo = resp.ok));
    }

    if (video.isSaleVideo && me && me._id === video.user) {
      $scope.isBoughtVideo = true;
    }

    if (video.filePath) {
      var filePart = video.filePath;
      let sources = [];
      if (appConfig.enableRTMP) {
        if (!video.convertedFiles || !video.convertedFiles.length) {
          let tmp = filePart.split("/");
          filePart = "rtmp://" + SITENAME + ":1935/adv/" + tmp[tmp.length - 1];
          sources = [
            {
              file: filePart,
              label: "Default"
            }
          ];
        } else {
          video.convertedFiles.forEach(file => {
            let tmp = file.path.split("/");
            filePart =
              "rtmp://" + SITENAME + ":1935/adv/" + tmp[tmp.length - 1];
            sources.push({
              file: filePart,
              label: file.width + "p"
            });
          });
        }
      } else {
        if (!video.convertedFiles || !video.convertedFiles.length) {
          sources = [
            {
              file: filePart,
              label: "Default"
            }
          ];
        } else {
          video.convertedFiles.forEach(file =>
            sources.push({
              file: file.path,
              label: file.width + "p"
            })
          );
        }
      }

      $scope.jwplayerOptions = {
        //file: filePart,
        sources,
        image: video.imageFullPath, // optionnal
        height: 450,
        width: "100%",
        // primary: 'flash',
        logo: {
          file: settings.videoWatermarkPath,
          hide: false,
          position: "bottom-right"
        },
        onPlay: function() {
          videoService.increaseView(video._id);
        }
      };
    }

    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    };

    $scope.submitComment = function(form) {
      $scope.submitted = true;
      if (form.$valid) {
        commentService
          .create($scope.comment)
          .then(res => {
            res.data.isOwner = true;
            $scope.comments.push(res.data);
            $scope.comment.content = null;
            $scope.submitted = false;
            $scope.err = null;
            $scope.video.stats.totalComment =
              $scope.video.stats.totalComment + 1;
            growl.success("Comment successfully", { ttl: 3000 });
          })
          .catch(err => {
            $scope.err = err.data.content[0];
          });
      }
    };
    //check subscribe

    if (video.performer.length && Auth.isLoggedIn) {
      Auth.getSubscribedPerformers(function(data) {
        var performerIds = data.map(item => item.performerId);
        video.performer.forEach(p => {
          if (performerIds.indexOf(p) > -1) {
            $scope.isSubscribed = 1;
            $scope.saveComment = $scope.submitComment;
          } else {
            $scope.saveComment = function() {
              growl.error("For submiting comment you must be subsciber.");
            };
          }
        });
      });
    }

    $scope.comment = {
      video: $scope.video._id,
      content: null
    };
    $scope.show = false;
    if (typeof $scope.video.fileTrailerPath != "undefined") {
      $scope.show = true;
    }
    $state.current["data"] = {
      pageTitle: $scope.video.name
    };

    $scope.videos = [];

    if ($scope.video.performer) {
      videoService
        .findOthersByName($scope.video._id, $scope.video.performer[0])
        .then(function(data) {
          $scope.videos = data;
        });
    }

    // delete comments

    angular.forEach($scope.comments, function(item) {
      if (item.user && item.user._id === me._id) {
        item.isOwner = true;
      }
    });

    $scope.removeComment = function(comment, index) {
      if (Auth.isLoggedIn && comment.isOwner) {
        if (window.confirm("Are you sure to delete this comment?")) {
          commentService.delete(comment._id);
          $scope.comments.splice(index, true);
        }
      } else {
        growl.error("You can not remove this comment", { ttl: 3000 });
      }
    };
    angular.forEach($scope.packages, function(item) {
      var PriceArr = item.price.toString().split(".");
      item["priceArr"] = PriceArr;
      if (typeof PriceArr[1] == "undefined") {
        PriceArr[1] = "00";
      }
    });

    //Update Vip
    $scope.updateVip = function(plan) {
      if (Auth.isLoggedIn) {
        $state.go("payment", { type: "upgrade", package: plan._id });
      } else {
        $state.go("package", { id: plan._id });
      }
    };
    //Like Video
    $scope.likeVideo = function(video) {
      if (Auth.isLoggedIn) {
        videoService.like(video).then(
          function(res) {
            if (res) {
              $scope.video.stats.totalLike = res.data.stats.totalLike;
              growl.success("Like successfully", { ttl: 3000 });
            } else {
              growl.error(res);
            }
          },
          function(err) {
            growl.error(err.data, { ttl: 3000 });
          }
        );
      } else {
        growl.error("Please login before like", { ttl: 3000 });
      }
    };

    //Favorite Video
    $scope.favoriteVideo = function(video) {
      if (Auth.isLoggedIn) {
        saveVideoService.favoriteVideo(video).then(
          function(res) {
            growl.success("Add to favorite successfully", { ttl: 3000 });
          },
          function(error) {
            growl.error(error.data.error, { ttl: 3000 });
          }
        );
      } else {
        growl.error("Please login before add favorite", { ttl: 3000 });
      }
    };

    //Watch Later Video
    $scope.watchLaterVideo = function(video) {
      if (Auth.isLoggedIn) {
        saveVideoService.watchlaterVideo(video).then(
          function(res) {
            growl.success("Add to watch later successfully", { ttl: 3000 });
          },
          function(error) {
            growl.error(error.data.error, { ttl: 3000 });
          }
        );
      } else {
        growl.error("Please login before add watch later", { ttl: 3000 });
      }
    };

    //Download Video
    $scope.downloadVideo = function(video) {
      if (Auth.isLoggedIn) {
        video["downloadedDate"] = moment(new Date()).format("MM/DD/YYYY");
        userService.downloadVideo(video).then(
          function(res) {
            // growl.success("Add to watch later successfully",{ttl:3000});
          },
          function(error) {
            growl.error(error.data.error, { ttl: 3000 });
          }
        );
      }
    };

    // //find model
    // $scope.performers = [];
    // if ($scope.video.performer) {
    //   angular.forEach($scope.video.performer, function(performer) {
    //     perfomerService.find(performer).then(function(res) {
    //       $scope.performer = res.data;
    //       $scope.performers.push($scope.performer);
    //     });
    //   });
    // }

    //show photos in the album
    if ($scope.video.photoAlbumId) {
      photoService
        .search({ albumId: $scope.video.photoAlbumId, take: 1000 })
        .then(function(photos) {
          $scope.photos = photos.items;
        });
    }

    $scope.openLightboxModal = function(index) {
      if (Auth.isLoggedIn && $scope.isSubscribed === 1) {
        Lightbox.openModal($scope.photos, index);
      }
    };
  }
})(angular);
