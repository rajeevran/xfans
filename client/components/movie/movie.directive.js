'use strict';

angular.module('xMember')
.directive('movieNew', function() {
  return {
    templateUrl: 'components/movie/movie_new.html',
    restrict: 'E',
    replace:true,
    controller: function($scope, videoService) {

      videoService.findAllByType(8,'upcoming').then(function(res){
        $scope.videoUpcoming = res.data;
      });

    }
  };
})
.directive('movieRecent', function() {
  return {
    templateUrl: 'components/movie/movie_recent.html',
    restrict: 'E',
    replace:true,
    scope: {
      showHome: '='
    },
    controller: function($scope, videoService) {

      videoService.findAllByType(12, 'recent', undefined, undefined, {
        showHome: 1
      }).then(function(res){
        $scope.videos = res.data;
      });

    }
  };
})
.directive('movieCard', function($rootScope, $timeout, Auth) {
  return {
    templateUrl: 'components/movie/card.html',
    restrict: 'A',
    scope: {
      video: '='
    },
    link: function(scope, elem) {
      //show thumbs for only subscibed user
      let isSubscribed = false;
      var thumbPath = '/assets/subscriber-thumb.png'; //scope.video.imageMediumPath;
      var timeout;
      var index = 0;
      var length = scope.video.thumbs ? scope.video.thumbs.length : 0;
      function preload(imageArray, i) {
        if (imageArray && imageArray.length > i) {
          var img = new Image();
          img.onload = function () {
            preload(imageArray, i + 1);
          };
          img.src = scope.video.thumbs[i];
        }
      }
      if (length && isSubscribed) {
        scope.thumbPath = scope.video.thumbs[0];
        preload(scope.video.thumbs, 0);
      }else {
        scope.thumbPath = thumbPath;
      }

      function doGif() {
        if (timeout) {
          $timeout.cancel(timeout);
        }

        if (index >= length - 1) {
          index = 0;
        }

        scope.thumbPath = scope.video.thumbs[index];

        index++;

        timeout = $timeout(doGif, 1000);
      }

      $(elem).mouseover(function() {
        if (!length || !isSubscribed) {
          return;
        }

        doGif();
      });

      $(elem).mouseout(function() {
        index = 0;
        if(length && isSubscribed) {
          scope.thumbPath = scope.video.thumbs[1];
        }else {
          scope.thumbPath = thumbPath;
        }
        $timeout.cancel(timeout);
      });

      Auth.getSubscribedPerformers(function(data) {
        var performerIds = data.map(item => item.performerId);
        (scope.video.performer || []).forEach(function(p) {
          if (performerIds.indexOf(p) > -1) {
            isSubscribed = true;
            scope.thumbPath = scope.video.thumbs[1];
            $rootScope.safeApply();
          }
        });
      });
    }
  };
})
.directive('movieLineCard', function($rootScope, $timeout, Auth, appConfig, videoService, commentService, growl) {
  return {
    templateUrl: 'components/movie/movie-card.html',
    restrict: 'A',
    scope: {
      video: '='
    },
    link: function(scope, elem) {
      scope.isLoggedIn = Auth.isLoggedIn();
      scope.isOwner = false;
      if(scope.isLoggedIn) {
        scope.currentUser = Auth.getCurrentUser();
        if (scope.currentUser._id = scope.video.user){
          scope.isOwner = true;
        }
      }
      if(scope.video.filePath){
        var filePart = scope.video.filePath;
        let sources = [];
        if (appConfig.enableRTMP) {
          if (!scope.video.convertedFiles || !scope.video.convertedFiles.length) {
            let tmp = filePart.split('/');
            filePart = 'rtmp://'+SITENAME+':1935/adv/' + tmp[tmp.length-1];
            sources = [{
              file: filePart,
              label: 'Default'
            }];
          } else {
            scope.video.convertedFiles.forEach(file => {
              let tmp = file.path.split('/');
              filePart = 'rtmp://'+SITENAME+':1935/adv/' + tmp[tmp.length-1];
              sources.push({
                file: filePart,
                label: file.width + 'p'
              })
            });
          }
        } else {
          if (!scope.video.convertedFiles || !scope.video.convertedFiles.length) {
            sources = [{
              file: filePart,
              label: 'Default'
            }];
          } else {
            scope.video.convertedFiles.forEach(file => sources.push({
              file: file.path,
              label: file.width + 'p'
            }));
          }
        }

        scope.jwplayerOptions = {
          //file: filePart,
          sources,
          image: scope.video.thumbs[1], // optionnal
          height: 450,
          width: "100%",
          // primary: 'flash',
          logo : {
            file: $rootScope.setting.videoWatermarkPath,
            hide: false,
            position: 'bottom-right'
          },
          onPlay: function() {
          videoService.increaseView(video._id);
        }
        };
      }
      scope.video.isPlayed = false;
      scope.playVideo = function() {
        scope.video.isPlayed = !scope.video.isPlayed;
      }
      //show thumbs for only subscibed user
      let isSubscribed = false;
      var thumbPath = '/assets/subscriber-thumb-grey.png'; //scope.video.imageMediumPath;
      var timeout;
      var index = 0;
      var length = scope.video.thumbs ? scope.video.thumbs.length : 0;
      if (length && isSubscribed) {
        scope.thumbPath = scope.video.thumbs[1];
      }else {
        scope.thumbPath = thumbPath;
      }

      function doGif() {
        if (timeout) {
          $timeout.cancel(timeout);
        }

        if (index >= length - 1) {
          index = 0;
        }

        scope.thumbPath = scope.video.thumbs[index];

        index++;

        timeout = $timeout(doGif, 1000);
      }

      $(elem).mouseover(function() {
        if (!length || !isSubscribed) {
          return;
        }

        doGif();
      });

      $(elem).mouseout(function() {
        index = 0;
        if(length && isSubscribed) {
          scope.thumbPath = scope.video.thumbs[1];
        }else {
          scope.thumbPath = thumbPath;
        }
        $timeout.cancel(timeout);
      });

      Auth.getSubscribedPerformers(function(data) {
        var performerIds = data.map(item => item.performerId);
        (scope.video.performer || []).forEach(function(p) {
          if (performerIds.indexOf(p) > -1) {
            isSubscribed = true;
            scope.video.isSubscribed = true;
            scope.thumbPath = scope.video.thumbs[1];
            $rootScope.safeApply();
          }
        });
      });

      // do Like & comment
      scope.comments = [];
      scope.comment = {
        video: scope.video._id,
        content: ''
      };
      scope.limit = 5;
      scope.isOpen = false;
      scope.open = function() {
        scope.isOpen = !scope.isOpen;
        if(scope.isOpen) {
          scope.getComments();
        }
      };
      scope.getComments = function() {
        commentService.findAllByVideo(scope.video._id, scope.limit).then(function(data){
          scope.comments = _.merge(scope.comments, data.data);
        });
      };
      scope.loadMoreComments = function() {
        scope.limit += 5;
        scope.getComments();
      };
      scope.submitted = false;
      scope.saveComment = function(form){
        scope.submitted = true;
        if (form.$valid) {
          commentService.create(scope.comment)
            .then((res) => {
              res.data.isOwner = true;
              scope.comments.unshift(res.data);
              scope.comment.content = null;
              scope.submitted =false;
              scope.err = null;
              scope.video.stats.totalComment += 1;
              growl.success("Comment successfully",{ttl:3000});
            })
            .catch(err => {
              scope.err = err.data.content[0];
            });
        }
      };

      //Like Video
      scope.likeVideo = function(video){
        if(Auth.isLoggedIn()){
          videoService.like(video).then(function(res){
              scope.video.stats.totalLike = res.data.stats.totalLike;
              growl.success("Thank you",{ttl:3000});
          })
          .catch(err => {
            growl.error(err.data, {ttl:3000});
          })
        }else{
          growl.error("Please login before like",{ttl:3000});
        }
      };

    }
  };
});
