'use strict';
angular.module('xMember').controller('ModelsCtrl', function($scope, $state, perfomerService, models, modelsCount) {
  $scope.models = models;
  $scope.maxSize = 10;
  $scope.totalItems = modelsCount;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 12;
  $scope.filter = {};
  $scope.isHided = false;

  $scope.updateFilter = function() {
    $scope.models = [];
    window.setTimeout(() => {
      $scope.pageChanged(1);
    }, 500);
  };
  $scope.filter = function(sort) {
    $scope.pageChanged();
    perfomerService
      .search({
        take: 12,
        sort: sort
      })
      .then(function(data) {
        $scope.models = data.items;
        $scope.totalItems = data.count;
      });
  };
  $scope.pageChanged = function(currentPage) {
    perfomerService
      .findAll({
        limit: $scope.itemsPerPage,
        offset: currentPage - 1,
        sortField: 'sort',
        orderType: 1,
        keyword: $scope.filter.keyword,
        size: $scope.filter.size,
        sex: $scope.filter.sex
      })
      .then(function(data) {
        $scope.models = data.data;
        $scope.totalItems = data.data.length;
      });
  };

  // // find subsciptions counting
  // angular.forEach($scope.models, function(model) {
  //   perfomerService.subsciptionsCount(model._id).then(function(data){
  //     model.subsciptionsCount = data;
  //   })
  // });
});

