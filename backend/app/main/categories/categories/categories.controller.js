(function (angular) {
  'use strict';

  angular.module('xMember').controller('CategoriesController', CategoriesController);

  function CategoriesController($scope, categoriesService, growl) {

    $scope.categories = [];
    $scope.query = {
      keyword: '',
      sort: 'createdAt',
      order: -1
    };

    $scope.maxSize = 10;
    $scope.totalItems = 0;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalItemInPage = 10;
    $scope.delete = deleteItem;
    $scope.pageChanged = loadData;

    loadData($scope.currentPage);

    //Set up sort Gird
    $(function () {
      $(".dataTables_filter input").keyup(function (e) {
        if (e.keyCode == 13) {
          $scope.pageChanged(1);
        }
      })
      $(".table-scrollable th").on('click', function () {
        var indexClick = $(this).index();
        $(".table-scrollable th").each(function (index) {
          if (index != indexClick) {
            if ($(this).hasClass('sorting')) {
              $(this).removeClass('sorting_desc');
              $(this).removeClass('sorting_asc');
            } else if ($(this).hasClass('sorting_desc')) {
              $(this).removeClass('sorting_desc');
              $(this).addClass('sorting');
            } else if ($(this).hasClass('sorting_asc')) {
              $(this).removeClass('sorting_asc');
              $(this).addClass('sorting');
            }
          }
        });

        if ($(this).hasClass('sorting_desc')) {
          $(this).removeClass('sorting_desc');
          $(this).addClass('sorting_asc');
          $scope.query.order = 1;
        } else if ($(this).hasClass('sorting_asc')) {
          $(this).removeClass('sorting_asc');
          $(this).addClass('sorting_desc');
          $scope.query.order = -1;
        } else if ($(this).hasClass('sorting')) {
          $(this).addClass('sorting_asc');
          $scope.query.order = 1;
        }
        $scope.$apply();
        if (typeof $(this).attr('rel') != 'undefined') {
          $scope.query.sort = $(this).attr('rel');
          $scope.pageChanged(1);
        }
      });
    });

    function deleteItem(item, index) {
      categoriesService.remove({id:item._id}).$promise.then(function (res) {
        if (res) {
          $scope.categories.splice(index, true);
          $scope.totalItems = $scope.totalItems - 1;
          growl.success("Deleted successfully", {ttl: 3000});
        }
      });
    }

    function loadData(currentPage) {
      categoriesService.findAll($scope.query).$promise.then(function (data) {
        $scope.totalItems = data.length;
      });

      categoriesService.findAll(angular.merge({
        limit:$scope.itemsPerPage,
        offset:currentPage - 1
      }, $scope.query)).$promise
        .then(function (data) {
        $scope.categories = data;
        $scope.totalItemInPage = ($scope.itemsPerPage * ($scope.currentPage - 1)) + data.length;
      });
    }
  }

})(angular);
