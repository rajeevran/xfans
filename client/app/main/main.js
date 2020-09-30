'use strict';

angular.module('xMember')
  .config(function($stateProvider) {
    $stateProvider.state('landing', {
      url: '/',
      templateUrl: 'app/account/dashboard.html',
      data: {
        pageTitle: 'Signup',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {

      }
    });

    $stateProvider.state('home', {
      url: '/home',
      templateUrl: 'app/main/home/index.html',
      controller: 'HomeCtrl',
      data: {
        pageTitle: 'Home',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {

      }
    });
    $stateProvider.state('contact', {
      url: '/contact',
      templateUrl: 'app/main/contact/index.html',
      controller: 'ContactCtrl',
      data: {
        pageTitle: 'Contact',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {

      }
    });
    $stateProvider.state('cart', {
      url: '/cart',
      templateUrl: 'app/main/store/cart.html',
      controller: 'CartCtrl',
      data: {
        pageTitle: 'Cart',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {

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
      resolve: {

      }
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
      resolve: {

      }
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
      resolve: {
       me: function(userService){
         return userService.get().then(function(data){
            return data.data;
          });
        },
       videos: function(saveVideoService){
         return saveVideoService.findAll('favorites',6,0).then(function(data){
            return data.data;
          });
        },
        videoCount: function(saveVideoService){
         return saveVideoService.findAll('favorites').then(function(data){
            return data.data;
          });
        }
      }
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
      resolve: {
        me: function(userService){
         return userService.get().then(function(data){
            return data.data;
          });
        },
       videos: function(saveVideoService){
         return saveVideoService.findAll('watchlater',6,0).then(function(data){
            return data.data;
          });
        },
        videoCount: function(saveVideoService){
         return saveVideoService.findAll('watchlater').then(function(data){
            return data.data;
          });
        }
      }
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
      resolve: {
       me: function(userService){
         return userService.get().then(function(data){
            return data.data;
          });
        }
      }
    });

    $stateProvider.state('purchased', {
      url: '/purchased-items',
      templateUrl: 'app/main/profile/purchased.html',
      controller: 'PurchasedCtrl',
      data: {
        pageTitle: 'Purchased Items',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {

      }
    });
    $stateProvider.state('updateVip', {
      url: '/update-vip',
      templateUrl: 'app/main/profile/update_vip.html',
      controller: 'UpdateVipCtrl',
      data: {
        pageTitle: 'Upgrade Plan',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {
       packages: function(memberPackageService){
          return memberPackageService.findAll().then(function(data){
            return data.data;
          });
        }
      }
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
      resolve: {
       orders: function(orderService,Auth){
         return orderService.findAll(16,0).then(function(data){
            return data.data;
          });
        },
        orderCount: function(orderService,Auth){

          return orderService.findAll().then(function(data){
            return data.data;
          });

        }
      }
    });

    $stateProvider.state('pageView', {
      url: '/pages/:alias',
      templateUrl: 'app/main/page/view.html',
      controller: 'PageViewCtrl',
      resolve: {
        page: function(pageService, $stateParams){
          return pageService.find($stateParams.alias).then(function(data){
            return data.data;
          });
        }
      }
    });

    $stateProvider.state('buySuccess', {
      url: '/buy-success',
      templateUrl: 'app/main/store/buy_success.html',
      controller: 'BuySuccessCtrl',
      resolve: {

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
        models: function(perfomerService){
          return perfomerService.findAll({
            limit: 12,
            offset: 0,
            sortField: 'sort',
            orderType: 1
          }).then(function(data){
            return data.data;
          });
        },
        modelsCount: function(perfomerService){
          return perfomerService.findAll({
            limit: 'undefined',
            offset: 'undefined'
          }).then(function(data){
            return data.data;
          });
        }
      }
    });

    $stateProvider.state('modelView', {
      url: '/:id',
      templateUrl: 'app/main/models/view.html',
      controller: 'ModelsViewCtrl',
      resolve: {
        perfomer: function(perfomerService, $stateParams){
          return perfomerService.find($stateParams.id).then(function(data){
            return data.data;
          });
        },
        albums(photoService, $stateParams) {
          return photoService.findAlbums($stateParams.id);
        },
        me: function(Auth, userService){
          if (Auth.isLoggedIn()) {
            return userService.get().then(function(data){
              return data.data;
            });
          }
          return null
        }
      }
    });

    $stateProvider.state('store', {
      url: '/store?categoryId',
      templateUrl: 'app/main/store/index.html',
      controller: 'StoreCtrl',
      data: {
        pageTitle: 'Store',
        metaKeywords: '',
        metaDescription: 'sex, sex tour, video'
      },
      resolve: {
        products: function(productService, $stateParams){
          return productService.findAll(12,0, {
            categoryId: $stateParams.categoryId || ''
          }).then(function(data){
            return data.data;
          });
        },
        productCount: function(productService, $stateParams){
          return productService.countAll({
            categoryId: $stateParams.categoryId || ''
          });
        },
        categories: function(productService) {
          return productService.findCategories();
        }
      }
    });

    $stateProvider.state('storeView', {
      url: '/store/:alias/:id',
      templateUrl: 'app/main/store/view.html',
      controller: 'StoreViewCtrl',
      resolve: {
        product: function(productService, $stateParams){
          return productService.find($stateParams.id).then(function(data){
            return data.data;
          });
        },
        products: function(productService,$stateParams){
          return productService.findOther($stateParams.id,8).then(function(data){
            return data.data;
          });
        },

      }
    });

  });
