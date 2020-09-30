'use strict';

angular.module('xMember').config(function($stateProvider) {
  $stateProvider.state('main', {
    templateUrl: 'app/main/main.html',
    controller: function($scope, $state) {
      $scope.breadcrumb = $state.current.breadcrumb;
    }
  });

  $stateProvider.state('backend', {
    url: '/',
    templateUrl: 'app/account/login/login.html',
    controller: 'LoginController',
    data: {
      pageTitle: 'Login',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      user: function(Auth) {
        return Auth.getCurrentUser(null);
      }
    }
  });

  $stateProvider.state('logout', {
    url: '/logout?referrer',
    referrer: 'main',
    template: '',
    controller: function($state, Auth) {
      var referrer = $state.params.referrer || $state.current.referrer || 'main';
      Auth.logout();
      $state.go('backend');
    }
  });

  $stateProvider.state('dashboard', {
    url: '/dashboard',
    templateUrl: 'app/main/dashboard/index.html',
    controller: 'DashBoardCrtl',
    data: {
      pageTitle: 'Dashboard',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      videoCount: videoCount,
      performerCount: function(perfomerService) {
        return perfomerService.findAll().then(function(data) {
          return data.data;
        });
      },
      userCount: function(userService) {
        return userService.findAll().then(function(data) {
          return data.data;
        });
      },
      orderCount: function(orderService) {
        return orderService.findAll().then(function(data) {
          return data.data;
        });
      },
      productCount: function(productService) {
        return productService.countAll();
      },
      albumCount: function(albumService) {
        return albumService.countAll();
      }
    }
  });

  $stateProvider.state('profile', {
    url: '/account-information',
    templateUrl: 'app/main/profile/index.html',
    controller: 'ProfileCtrl',
    data: {
      pageTitle: 'Account Information',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {}
  });

  $stateProvider.state('notifications', {
    url: '/notifications',
    templateUrl: 'app/main/profile/notifications.html',
    controller: 'NotificationCtrl',
    data: {
      pageTitle: 'Notifications',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {}
  });

  $stateProvider.state('favorites', {
    url: '/favorites',
    templateUrl: 'app/main/profile/favorite.html',
    controller: 'FavoriteCtrl',
    data: {
      pageTitle: 'Favorites Video',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {}
  });

  $stateProvider.state('watchLater', {
    url: '/watch-later',
    templateUrl: 'app/main/profile/watch_later.html',
    controller: 'WatchLaterCtrl',
    data: {
      pageTitle: 'Watch Later Video',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {}
  });

  $stateProvider.state('downloaded', {
    url: '/downloaded-items',
    templateUrl: 'app/main/profile/downloaded.html',
    controller: 'DownloadedCtrl',
    data: {
      pageTitle: 'Downloaded Video',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {}
  });

  $stateProvider.state('paymentHistory', {
    url: '/payment-history',
    templateUrl: 'app/main/profile/payment_history.html',
    controller: 'PaymentHistoryCtrl',
    data: {
      pageTitle: 'Payment History',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {}
  });

  $stateProvider.state('movies', {
    url: '/movies?type',
    templateUrl: 'app/main/movies/index.html',
    controller: 'VideoCtrl',
    data: {
      pageTitle: 'Movies',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('models', {
    url: '/models',
    templateUrl: 'app/main/models/index.html',
    controller: 'ModelsCtrl',
    data: {
      pageTitle: 'Models',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      performers: function(perfomerService) {
        return perfomerService.findAll(10, 0).then(function(data) {
          return data.data;
        });
      },
      performerCount: function(perfomerService) {
        return perfomerService.findAll().then(function(data) {
          return data.data;
        });
      }
    }
  });

  $stateProvider.state('modelsEdit', {
    url: '/models/edit/:id',
    templateUrl: 'app/main/models/form.html',
    controller: 'ModelsEditCtrl',
    resolve: {
      performer: function(perfomerService, $stateParams) {
        return perfomerService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    },
    data: {
      pageTitle: 'Edit model',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('modelsAdd', {
    url: '/models/add',
    templateUrl: 'app/main/models/form.html',
    controller: 'ModelsAddCtrl',
    resolve: {},
    data: {
      pageTitle: 'Add new model',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('modelsView', {
    url: '/models/:id',
    templateUrl: 'app/main/models/view.html',
    controller: 'ModelsViewCtrl',
    resolve: {
      performer: function(perfomerService, $stateParams) {
        return perfomerService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    },
    data: {
      pageTitle: 'Model',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('store', {
    url: '/store',
    templateUrl: 'app/main/store/index.html',
    controller: 'StoreCtrl',
    data: {
      pageTitle: 'Store',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      products: function(productService) {
        return productService.findAll(10, 0).then(function(data) {
          return data.data;
        });
      },
      productCount: function(productService) {
        return productService.countAll().then(function(data) {
          return data.count;
        });
      }
    }
  });

  $stateProvider.state('storeEdit', {
    url: '/store/edit/:id',
    templateUrl: 'app/main/store/form.html',
    controller: 'StoreEditCtrl',
    resolve: {
      product: function(productService, $stateParams) {
        return productService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      },
      categories: function(productCategoryService) {
        return productCategoryService.find().then(function(resp) {
          return resp.items;
        });
      }
    },
    data: {
      pageTitle: 'Edit product',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('storeAdd', {
    url: '/store/add',
    templateUrl: 'app/main/store/form.html',
    controller: 'StoreAddCtrl',
    resolve: {
      categories: function(productCategoryService) {
        return productCategoryService.find().then(function(resp) {
          return resp.items;
        });
      }
    },
    data: {
      pageTitle: 'Add new product',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('storeView', {
    url: '/store/:id',
    templateUrl: 'app/main/store/view.html',
    controller: 'StoreViewCtrl',
    resolve: {
      product: function(productService, $stateParams) {
        return productService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    }
  });

  //Start CURD User
  $stateProvider.state('user', {
    url: '/user',
    templateUrl: 'app/main/user/index.html',
    controller: 'UserCtrl',
    data: {
      pageTitle: 'User',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      users: function(userService) {
        return userService.findAll(10, 0).then(function(data) {
          return data.data;
        });
      },
      userCount: function(userService) {
        return userService.findAll().then(function(data) {
          return data.data;
        });
      }
    }
  });

  $stateProvider.state('userEdit', {
    url: '/user/edit/:id',
    templateUrl: 'app/main/user/form.html',
    controller: 'UserEditCtrl',
    resolve: {
      user: function(userService, $stateParams) {
        return userService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    },
    data: {
      pageTitle: 'User edit',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('userAdd', {
    url: '/user/add',
    templateUrl: 'app/main/user/form.html',
    controller: 'UserAddCtrl',
    resolve: {},
    data: {
      pageTitle: 'Add user',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('userView', {
    url: '/user/:id',
    templateUrl: 'app/main/user/view.html',
    controller: 'UserViewCtrl',
    resolve: {
      user: function(userService, $stateParams) {
        return userService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    }
  });
  //End CURD User

  $stateProvider.state('videoEdit', {
    url: '/video/edit/:id',
    templateUrl: 'app/main/movies/form.html',
    controller: 'VideoEditCtrl',
    resolve: {
      performers: getPerformers,
      video: function(videoService, $stateParams) {
        return videoService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      },
      categories: getCategories,
      pathFiles: getPathFiles
      //photos: getAllPhotos,
    },
    data: {
      pageTitle: 'Edit video',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('videoAdd', {
    url: '/video/add',
    templateUrl: 'app/main/movies/form.html',
    controller: 'VideoAddCtrl',
    resolve: {
      performers: getPerformers,
      categories: getCategories,
      pathFiles: getPathFiles
      //photos: getAllPhotos
    },
    data: {
      pageTitle: 'Add video',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('videoView', {
    url: '/video/:id',
    templateUrl: 'app/main/movies/view.html',
    controller: 'VideoViewCtrl',
    resolve: {
      video: function(videoService, $stateParams) {
        return videoService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    }
  });

  $stateProvider.state('videoBulkUpload', {
    url: '/video-bulk-upload',
    templateUrl: 'app/main/movies/bulk-upload.html',
    controller: 'VideoBulkUploadCtrl'
  });

  //Photo
  $stateProvider.state('photo', {
    url: '/photo',
    templateUrl: 'app/main/photo/index.html',
    controller: 'PhotoCtrl',
    data: {
      pageTitle: 'Photo',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      photos: function(photoService) {
        return photoService.findAll(10, 0).then(function(data) {
          return data.data;
        });
      },
      photoCount: function(photoService) {
        return photoService.findAll().then(function(data) {
          return data.data;
        });
      }
    }
  });

  $stateProvider.state('photoEdit', {
    url: '/photo/edit/:id',
    templateUrl: 'app/main/photo/form.html',
    controller: 'PhotoEditCtrl',
    resolve: {
      performers: function(perfomerService) {
        return perfomerService.findAll(200, 0).then(function(data) {
          return data.data;
        });
      },
      photo: function(photoService, $stateParams) {
        return photoService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    },
    data: {
      pageTitle: 'Edit photo',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('photoAdd', {
    url: '/photo/add',
    templateUrl: 'app/main/photo/form.html',
    controller: 'PhotoAddCtrl',
    resolve: {
      performers: function(perfomerService) {
        return perfomerService.findAll(200, 0).then(function(data) {
          return data.data;
        });
      }
    },
    data: {
      pageTitle: 'Add photo',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('photoBulkUpload', {
    url: '/photo/bulk-upload',
    templateUrl: 'app/main/photo/bulk-upload.html',
    controller: 'PhotoBulkUploadCtrl'
  });

  $stateProvider.state('photoView', {
    url: '/photo/:id',
    templateUrl: 'app/main/photo/view.html',
    controller: 'PhotoViewCtrl',
    resolve: {
      photo: function(photoService, $stateParams) {
        return photoService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    }
  });

  //Banner
  $stateProvider.state('banner', {
    url: '/banner',
    templateUrl: 'app/main/banner/index.html',
    controller: 'BannerCtrl',
    data: {
      pageTitle: 'Banner',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      banners: function(bannerService) {
        return bannerService.findAll(10, 0).then(function(data) {
          return data.data;
        });
      },
      bannerCount: function(bannerService) {
        return bannerService.findAll().then(function(data) {
          return data.data;
        });
      }
    }
  });

  $stateProvider.state('bannerEdit', {
    url: '/banner/edit/:id',
    templateUrl: 'app/main/banner/form.html',
    controller: 'BannerEditCtrl',
    resolve: {
      banner: function(bannerService, $stateParams) {
        return bannerService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    },
    data: {
      pageTitle: 'Banner edit',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('bannerAdd', {
    url: '/banner/add',
    templateUrl: 'app/main/banner/form.html',
    controller: 'BannerAddCtrl',
    resolve: {},
    data: {
      pageTitle: 'Add banner',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('bannerView', {
    url: '/banner/:id',
    templateUrl: 'app/main/banner/view.html',
    controller: 'BannerViewCtrl',
    resolve: {
      banner: function(bannerService, $stateParams) {
        return bannerService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    }
  });

  //MemberShipPackage
  $stateProvider.state('memberShipPackage', {
    url: '/memberShipPackage',
    templateUrl: 'app/main/memberShipPackage/index.html',
    controller: 'MemberShipPackageCtrl',
    data: {
      pageTitle: 'MemberShipPackage',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      memberShipPackages: function(memberShipPackageService) {
        return memberShipPackageService.findAll(10, 0).then(function(data) {
          return data.data;
        });
      },
      memberShipPackageCount: function(memberShipPackageService) {
        return memberShipPackageService.findAll().then(function(data) {
          return data.data;
        });
      }
    }
  });

  $stateProvider.state('memberShipPackageEdit', {
    url: '/memberShipPackage/edit/:id',
    templateUrl: 'app/main/memberShipPackage/form.html',
    controller: 'MemberShipPackageEditCtrl',
    resolve: {
      memberShipPackage: function(memberShipPackageService, $stateParams) {
        return memberShipPackageService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    },
    data: {
      pageTitle: 'Edit membership package',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('memberShipPackageAdd', {
    url: '/memberShipPackage/add',
    templateUrl: 'app/main/memberShipPackage/form.html',
    controller: 'MemberShipPackageAddCtrl',
    resolve: {},
    data: {
      pageTitle: 'Add new membership package',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('memberShipPackageView', {
    url: '/memberShipPackage/:id',
    templateUrl: 'app/main/memberShipPackage/view.html',
    controller: 'MemberShipPackageViewCtrl',
    resolve: {
      memberShipPackage: function(memberShipPackageService, $stateParams) {
        return memberShipPackageService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    }
  });

  //Earning
  $stateProvider.state('earning', {
    url: '/earning',
    templateUrl: 'app/main/earning/index.html',
    controller: 'EarningCtrl',
    resolve: {}
  });

  //subscribers
  $stateProvider.state('subscriber', {
    url: '/subscriber',
    templateUrl: 'app/main/subscriber/index.html',
    controller: 'SubscriberCtrl',
    resolve: {}
  });
  //add subscrition
  $stateProvider.state('subscriberCreate', {
    url: '/subscriber/add',
    templateUrl: 'app/main/subscriber/form.html',
    controller: 'SubscriberCreateCtrl',
    resolve: {}
  });

  //Page
  $stateProvider.state('page', {
    url: '/page',
    templateUrl: 'app/main/page/index.html',
    controller: 'PageCtrl',
    data: {
      pageTitle: 'Page',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      pages: function(pageService) {
        return pageService.findAll(10, 0).then(function(data) {
          return data.data;
        });
      },
      pageCount: function(pageService) {
        return pageService.findAll().then(function(data) {
          return data.data;
        });
      }
    }
  });

  $stateProvider.state('pageEdit', {
    url: '/page/edit/:id',
    templateUrl: 'app/main/page/form.html',
    controller: 'PageEditCtrl',
    resolve: {
      page: function(pageService, $stateParams) {
        return pageService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    },
    data: {
      pageTitle: 'Page edit',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('pageAdd', {
    url: '/page/add',
    templateUrl: 'app/main/page/form.html',
    controller: 'PageAddCtrl',
    resolve: {},
    data: {
      pageTitle: 'Add page',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('pageView', {
    url: '/page/:id',
    templateUrl: 'app/main/page/view.html',
    controller: 'PageViewCtrl',
    resolve: {
      page: function(pageService, $stateParams) {
        return pageService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    }
  });

  //Setting
  $stateProvider.state('setting', {
    url: '/setting',
    templateUrl: 'app/main/setting/index.html',
    controller: 'SettingCtrl',
    data: {
      pageTitle: 'Settings',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      settings: function(settingService) {
        return settingService.findAll(10, 0).then(function(data) {
          return data.data;
        });
      },
      settingCount: function(settingService) {
        return settingService.findAll().then(function(data) {
          return data.data;
        });
      }
    }
  });

  $stateProvider.state('settingEdit', {
    url: '/setting/edit/:id',
    templateUrl: 'app/main/setting/form.html',
    controller: 'SettingEditCtrl',
    resolve: {
      setting: function(settingService, $stateParams) {
        return settingService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    },
    data: {
      pageTitle: 'Edit settings',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('settingAdd', {
    url: '/setting/add',
    templateUrl: 'app/main/setting/form.html',
    controller: 'SettingAddCtrl',
    resolve: {}
  });

  $stateProvider.state('settingView', {
    url: '/setting/:id',
    templateUrl: 'app/main/setting/view.html',
    controller: 'SettingViewCtrl',
    resolve: {
      setting: function(settingService, $stateParams) {
        return settingService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    }
  });

  //Order
  $stateProvider.state('order', {
    url: '/order',
    templateUrl: 'app/main/order/index.html',
    controller: 'OrderCtrl',
    data: {
      pageTitle: 'Order',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    },
    resolve: {
      orders: function(orderService) {
        return orderService.search().then(function(data) {
          return data.data;
        });
      },
      models: getPerformers
    }
  });

  $stateProvider.state('orderEdit', {
    url: '/order/edit/:id',
    templateUrl: 'app/main/order/form.html',
    controller: 'OrderEditCtrl',
    resolve: {
      order: function(orderService, $stateParams) {
        return orderService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    },
    data: {
      pageTitle: 'Order edit',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('orderAdd', {
    url: '/order/add',
    templateUrl: 'app/main/order/form.html',
    controller: 'OrderAddCtrl',
    resolve: {},
    data: {
      pageTitle: 'Add order',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  $stateProvider.state('orderView', {
    url: '/order/:id',
    templateUrl: 'app/main/order/view.html',
    controller: 'OrderViewCtrl',
    resolve: {
      order: function(orderService, $stateParams) {
        return orderService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      }
    },
    data: {
      pageTitle: 'Order detail',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });
  $stateProvider.state('payout', {
    url: '/payouts',
    templateUrl: 'app/main/request-payout/index.html',
    controller: 'PayoutListCtrl',
    resolve: {},
    data: {
      pageTitle: 'Requests payout',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });
  $stateProvider.state('payoutEdit', {
    url: '/payouts/:id',
    templateUrl: 'app/main/request-payout/form.html',
    controller: 'PayoutEditCtrl',
    resolve: {
      request: function(payoutService, $stateParams) {
        return payoutService.find($stateParams.id).then(function(data) {
          return data.data;
        });
      },
      comments: function(commentService, $stateParams) {
        return commentService.findAllByRequestPayout({ payoutId: $stateParams.id, take: 100 }).then(function(data) {
          return data.items;
        });
      }
    },
    data: {
      pageTitle: 'Edit Request payout',
      metaKeywords: '',
      metaDescription: 'sex, sex tour, video'
    }
  });

  function getPerformers(perfomerService) {
    return perfomerService.findAll(500, 0).then(function(data) {
      return data.data;
    });
  }

  function getCategories(categoriesService) {
    return categoriesService.findAll();
  }

  function videoCount(videoService) {
    return videoService.findAll().then(function(data) {
      return data.data.total;
    });
  }

  function getPathFiles(videoService) {
    return videoService.getPathFiles().then(function(data) {
      return data.data;
    });
  }

  function getAllPhotos(photoService) {
    return photoService.getAll().then(function(data) {
      return data.data;
    });
  }
});
