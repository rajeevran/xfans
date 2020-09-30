'use strict';

angular.module('xMember')
        .directive('updateTitle', ['$rootScope', '$timeout',
  function($rootScope, $timeout) {
    return {
      link: function(scope, element) {
        var listener = function(event, toState) {
          $timeout(function() {

            // var metaDescription = '<meta name="description" content="xMember description">';
            // var metaKeywords = '<meta name="description" content="sex, sex tour, xmember, video">';
            // var metaTitle = '';
            // if (toState.data) {
            //    title = toState.data.pageTitle;
            //    metaDescription = '<meta name="description" content="'+ (toState.data.metaDescription || '') +'">';
            //    metaKeywords = '<meta name="Keywords" content="'+ (toState.data.metaKeywords || '') +'">';
            //    metaKeywords = '<meta name="title" content="'+ (toState.data.metaTitle || '') +'">';
            // }

            // element.parent().find('title').after(metaDescription+"\n"+metaKeywords+"\n"+metaTitle);
            $rootScope.metaKeywords = toState.data ? toState.data.metaKeywords : 'sex, sex tour, video';
            $rootScope.metaDescription = toState.data ? toState.data.metaDescription : '';
            $rootScope.metaTitle = toState.data ? toState.data.metaTitle || toState.data.pageTitle : '';
            $rootScope.shareUrl = window.location.href;
            var title = toState.data ? toState.data.metaTitle || toState.data.pageTitle : '';
            //replace xmember with sitename
            if ($rootScope.setting && $rootScope.setting.siteName) {
              if (!title) {
                title = $rootScope.setting.siteName;
              } else {
                title += ' | ' + $rootScope.setting.siteName;
              }
            }
            element.text(title);
          }, 10, false);
        };

        $rootScope.$on('$stateChangeSuccess', listener);
      }
    };
  }
]);
