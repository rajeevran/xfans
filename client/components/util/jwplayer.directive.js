'use strict';
angular.module('xMember.util').directive('jwplayer', ['$compile', '$timeout', function ($compile, $timeout) {
  return {
    restrict: 'EC',
    scope: {
      playerId: '@',
      setupVars: '=setup'
    },
    link: function (scope, element, attrs) {
      $timeout(function() {
        var id = scope.playerId || 'random_player_' + Math.floor((Math.random() * 999999999) + 1),
        getTemplate = function (playerId) {
          return '<div id="' + playerId + '"></div>';
        };

        var noFlashContent = '<span class="FlashAltLayoutOverlay FlashAltLayoutBody FlashAltText">'
              + '<span class="FlashAltLayoutRow FlashAltTextLarge">'
              +    'This content requires Flash</span>'
              + '<span class="FlashAltLayoutRow FlashAltButton">'
              +        '<a href="https://www.adobe.com/go/getflashplayer/" class="FlashAltButton">To view this content, JavaScript must be enabled, and you need the latest version of the Adobe Flash Player.</a></span>'
              + '</span>';

        element.html(getTemplate(id));
        $compile(element.contents())(scope);
        var player = jwplayer(id);
        player.setup(scope.setupVars);
        player.on('setupError', function(err) {
          $(element).find(id).prevObject.html(noFlashContent);
        });
      });
    }
  };
}]);
