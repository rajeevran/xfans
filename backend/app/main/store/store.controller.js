angular
  .module('xMember')
  .controller('StoreCtrl', function($scope, $state, growl, productService, products, productCount) {
    $scope.products = products;
    $scope.query = {
      keyword: '',
      sort: 'createdAt',
      order: -1
    };
    //Set up sort Gird
    $(function() {
      $('.dataTables_filter input').keyup(function(e) {
        if (e.keyCode == 13) {
          $scope.pageChanged(1);
        }
      });
      $('.table-scrollable th').on('click', function() {
        var indexClick = $(this).index();
        $('.table-scrollable th').each(function(index) {
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

    $scope.maxSize = 10;
    $scope.totalItems = productCount;
    $scope.currentPage = 1;
    $scope.itemsPerPage = 10;
    $scope.totalItemInPage = products.length;
    $scope.delete = function(product, index) {
      productService.delete(product._id).then(function(res) {
        if (res) {
          $scope.products.splice(index, true);
          $scope.totalItems = $scope.totalItems - 1;
          $scope.totalItemInPage = $scope.totalItemInPage - 1;
          growl.success('Deleted successfully', {
            ttl: 3000
          });
        }
      });
    };

    $scope.pageChanged = function(currentPage) {
      productService.countAll('undefined', 'undefined', $scope.query).then(function(res) {
        $scope.totalItems = res.count;
      });
      productService.findAll($scope.itemsPerPage, currentPage - 1, $scope.query).then(function(data) {
        $scope.products = data.data;
        $scope.totalItemInPage = $scope.totalItemInPage * ($scope.currentPage - 1) + data.data.length;
      });
    };
  });

angular
  .module('xMember')
  .controller('StoreEditCtrl', function(
    $scope,
    $sce,
    $state,
    productService,
    perfomerService,
    growl,
    product,
    Upload,
    $timeout,
    categories
  ) {
    $scope.action = 'Edit';
    $scope.product = product;
    $scope.categories = categories;
    $scope.toggleCategory = function(catId) {
      if (!$scope.product.categoryIds) {
        $scope.product.categoryIds = [];
      }

      if ($scope.product.categoryIds.indexOf(catId) > -1) {
        _.remove($scope.product.categoryIds, function(id) {
          return id === catId;
        });
      } else {
        $scope.product.categoryIds.push(catId);
      }
    };

    $scope.select2Options = {
      multiple: false,
      simple_tags: true
    };
    $scope.performers = [];
    perfomerService.search().then(resp => ($scope.performers = resp.items));

    $scope.submitForm = function(form, file) {
      $scope.submitted = true;
      if (form.$valid) {
        if (!$scope.product.categoryIds || !$scope.product.categoryIds.length) {
          return growl.error('Please select a category!', {
            ttl: 5000
          });
        }
        if (file != null && typeof file.size != 'undefined') {
          file.upload = Upload.upload({
            url: '/api/v1/products/' + $scope.product._id,
            method: 'PUT',
            data: $scope.product,
            file: file
          });
          file.upload.then(
            function(response) {
              $timeout(function() {
                if (response) {
                  growl.success('Updated successfully', {
                    ttl: 3000
                  });
                  $state.go('store');
                }
              });
            },
            function(response) {
              if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
            },
            function(evt) {
              file.progress = Math.min(100, parseInt((100.0 * evt.loaded) / evt.total));
            }
          );
        } else {
          Upload.upload({
            url: '/api/v1/products/' + $scope.product._id,
            method: 'PUT',
            data: $scope.product,
            file: file
          }).then(function(res) {
            if (res) {
              growl.success('Updated successfully', {
                ttl: 3000
              });
              $state.go('store');
            }
          });
        }
      }
    };

    $state.current['data'] = {
      pageTitle: $scope.product.name,
      metaKeywords: $scope.product.description,
      metaDescription: $scope.product.description
    };
  });

angular
  .module('xMember')
  .controller('StoreAddCtrl', function(
    $scope,
    $sce,
    $state,
    productService,
    perfomerService,
    growl,
    Upload,
    $timeout,
    categories
  ) {
    $scope.action = 'Add';
    $scope.product = {
      name: '',
      imageThumbPath: null,
      imageFullPath: null,
      price: '',
      description: '',
      sort: 0,
      status: 'active',
      categoryIds: []
    };
    $scope.categories = categories;
    $scope.select2Options = {
      multiple: false,
      simple_tags: true
    };
    $scope.performers = [];
    perfomerService.search().then(resp => ($scope.performers = resp.items));

    $scope.toggleCategory = function(catId) {
      if ($scope.product.categoryIds.indexOf(catId) > -1) {
        _.remove($scope.product.categoryIds, function(id) {
          return id === catId;
        });
      } else {
        $scope.product.categoryIds.push(catId);
      }
    };

    $scope.submitForm = function(form, file) {
      $scope.submitted = true;
      if (form.$valid) {
        if (!$scope.product.categoryIds || !$scope.product.categoryIds.length) {
          return growl.error('Please select a category!', {
            ttl: 5000
          });
        }
        if (file != null && typeof file.size != 'undefined') {
          file.upload = Upload.upload({
            url: '/api/v1/products',
            method: 'POST',
            data: $scope.product,
            file: file
          });
          file.upload.then(
            function(response) {
              $timeout(function() {
                if (response) {
                  growl.success('Added successfully', {
                    ttl: 3000
                  });
                  $state.go('store');
                }
              });
            },
            function(response) {
              if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
            },
            function(evt) {
              file.progress = Math.min(100, parseInt((100.0 * evt.loaded) / evt.total));
            }
          );
        } else {
          Upload.upload({
            url: '/api/v1/products',
            method: 'POST',
            data: $scope.product,
            file: file
          }).then(function(res) {
            growl.success('Added successfully', {
              ttl: 3000
            });
            $state.go('store');
          });
        }
      }
    };

    $state.current['data'] = {
      pageTitle: $scope.product.name,
      metaKeywords: $scope.product.description,
      metaDescription: $scope.product.description
    };
  });

angular.module('xMember').controller('StoreViewCtrl', function($scope, $sce, $state, product) {
  $scope.product = product;
  $state.current['data'] = {
    pageTitle: $scope.product.name,
    metaKeywords: $scope.product.description,
    metaDescription: $scope.product.description
  };
});
