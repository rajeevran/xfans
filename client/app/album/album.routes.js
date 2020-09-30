(function (angular) {
  'use strict';

  angular.module('xMember')
    .config(function($stateProvider) {
      $stateProvider
        .state('album', {
          url: '/models/:performerId/albums/:id',
          templateUrl: 'app/album/album-detail.html',
          controller: 'AlbumDetailCtrl',
          resolve: {
            photos(photoService, $stateParams) {
              return photoService.search({
                albumId: $stateParams.id,
                performerId: $stateParams.performerId,
                take: 1000 //TOTO - add load more function
              });
            },
            album(photoService, $stateParams) {
              if ($stateParams.id === 'others') {
                return {
                  _id: 'others',
                  name: 'Others'
                };
              }
              return photoService.findAlbum($stateParams.id);
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
