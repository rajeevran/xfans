'use strict';

angular.module('xMember').config(function($stateProvider) {
  $stateProvider.state('albums', {
    url: '/albums',
    template: '<ui-view/>'
  })
  .state('albums.create', {
    url: '/create?performerId',
    templateUrl: 'app/album/views/create.html',
    controller: 'AlbumCreateCtrl',
    data: {
      pageTitle: 'Create new album',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  })
  .state('albums.update', {
    url: '/:id/update?performerId',
    templateUrl: 'app/album/views/update.html',
    controller: 'AlbumUpdateCtrl',
    resolve: {
      item: function(albumService, $stateParams) {
        return albumService.findOne($stateParams.id);
      }
    },
    data: {
      pageTitle: 'Update album',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  })
  .state('albums.list', {
    url: '/list?performerId',
    templateUrl: 'app/album/views/list.html',
    controller: 'AlbumListCtrl',
    data: {
      pageTitle: 'Albums',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });
});
