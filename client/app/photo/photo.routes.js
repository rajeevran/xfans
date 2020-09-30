(function (angular) {
  'use strict';

  angular.module('xMember')
    .config(function($stateProvider) {
      $stateProvider
        .state('photo', {
          url: '/models/:performerId/albums/:albumId/photos?id',
          templateUrl: 'app/photo/photo.html',
          controller: 'PhotoDetailCtrl',
          resolve: {
            photos(photoService, $stateParams) {
              return photoService.search({
                albumId: $stateParams.albumId,
                performerId: $stateParams.performerId,
                take: 1000 //TOTO - add load more function
              });
            },
            album(photoService, $stateParams) {
              if ($stateParams.albumId === 'others') {
                return {
                  _id: 'others',
                  name: 'Others'
                };
              }
              return photoService.findAlbum($stateParams.albumId);
            },
            performer(perfomerService, $stateParams){
              return perfomerService.find($stateParams.performerId).then(function(data){
                return data.data;
              });
            },
          }
        });
    });
})(angular);
