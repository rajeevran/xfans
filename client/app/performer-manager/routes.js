'use strict';

angular.module('xMember')
.config(function($stateProvider) {
  $stateProvider.state('manager', {
    url: '/manager',
    templateUrl: 'app/performer-manager/layout.html',
    //controller: 'PerformerListPhotoCtrl',
    data: {
      pageTitle: 'Manager'
    }
    //TODO - add policy to check performer role here
  })
  .state('manager.profile', {
    url: '/profile',
    templateUrl: 'app/performer-manager/profile/edit.html',
    controller: 'PerformerProfileCtrl',
    data: {
      pageTitle: 'Update profile'
    },
    resolve: {
    }
    //TODO - add policy to check performer role here
  })
  .state('manager.stats', {
    url: '/stats',
    templateUrl: 'app/performer-manager/stats/stats.html',
    controller: 'PerformerStatsCtrl',
    data: {
      pageTitle: 'Statistic'
    },
    resolve: {
      currentUser(User) {
        return User.get().$promise;
      }

    }
    //TODO - add policy to check performer role here
  })
  .state('manager.password', {
    url: '/password',
    templateUrl: 'app/performer-manager/profile/password.html',
    controller: 'PerformerProfileCtrl',
    data: {
      pageTitle: 'Update password'
    },
    resolve: {
      currentUser(User) {
        return User.get().$promise;
      }
    }
    //TODO - add policy to check performer role here
  })
  .state('manager.videos', {
    url: '/videos',
    templateUrl: 'app/performer-manager/videos/list.html',
    controller: 'PerformerListVideoCtrl',
    data: {
      pageTitle: 'Videos'
    },
    resolve: {
      currentUser(User) {
        return User.get().$promise;
      }
    }
  })
  .state('manager.videosUpload', {
    url: '/videos/upload',
    templateUrl: 'app/performer-manager/videos/upload.html',
    controller: 'PerformerVideoUploadCtrl',
    data: {
      pageTitle: 'Videos upload'
    },
    resolve: {
      categories(categoriesService) {
        return categoriesService.findAll();
      },
      performer(User) {
        return User.get().$promise;
      },
      performers: function(perfomerService) {
        return perfomerService.findAll({
          limit: 500,
          offset: 0,
          orderType: 1
        }).then(function(resp) {
          return resp.data;
        });
      }
    }
  })
  .state('manager.videosedit', {
    url: '/videos/edit/:id',
    templateUrl: 'app/performer-manager/videos/upload.html',
    controller: 'PerformerVideoEditCtrl',
    data: {
      pageTitle: 'Video Edit'
    },
    resolve: {
      categories(categoriesService) {
        return categoriesService.findAll();
      },
      video: function(videoService, $stateParams){
        return videoService.find($stateParams.id).then(function(data){
          return data.data;
        });
      },
      performer(User) {
        return User.get().$promise;
      },
      performers: function(perfomerService) {
        return perfomerService.findAll({
          limit: 500,
          offset: 0,
          orderType: 1
        }).then(function(resp) {
          return resp.data;
        });
      }
    }
  })
  .state('manager.videosBunkUpload', {
    url: '/bunk-video-upload',
    templateUrl: 'app/performer-manager/videos/bunk-upload.html',
    controller: 'PerformerVideoBunkUploadCtrl',
    data: {
      pageTitle: 'Bunk upload videos'
    },
    resolve: {
      categories(categoriesService) {
        return categoriesService.findAll();
      },
      performer(User) {
        return User.get().$promise;
      }
    }
  })
  .state('manager.photos', {
    url: '/photos',
    templateUrl: 'app/performer-manager/photos/list.html',
    controller: 'PerformerListPhotoCtrl',
    data: {
      pageTitle: 'Photos manager'
    },
    resolve: {
      currentUser(User) {
        return User.get().$promise;
      }
    }
  })
  .state('manager.photosUpload', {
    url: '/photos/upload',
    templateUrl: 'app/performer-manager/photos/upload.html',
    controller: 'PerformerUploadPhotoCtrl',
    data: {
      pageTitle: 'Photos upload'
    },
    resolve: {
      performer(User) {
        return User.get().$promise;
      }
    }
  })
  .state('manager.photosEdit', {
    url: '/photos/edit/:id',
    templateUrl: 'app/performer-manager/photos/upload.html',
    controller: 'PerformerEditPhotoCtrl',
    data: {
      pageTitle: 'Photos edit'
    },
    resolve: {
      performer(User) {
        return User.get().$promise;
      },
      photo: function(photoService, $stateParams){
        return photoService.find($stateParams.id).then(function(data){
          return data.data;
        });
      }
    }
  })
  .state('manager.photosBunkUpload', {
    url: '/bunk-photo-upload',
    templateUrl: 'app/performer-manager/photos/bunk-upload.html',
    controller: 'PhotoBulkUploadCtrl',
    data: {
      pageTitle: 'Bunk upload photos'
    },
    resolve: {
      performer(User) {
        return User.get().$promise;
      }
    }
  })
  .state('manager.requests-payout', {
    url: '/list-request-payout',
    templateUrl: 'app/performer-manager/request-payout/list.html',
    controller: 'RequestslistCtrl',
    data: {
      pageTitle: 'List Requests Payout'
    },
    resolve: {

    }
  })
  .state('manager.requestpayoutCreate', {
    url: '/new-request-payout',
    templateUrl: 'app/performer-manager/request-payout/form.html',
    controller: 'RequestPayoutCreateCtrl',
    data: {
      pageTitle: 'New Request Payout'
    },
    resolve: {
      performer(User) {
        return User.get().$promise;
      }
    }
  })
  .state('manager.requestpayoutEdit', {
    url: '/edit-request-payout/:id',
    templateUrl: 'app/performer-manager/request-payout/form.html',
    controller: 'RequestPayoutEditCtrl',
    data: {
      pageTitle: 'Edit Request Payout'
    },
    params:{id: null},
    resolve: {
      request: function(payoutService, $stateParams){
        return payoutService.find($stateParams.id).then(function(data){
          return data.data;
        });
      },
      performer(User) {
        return User.get().$promise;
      },
      comments: function(commentService, $stateParams){
        return commentService.findAllByRequestPayout({payoutId:$stateParams.id, take: 100}).then(function(data){
          return data.items;
        });
      }
    }
  })
  .state('manager.earning', {
    url: '/earnings',
    templateUrl: 'app/performer-manager/earning/index.html',
    controller: 'EarningCtrl',
    data: {
      pageTitle: 'Earnings'
    },
    resolve: {
      performer(User) {
        return User.get().$promise;
      }
    }
  })
  .state('manager.albumCreate', {
    url: '/create?performerId',
    templateUrl: 'app/performer-manager/album/views/form.html',
    controller: 'AlbumCreateCtrl',
    data: {
      pageTitle: 'Create new album',


    }
  })
  .state('manager.albumUpdate', {
    url: '/:id/update?performerId',
    templateUrl: 'app/performer-manager/album/views/form.html',
    controller: 'AlbumUpdateCtrl',
    resolve: {
      item: function(albumService, $stateParams) {
        return albumService.findOne($stateParams.id);
      }
    },
    data: {
      pageTitle: 'Update album',


    }
  })
  .state('manager.albumList', {
    url: '/list?performerId',
    templateUrl: 'app/performer-manager/album/views/list.html',
    controller: 'AlbumListCtrl',
    data: {
      pageTitle: 'Albums',


    }
  })
  .state('manager.topPerformers', {
    url: '/top-performers',
    templateUrl: 'app/performer-manager/top-performer/list.html',
    controller: 'TopPerformerCtrl',
    data: {
      pageTitle: 'Top Performers'
    }
  })
  .state('manager.productList', {
    url: '/products/list',
    templateUrl: 'app/performer-manager/store/index.html',
    controller: 'PerforerProductListCtrl',
    data: {
      pageTitle: 'Products'
    },
    resolve: {
      user: function(User) {
        return User.get().$promise;
      }
    }
  })
  .state('manager.productAdd', {
    url: '/products/add',
    templateUrl: 'app/performer-manager/store/form.html',
    controller: 'PerforerProductAddCtrl',
    data: {
      pageTitle: 'Add product'
    },
    resolve: {
      categories: function(productCategoryService) {
        return productCategoryService.find().then(function(resp) {
          return resp.items;
        });
      }
    }
  })
  .state('manager.productEdit', {
    url: '/products/edit/:id',
    templateUrl: 'app/performer-manager/store/form.html',
    controller: 'PerforerProductEditCtrl',
    data: {
      pageTitle: 'Edit product'
    },
    resolve: {
      product: function(productService, $stateParams){
        return productService.find($stateParams.id).then(function(data){
          return data.data;
        });
      },
      categories: function(productCategoryService) {
        return productCategoryService.find().then(function(resp) {
          return resp.items;
        });
      }
    }
  })
  .state('manager.modelAdd', {
    url: '/performer/add',
    templateUrl: 'app/performer-manager/videos/model-create.html',
    controller: 'ModelsAddCtrl',
    data: {
      pageTitle: 'Add performer'
    },
    resolve: {
    }
  })
  .state('manager.blackList', {
    url: '/:performerId/blackList',
    templateUrl: 'app/performer-manager/blacklist/views/list.html',
    controller: 'BlockListCtrl',
    data: {
      pageTitle: 'Black list'
    },
    resolve: {
      me: function(User){
        return User.get().$promise;
      }
    }
  })
  .state('manager.scheduleList', {
    url: '/:performerId/schedules',
    templateUrl: 'app/performer-manager/schedules/views/list.html',
    controller: 'ScheduleListCtrl',
    data: {
      pageTitle: 'Schedules List'
    },
    resolve: {
      me: function(User){
        return User.get().$promise;
      }
    }
  })
  .state('manager.scheduleCreate', {
    url: '/:performerId/schedules/create',
    templateUrl: 'app/performer-manager/schedules/views/form.html',
    controller: 'ScheduleCreateCtrl',
    data: {
      pageTitle: 'Schedule Create'
    },
    resolve: {
      me: function(User){
        return User.get().$promise;
      }
    }
  })
  .state('manager.scheduleEdit', {
    url: '/:performerId/schedules/edit/:id',
    templateUrl: 'app/performer-manager/schedules/views/form.html',
    controller: 'ScheduleUpdateCtrl',
    data: {
      pageTitle: 'Schedule Edit'
    },
    resolve: {
      me: function(User){
        return User.get().$promise;
      },
      scheduleItem: function($stateParams, scheduleService) {
        return scheduleService.findOne($stateParams.id);
      }
    }
  }).state('manager.tagVideos', {
    url: '/:performerId/tagVideos',
    templateUrl: 'app/performer-manager/tag-videos/list.html',
    controller: 'TagVideosCtrl',
    data: {
      pageTitle: 'Tagged Videos'
    },
    resolve: {
      me: function(User){
        return User.get().$promise;
      },
      models: function(perfomerService) {
        return perfomerService.search().then((resp) => resp.items);
      }
    }
  }).state('manager.uploadAffiliateContent', {
    url: '/:performerId/uploadAffiliateContent',
    templateUrl: 'app/performer-manager/affiliatecontent/bulkupload.html',
    controller: 'uploadAffiliateContentCtrl',
    data: {
      pageTitle: 'Affiliate Content'
    }
  });
});