angular
  .module('xMember')
  .controller('ModelsViewCtrl', function(
    $scope,
    Lightbox,
    Auth,
    $state,
    $sce,
    perfomer,
    albums,
    perfomerService,
    productService,
    videoService,
    ngCart,
    growl,
    $cookies,
    me
  ) {
    $(document).ready(function() {
      $('#welcome-Video').hover(function toggleControls() {
        if (this.hasAttribute('controls')) {
          this.removeAttribute('controls');
        } else {
          this.setAttribute('controls', 'controls');
        }
      });
      $('#welcome-Video1').hover(function toggleControls() {
        if (this.hasAttribute('controls')) {
          this.removeAttribute('controls');
        } else {
          this.setAttribute('controls', 'controls');
        }
      });
      $('.menutab a').click(function() {
        $('.tab-content .tab-pane').hide();
        var menu = $(this).attr('aria-controls');
        $('#' + menu).show();
      });
      $('#open-video-icon').click(function() {
        $('#open-video-sub').click();
      });
      $('#open-store-icon').click(function() {
        $('#open-store-sub').click();
      });
      $('#open-sale-video-icon').click(function() {
        $('#open-sale-video-sub').click();
      });
      $('#open-album-icon').click(function() {
        $('#open-album-sub').click();
      });
    });

    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    };
    $scope.tototalItems = ngCart.getTotalItems();
    $scope.$on('ngCart:itemAdded', function(event, data) {
      $scope.tototalItems = ngCart.getTotalItems();
    });
    $scope.$on('ngCart:itemRemoved', function(event, data) {
      $scope.tototalItems = ngCart.getTotalItems();
    });

    $scope.me = me;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.perfomer = perfomer;

    if ($scope.me && $scope.me.role === 'performer') {
      perfomerService
        .checkAllowViewProfile({
          objectId: me._id,
          userId: perfomer._id
        })
        .then(res => {
          $scope.isAllowed = res.allowed;
        });
        perfomerService
      .checkBlock({
        objectId: $scope.me._id,
        userId: $scope.perfomer._id
      })
      .then(resp => ($scope.blocked = resp.blocked));
    }

    if (localStorage.getItem('isFirst' + perfomer._id) !== '1') {
      $scope.autoPlay = 'autoplay';
      localStorage.setItem('isFirst' + perfomer._id, '1');
    } else {
      $scope.autoPlay = null;
    }

    //check subscribe
    if ($scope.isLoggedIn() && $scope.me) {
      perfomerService.checkSubscribe($scope.perfomer._id).then(function(res) {
        $scope.checkSubscribe = res.subscribed;
        if ($scope.me._id === $scope.perfomer._id) {
          $scope.checkSubscribe = 1;
          $scope.isHided = true;
        } else if (!$scope.me._id) {
          $scope.checkSubscribe = 0;
          $scope.isHided = false;
        }
      });
    }
    //change grid video to lines
    $scope.listStyle = 'grid';
    $scope.changeStyle = function(val) {
      $scope.listStyle = val;
    };
    $(window).resize(function() {
      var width = $(window).width();
      if (width < 768) {
        $scope.listStyle = 'line';
        $scope.$apply();
      } else {
        $scope.listStyle = 'grid';
        $scope.$apply();
      }
    });

    if (albums) {
      albums.map(function(album) {
        if (album.photos && album.photos.length > 1) {
          album.smallPhotos = album.photos.slice(1, album.photos.length);
        }
      });
    }
    $scope.albums = albums;
    $scope.maxSize = 5;
    $scope.itemsPerPage = 12;
    $scope.maxSize = 5;
    $scope.totalItems = 0;
    $scope.totalItems1 = 0;
    $scope.totalItems3 = 0;
    $scope.totalItems4 = 0;
    $scope.currentPage = 1;
    $scope.currentPage1 = 1;
    $scope.canLoadMore = false;
    $scope.ispagnation = false;
    $scope.sort = 'newest';
    $scope.videos = [];
    $scope.saleVideos = [];
    $scope.queryVideos = function() {
      $scope.loading = true;
      videoService
        .search({
          performerId: perfomer._id,
          isSaleVideo: false,
          page: $scope.currentPage,
          take: $scope.itemsPerPage,
          status: 'active'
        })
        .then(function(data) {
          $scope.loading = false;
          $scope.videos = $scope.videos.concat(data.items);
          $scope.totalItems3 = data.count;
          $scope.canLoadMore = data.count > $scope.itemsPerPage * $scope.currentPage;
        });
      videoService
        .search({
          performerId: perfomer._id,
          isSaleVideo: true,
          page: $scope.currentPage,
          take: $scope.itemsPerPage,
          status: 'active'
        })
        .then(function(data) {
          $scope.saleVideos = $scope.saleVideos.concat(data.items);
          $scope.totalItems4 = data.count;
        });
    };
    $scope.queryVideos();
    // use when sort query
    $scope.updateQueryVideos = function(sort, page) {
      $scope.sort = sort;
      $scope.currentPage = page;
      $scope.videos = [];
      $scope.loading = true;
      $scope.ispagnation = true;
      videoService
        .search({
          performerId: perfomer._id,
          isSaleVideo: false,
          page: page,
          take: $scope.itemsPerPage,
          sort: sort,
          status: 'active'
        })
        .then(function(data) {
          $scope.loading = false;
          $scope.videos = data.items;
          $scope.totalItems = data.count;
        });
    };

    $scope.updateQuerySaleVideos = function(sort, page) {
      $scope.sort = sort;
      $scope.currentPage1 = page;
      $scope.saleVideos = [];
      $scope.loading1 = true;
      $scope.ispagnation = true;
      videoService
        .search({
          performerId: perfomer._id,
          isSaleVideo: true,
          page: page,
          take: $scope.itemsPerPage,
          sort: sort,
          status: 'active'
        })
        .then(function(data) {
          $scope.loading1 = false;
          $scope.saleVideos = data.items;
          $scope.totalItems1 = data.count;
        });
    };

    // load more video on scroll
    $(window).scroll(function() {
      if (
        $(window).scrollTop() > $(document).height() - $(window).height() - 30 &&
        !$scope.loading &&
        $scope.canLoadMore
      ) {
        $scope.currentPage += 1;
        $scope.queryVideos();
      }
    });

    $scope.loadMore = function() {
      if ($scope.canLoadMore) {
        $scope.currentPage += 1;
        $scope.queryVideos();
      }
    };

    $scope.openLightboxModal2 = function() {
      if (Auth.isLoggedIn() && Auth.getCurrentUser().isVip) {
        Lightbox.openModal([$scope.perfomer], 0);
      }
    };
    $scope.openLightboxModal = function(index) {
      if (Auth.isLoggedIn() && Auth.getCurrentUser().isVip) {
        Lightbox.openModal($scope.photos, index);
      }
    };
    //search
    $scope.search = {
      keyword: ''
    };
    $scope.searchModel = function(evt) {
      if (!$scope.search.keyword) {
        return;
      }
      if (evt && evt.keyCode !== 13) {
        return;
      }
      $state.go('search', {
        q: $scope.search.keyword,
        r: Math.random(),
        p: perfomer._id
      });
    };
    //buy product
    $scope.products = [];
    $scope.totalProducts = 0;
    $scope.productCurrentPage = 1;
    $scope.loadProducts = function(currentPage) {
      productService
        .search({
          page: currentPage,
          take: $scope.itemsPerPage,
          performerId: perfomer._id,
          status: 'active'
        })
        .then(function(data) {
          $scope.totalProducts = data.count;
          $scope.products = data.items;
        });
    };
    $scope.loadProducts($scope.productCurrentPage);

    $scope.quantity = 1;

    $scope.buy = function(product) {
      $scope.exist = false;
      angular.forEach(ngCart.getItems(), function(item) {
        if (item._id == product._id) {
          growl.error('You have previously added products', {
            ttl: 3000
          });
          $scope.exist = true;
          return false;
        }
      });
      if (!$scope.exist) {
        ngCart.addItem(product._id, product.name, product.price, 1, product);
        growl.success('Add product to cart successfully', {
          ttl: 3000
        });
      }
    };

    $state.current['data'] = {
      pageTitle: $scope.perfomer.name,
      metaKeywords: $scope.perfomer.description,
      metaDescription: $scope.perfomer.description
    };

    if ($scope.me && $scope.me._id.toString() !== $scope.perfomer._id.toString()) {
      perfomerService.addView($scope.perfomer._id);
    }

    $scope.tab = 'Videos';
    $scope.$on('$locationChangeSuccess', function() {
      if (window.location && window.location.hash) {
        $scope.tab = window.location.hash.slice(1);
      }
    });

    $scope.changeTab = function(tab) {
      $scope.tab = tab;
    };
  });
