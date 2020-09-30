(function (angular) {
  'use strict';

  angular.module('xMember').controller('PhotoDetailCtrl', function($scope, $rootScope, $state, $timeout, Auth, Lightbox, photos, album, performer, perfomerService) {
    $scope.isLoggedIn = Auth.isLoggedIn();
    $scope.photos = photos.items;
    $scope.album = album;
    $scope.performer = performer;
    $scope.start = 0;
    $scope.currentUser = Auth.getCurrentUser();
    if ($state.params.id) {
      $scope.start = _.findIndex($scope.photos, function(p) {
        return p._id === $state.params.id;
      }) || 0;
    }

    //rotate photo
    $scope.photoDegree = 0;
    $scope.rotate = function(){
      $scope.photoDegree += 90;
    }
    //check subscribe
    if($scope.performer && $scope.isLoggedIn){
      perfomerService.checkSubscribe($scope.performer._id).then(function(res) {
        $scope.isSubscribed = res.subscribed;
        if( $scope.performer._id === $scope.currentUser._id) {
          $scope.isSubscribed = 1;
        }
      });
    }else {
        $scope.isSubscribed = 0;
    }

    function setActive(index) {
      if (!$scope.photos[index]) {
        return;
      }
      $scope.start = index;
      $scope.photos[index].active = true;
      $scope.activeUrl = $scope.currentUser && $scope.isSubscribed === 1 ? $scope.photos[index].imageFullPath : $scope.photos[index].imageThumbPath;
      $scope.activePhoto = $scope.photos[index];

      var baseurl = window.location.origin + window.location.pathname;
      $rootScope.shareImageUrl = window.isURL($scope.activePhoto.imageThumbPath) ? $scope.activePhoto.imageThumbPath : baseurl + $scope.activePhoto.imageThumbPath;

      $scope.safeApply();
      //change state without refresh
      $state.transitionTo('photo', _.assign($state.params, {
        id: $scope.photos[index]._id
      }), {
        location: true,
        inherit: true,
        relative: $state.$current,
        notify: false
      });
      document.title = $scope.activePhoto.name;

      $timeout(function() {
        $scope.$broadcast('CHANGED_SLIDE_ITEM', $scope.photos[index]);
      });
    }

    if ($scope.photos.length) {
      setActive($scope.start);
      $state.current.data = {
        pageTitle: $scope.activePhoto.name,
        metaKeywords: $scope.activePhoto.metaKeywords,
        metaDescription: $scope.activePhoto.metaDescription,
        metaTitle: $scope.activePhoto.metaTitle
      };
    }

    $scope.$on('CHANGE_SLIDE_ITEM', function(evt, item) {
      var index = _.findIndex($scope.photos, function(p) {
        return p._id === item._id;
      });
      setActive(index);
    });
    $scope.changePic = function(action) {
      if (action === 'prev') {
        setActive(--$scope.start);
      } else {
        setActive(++$scope.start);
      }
    };
  }).directive('clickSlide', function() {
    return {
      restrict: 'A',
      scope: {
        item: '='
      },
      link(scope, elem) {
        $(elem).click(function() {
          scope.$emit('CHANGE_SLIDE_ITEM', scope.item);
        });

        scope.$on('CHANGED_SLIDE_ITEM', function(evt, item) {
          if (scope.item) {
            scope.item.active = item._id === scope.item._id;
          }
        });
      }
    };
  });
})(angular);
