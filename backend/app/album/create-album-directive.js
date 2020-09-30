'use strict';

angular.module('xMember').directive('albumCreate', function ($timeout, growl, Upload, albumService, photoService) {
  return {
    restrict: 'A',
    templateUrl: 'app/album/views/album-create-directive.html',
    scope: {
      options: '='
    },
    link: function(scope) {
      if (!scope.options) {
        scope.options = {};
      }
      scope.photos = [];
      scope.files = [];

      if (scope.options.photoAlbumId) {
        photoService.search({
          albumId: scope.options.photoAlbumId
        })
        .then(function(resp) {
          scope.photos = resp.items;
        });

        albumService.findOne(scope.options.photoAlbumId).then(function(album) {
          scope.name = album.name;
        });
      }

      scope.remove = function(index) {
        scope.files.splice(index, 1);
      };

      scope.populateFile = function(files) {
        _.map(files, function(file) {
          file.data = {
            name: file.name.replace(/\.[^/.]+$/, '')
          };
          scope.files.push(file);
        });
      };

      scope.options.upload = function(data, cb) {
        var performerIds = data.performerIds;
        var name = data.name;
        var photoAlbumId = data.photoAlbumId || scope.options.photoAlbumId;
        if (!scope.files) {
          return cb(null, []);
        }
        //do create a new album id album not provided
        async.waterfall([
          function(cb) {
            //TODO - update photo album
            if (photoAlbumId) {
              return albumService.update(photoAlbumId, {
                name: scope.name || name || 'Video photo album',
                performerIds: performerIds || [],
                type: data.type
              }).then(function() {
                cb(null, photoAlbumId);
              })
              .catch(cb);
            }

            if (!scope.files || !scope.files.length) {
              return cb();
            }

            albumService.create({
              name: scope.name || name || 'Video photo album',
              performerIds: performerIds || []
            })
            .then(data => cb(null, data._id))
            .catch(cb);
          }
        ], function(err, albumId) {
          if (err || !albumId) {
            return cb(err);
          }

          var result = [];
          async.eachSeries(scope.files, function(file, cb) {
            Upload.upload({
              url: '/api/v1/photos',
              method: 'POST',
              file: [file],
              data: {
                name: file.name,
                performer: performerIds || [],
                performerAlbumIds: [albumId]
              }
            }).then(function (response) {
              result.push(response.data);
              cb();
            }, function (response) {});
          }, function() {
            cb(null, {
              albumId: albumId,
              photos: result
            });
          });
        });
      };

      scope.delete = function(photo, index) {
        photoService.delete(photo._id).then(function() {
          scope.photos.splice(index, 1);
        });
      };
    }
  };
});
