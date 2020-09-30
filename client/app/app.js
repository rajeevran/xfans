'use strict';

window.isURL = function(str) {
  var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  if(!regex .test(str)) {
    return false;
  } else {
    return true;
  }
};

angular.module('xMember', ['xMember.auth', 'xMember.admin', 'xMember.constants',
    'ngCookies', 'ngResource', 'ngSanitize', 'btford.socket-io', 'ui.router', 'ui.bootstrap',
    'validation.match', 'angular-growl', 'bootstrapLightbox', 'angular-md5',
    'angular-loading-bar', 'ngAnimate', 'ngFileUpload', 'ngCart', 'vjs.video', 'ui.calendar',
     'ui.select', 'ui.carousel', 'ui.select2','luegg.directives', 'daterangepicker', 'chart.js', 'angular-img-cropper'
  ])
  .constant('SITENAME', 'Xfans')
  .config(function($urlRouterProvider,  LightboxProvider, $locationProvider,  cfpLoadingBarProvider) {
    $urlRouterProvider.otherwise('/');
    LightboxProvider.fullScreenMode = true;
    $locationProvider.html5Mode(true);
    //angular loading bar
    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.includeBar = true;

  })
  .run(function ($rootScope, settingService, $state, cfpLoadingBar, $anchorScroll, $window, $cookieStore, $sce, appConfig) {
    cfpLoadingBar.start();
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
    settingService.find().then(function(data){
      data.data.welcomeContent = $sce.trustAsHtml(data.data.welcomeContent);
      data.data.landingPageContent = $sce.trustAsHtml(data.data.landingPageContent);
      data.data.footerContent = $sce.trustAsHtml(data.data.footerContent);

      $rootScope.setting = data.data;
      var setting = data.data.color;

      if (setting.enable) {
        var mainColor = setting.main;
        var linesColor = setting.lines;
        var buttonColor = setting.button;
        var buttonBorderColor = setting.buttonBorder;
        var linkColor = setting.link;
        var linkHoverColor = setting.linkHover;
        var customCss = setting.custom;

        //update site color base on setting
        var css = `
          /*lines*/
          .title-main, .header, .menutab > li.active > a, .menutab > li.active > a:hover, .menutab > li.active > a:focus,.menutab > li > a:hover {
            border-bottom-color: ${linesColor};
          }
          .title-main h4 {
            border-color: ${linesColor} !important;
          }

          /*main button color*/
          .btn-warning, .btn-primary, .btn-primary:hover, .menu li.a-signup a, .shoppingcart span, .paging .pagination > .active > a {
            background: ${buttonColor} !important;
          }
          /*border*/
          .btn-warning, .btn-warning:hover, .btn-warning:focus, .action-detial-video li i, .paging .pagination a, .paging .pagination a:hover, .paging .pagination > .active > a, .ac-box-li i, .term-welcome {
            border: 1px solid ${buttonBorderColor} !important;
          }
          .btn-warning.btn-botder {
            border-color: ${buttonBorderColor} !important;
          }
          .paging .pagination a:hover {
             background: ${buttonColor};
          }

          /*link, main color*/
          a, .menu li a.active, h1, h2, h3, h4, h5, h6, .title-main h4, .action-detial-video li i, .btn-warning.btn-botder {
            color: ${linkColor} !important;
          }
          a:hover,.menu li a:hover {
            color: ${linkHoverColor} !important;
          }
          ${customCss}
        `,
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet){
          style.styleSheet.cssText = css;
        } else {
          style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
      }
    });

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

    $rootScope.appConfig = appConfig;
  })
  .value('$', $);
