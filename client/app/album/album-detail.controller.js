(function (angular) {
  'use strict';

  angular.module('xMember').controller('AlbumDetailCtrl', AlbumDetailCtrl);

  function AlbumDetailCtrl($scope, $state, Auth, Lightbox, photos, album, performer) {
    $scope.photos = photos.items;
    $scope.album = album;
    $scope.performer = performer;
    $state.current['data'] = {
      pageTitle: album.name,
      metaKeywords: album.metaKeywords,
      metaDescription: album.metaDescription,
      metaTitle: album.metaTitle
    };
  }
})(angular);
