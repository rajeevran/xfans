'use strict';

angular.module('xMember', ['xMember.auth', 'xMember.constants',
    'ngCookies', 'ngResource', 'ngSanitize', 'btford.socket-io', 'ui.router', 'ui.bootstrap',
    'validation.match', 'angular-growl', 'ui.select2', 'angular-loading-bar', 'ngAnimate', 'ngFileUpload', 'colorpicker.module', 'daterangepicker', 'ng.ckeditor',
    'froala'
  ])
  .config(function($urlRouterProvider,  $locationProvider,  cfpLoadingBarProvider) {
    //$urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
    //angular loading bar
    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.includeBar = true;
  })
  .run(function ($rootScope, $state, cfpLoadingBar, $anchorScroll, $window, $cookieStore, settingService) {
    //setting
    settingService.getDefault().then(function(data){
      $rootScope.rootSetting = data.data;
    });
    //    cfpLoadingBar.start();
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if(toState.name != 'backend'){
        cfpLoadingBar.start();
      }
    });

    /*
     *scroll to top when state changed
     */
    var wrap = function(method) {
      var orig = $window.window.history[method];
      $window.window.history[method] = function() {
        var retval = orig.apply(this, Array.prototype.slice.call(arguments));
        $anchorScroll();
        return retval;
      };
    };
    wrap('pushState');
    wrap('replaceState');
    /*End scroll to top*/

    $rootScope.safeApply = function(fn) {
    var phase = $rootScope.$$phase;
    if (phase === '$apply' || phase === '$digest') {
      if (fn && (typeof (fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };
  })
  .value('$', $)
  .directive('updateTitle', ['$rootScope', '$timeout',
    function($rootScope, $timeout) {
      return {
        link: function(scope, element) {
          var listener = function(event, toState) {
            $timeout(function() {
              var title = toState.data ? toState.data.metaTitle || toState.data.pageTitle : '';
              element.text(title);
            }, 10, false);
          };

          $rootScope.$on('$stateChangeSuccess', listener);
        }
      };
    }
  ])
  .value('froalaConfig', {
    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineStyle', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '|', 'emoticons', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'print', 'help', 'html', '|', 'undo', 'redo'],
    // Set the video upload URL.
    videoUploadURL: '/api/v1/files/video',
    // Set request type.
    videoUploadMethod: 'POST',
    // Allow to upload MP4, WEBM and OGG
    videoAllowedTypes: ['webm', 'ogg', 'mp4'],
    videoMaxSize: 1024 * 1024 * 3000
	});;
