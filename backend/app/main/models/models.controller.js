angular.module('xMember').controller('ModelsCtrl', function ($scope, $state, growl, perfomerService, performers, performerCount) {
  $scope.performers = performers;
  $scope.query = {
    keyword: '',
    sort: 'createdAt',
    order: -1
  };
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
  })
  $scope.maxSize = 10;
  $scope.totalItems = performerCount;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 10;
  $scope.totalItemInPage = 10;
  $scope.delete = function (performer, index) {
    perfomerService.delete(performer._id).then(function (res) {
      if (res) {
        $scope.performers.splice(index, true);
        $scope.totalItems = $scope.totalItems - 1;
        growl.success("Deleted successfully", {
          ttl: 3000
        });
      }
    });
  }
  $scope.pageChanged = function (currentPage) {
    perfomerService.findAll('undefined', 'undefined', $scope.query).then(function (res) {
      $scope.totalItems = res.data;
    });
    perfomerService.findAll($scope.itemsPerPage, currentPage - 1, $scope.query).then(function (data) {
      $scope.performers = data.data;
      $scope.totalItemInPage = ($scope.itemsPerPage * ($scope.currentPage - 1)) + data.data.length;
    });
  };

});

angular.module('xMember').controller('ModelsEditCtrl', function ($scope, $sce, $state, perfomerService, growl, performer, Upload, $timeout) {
  $scope.action = 'Edit';
  if (!performer.ccbill) {
    performer.ccbill = {
      formMonthSubscription: '',
      formYearlySubscription: '',
      formSinglePayment: ''
    };
  }
  $scope.performer = performer;
  $scope.idFile = null;

  //load image
  if (performer.idImg1) {
    perfomerService.getIdImage(performer.idImg1)
      .then(function (resp) {
        $scope.idFile = resp;
      });
  }

  $scope.submitForm = function (form, file) {
    $scope.submitted = true;
    if (!$scope.performer.username) {
      return alert('Username is required')
    }
    if (form.$valid) {
      if (file != null && typeof file.size != 'undefined') {
        file.upload = Upload.upload({
          url: '/api/v1/performers/' + $scope.performer._id,
          method: 'PUT',
          data: $scope.performer,
          file: file
        });
        file.upload.then(function (response) {
          $timeout(function () {
            if (response) {
              growl.success("Updated successfully", {
                ttl: 3000
              });
              $state.go('models');
            }
          });
        }, function (response) {
          if (response.status > 0)
            $scope.errorMsg = response.status + ': ' + response.data;
        }, function (evt) {
          file.progress = Math.min(100, parseInt(100.0 *
            evt.loaded / evt.total));
        });
      } else {
        Upload.upload({
          url: '/api/v1/performers/' + $scope.performer._id,
          method: 'PUT',
          data: $scope.performer,
          file: file
        }).then(function (res) {
          if (res) {
            growl.success("Updated successfully", {
              ttl: 3000
            });
            $state.go('models');
          }
        })
        .catch(err => {
          growl.error(err.data && err.data.message ? err.data.message : 'Something went wrong')
        })
      }

    }
  }

  $state.current['data'] = {
    pageTitle: $scope.performer.name,
    metaKeywords: $scope.performer.description,
    metaDescription: $scope.performer.description
  }
});

angular.module('xMember').controller('ModelsAddCtrl', function ($scope, $sce, $state, perfomerService, growl, Upload, $timeout) {
  $scope.action = 'Add';
  $scope.performer = {
    name: '',
    username: '',
    sex: 'male',
    imageThumbPath: null,
    imageFullPath: null,
    price: '',
    description: '',
    sort: 0,
    status: 'active',
    showHome: true,
    ccbill: {
      formMonthSubscription: '',
      formYearlySubscription: '',
      formSinglePayment: '',
      subAccount: ''
    }
  };
  $scope.submitForm = function (form, file) {
    $scope.submitted = true;
    if (!$scope.performer.username) {
      return alert('Username is required')
    }
    if (form.$valid) {
      if (file != null && typeof file.size != 'undefined') {
        file.upload = Upload.upload({
          url: '/api/v1/performers',
          method: 'POST',
          data: $scope.performer,
          file: file
        });
        file.upload.then(function (response) {
          $timeout(function () {
            if (response) {
              growl.success("Added successfully", {
                ttl: 3000
              });
              $state.go('models');
            }
          });
        }, function (response) {
          if (response.status > 0)
            $scope.errorMsg = response.status + ': ' + response.data;
        }, function (evt) {
          file.progress = Math.min(100, parseInt(100.0 *
            evt.loaded / evt.total));
        });
      } else {
        Upload.upload({
          url: '/api/v1/performers',
          method: 'POST',
          data: $scope.performer,
          file: file
        }).then(function (res) {
          if (res) {
            growl.success("Added successfully", {
              ttl: 3000
            });
            $state.go('models');
          }
        })
      }
    }
  }

  $state.current['data'] = {
    pageTitle: $scope.performer.name,
    metaKeywords: $scope.performer.description,
    metaDescription: $scope.performer.description
  }
});


angular.module('xMember').controller('ModelsViewCtrl', function ($scope, $sce, $state, performer) {
  $scope.performer = performer;
  $state.current['data'] = {
    pageTitle: $scope.performer.name,
    metaKeywords: $scope.performer.description,
    metaDescription: $scope.performer.description
  }
});
