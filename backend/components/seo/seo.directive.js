'use strict';

angular.module('xMember')
        .directive('updateTitle', ['$rootScope', '$timeout',
  function($rootScope, $timeout) {
    return {
      link: function(scope, element) {
        var listener = function(event, toState) {
          $timeout(function() {
            var title = 'xMember';
              var metaDescription = '<meta name="description" content="xMember description">';
              var metaKeywords = '<meta name="description" content="sex, sex tour, xmember, video">';
              if (toState.data){
                 title = toState.data.pageTitle;
                 metaDescription = '<meta name="description" content="'+toState.data.metaDescription+'">';
                 metaKeywords = '<meta name="description" content="'+toState.data.metaKeywords+'">';
              }
            element.text(title);
            element.parent().find('title').after(metaDescription+"\n"+metaKeywords);
          }, 0, false);
        };

        $rootScope.$on('$stateChangeSuccess', listener);
      }
    };
  }
]);
