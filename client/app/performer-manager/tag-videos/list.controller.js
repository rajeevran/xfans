'use strict';

angular.module('xMember').controller('TagVideosCtrl', function ($scope, $filter, $state, growl, videoService, me, models) {
  $scope.select2Options = {
    'multiple': false,
    'simple_tags': true
  };
  $scope.models = models;
  $scope.me = me;
  $scope.items = [];
  $scope.performerTagId = ''
  $scope.maxSize = 10;
  $scope.totalItems = 0;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 20;
  $scope.pageChanged = loadData;
  loadData($scope.currentPage);

  function loadData(currentPage) {
    videoService.search({
      take: $scope.itemsPerPage,
      page: currentPage,
      performerId: me._id,
      filter: 'tag'
    }).then((resp) => {
      $scope.totalItems = resp.count;
      $scope.items = resp.items;
    });
  };


  $scope.untag = function(item, $index) {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    let idIndex = item.performer.indexOf(me._id);
    item.performer.splice(idIndex,1);
    videoService.update(item._id, item).then(resp => {
      $scope.items.splice($index, 1);
      growl.success('Success.',{ttl:3000});
    }).catch(err => growl.error(err, {ttl:3000}));
  };

});
