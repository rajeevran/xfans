'use strict';
/* jshint ignore:start */
angular.module('xMember.util').directive('autoFrameHeight', ($) => ({
  restrict: 'A',
  link: (scope, element) => {
    $(element).load(function(){$(this).height($(this).contents().outerHeight());});
  }
}))
.directive('tagInput', function () {
  return {
    restrict: 'E',
    scope: {
      inputTags: '=taglist',
      autocomplete: '=autocomplete'
    },
    link: function ($scope, element, attrs) {
      $scope.defaultWidth = 200;
      $scope.tagText = '';
      $scope.placeholder = attrs.placeholder;
      if ($scope.autocomplete) {
        $scope.autocompleteFocus = function (event, ui) {
          $(element).find('input').val(ui.item.value);
          return false;
        };
        $scope.autocompleteSelect = function (event, ui) {
          $scope.$apply('tagText=\'' + ui.item.value + '\'');
          $scope.$apply('addTag()');
          return false;
        };
        $(element).find('input').autocomplete({
          minLength: 0,
          source: function (request, response) {
            var item;
            return response(function () {
              var i, len, ref, results;
              ref = $scope.autocomplete;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                if (window.CP.shouldStopExecution(1)) {
                  break;
                }
                item = ref[i];
                if (item.toLowerCase().indexOf(request.term.toLowerCase()) !== -1) {
                  results.push(item);
                }
              }
              window.CP.exitedLoop(1);
              return results;
            }());
          },
          focus: function () {
            return function (event, ui) {
              return $scope.autocompleteFocus(event, ui);
            };
          }(this),
          select: function () {
            return function (event, ui) {
              return $scope.autocompleteSelect(event, ui);
            };
          }(this)
        });
      }
      $scope.tagArray = function () {
        if ($scope.inputTags === undefined) {
          return [];
        }
        return $scope.inputTags.filter(function (tag) {
          return tag !== '';
        });
      };
      $scope.addTag = function () {
        var tagArray;
        if ($scope.tagText.length === 0) {
          return;
        }
        tagArray = $scope.tagArray();
        tagArray.push($scope.tagText);
        $scope.inputTags = tagArray;
        $scope.tagText = '';
      };
      $scope.deleteTag = function (key) {
        var tagArray;
        tagArray = $scope.tagArray();
        if (tagArray.length > 0 && $scope.tagText.length === 0 && key === undefined) {
          tagArray.pop();
        } else {
          if (key !== undefined) {
            tagArray.splice(key, 1);
          }
        }
        $scope.inputTags = tagArray;
      };
      $scope.$watch('tagText', function (newVal, oldVal) {
        var tempEl;
        if (!(newVal === oldVal && newVal === undefined)) {
          tempEl = $('<span>' + newVal + '</span>').appendTo('body');
          $scope.inputWidth = tempEl.width() + 5;
          if ($scope.inputWidth < $scope.defaultWidth) {
            $scope.inputWidth = $scope.defaultWidth;
          }
          return tempEl.remove();
        }
      });
      element.bind('keydown', function (e) {
        var key;
        key = e.which;
        if (key === 9 || key === 13) {
          e.preventDefault();
        }
        if (key === 8) {
          return $scope.$apply('deleteTag()');
        }
      });
      return element.bind('keyup', function (e) {
        var key;
        key = e.which;
        if (key === 9 || key === 13 || key === 188) {
          e.preventDefault();
          return $scope.$apply('addTag()');
        }
      });
    },
    template: '<div class=\'tag-input-ctn\'><div class=\'input-tag\' data-ng-repeat="tag in tagArray()">{{tag}}<div class=\'delete-tag\' data-ng-click=\'deleteTag($index)\'>&times;</div></div><input type=\'text\' data-ng-style=\'{width: inputWidth}\' data-ng-model=\'tagText\' placeholder=\'{{placeholder}}\'/></div>'
  };
})
.directive('readMore', function() {
  return {
    restrict: 'A',
    transclude: true,
    replace: true,
    template: '<p></p>',
    scope: {
      moreText: '@',
      lessText: '@',
      words: '@',
      ellipsis: '@',
      char: '@',
      limit: '@',
      content: '@'
    },
    link: function(scope, elem, attr, ctrl, transclude) {
      var moreText = angular.isUndefined(scope.moreText) ? ' <a class="read-more">Read More...</a>' : ' <a class="read-more">' + scope.moreText + '</a>',
        lessText = angular.isUndefined(scope.lessText) ? ' <a class="read-less">Less ^</a>' : ' <a class="read-less">' + scope.lessText + '</a>',
        ellipsis = angular.isUndefined(scope.ellipsis) ? '' : scope.ellipsis,
        limit = angular.isUndefined(scope.limit) ? 150 : scope.limit;

      attr.$observe('content', function(str) {
        readmore(str);
      });

      transclude(scope.$parent, function(clone) {
        readmore(clone.text().trim());
      });

      function readmore(text) {
        var text = text,
          orig = text,
          regex = /\s+/gi,
          charCount = text.length,
          wordCount = text.trim().replace(regex, ' ').split(' ').length,
          countBy = 'char',
          count = charCount,
          foundWords = [],
          markup = text,
          more = '';

        if (!angular.isUndefined(attr.words)) {
          countBy = 'words';
          count = wordCount;
        }

        if (countBy === 'words') { // Count words

          foundWords = text.split(/\s+/);

          if (foundWords.length > limit) {
            text = foundWords.slice(0, limit).join(' ') + ellipsis;
            more = foundWords.slice(limit, count).join(' ');
            markup = text + moreText + '<span class="more-text">' + more + lessText + '</span>';
          }

        } else { // Count characters

          if (count > limit) {
            text = orig.slice(0, limit) + ellipsis;
            more = orig.slice(limit, count);
            markup = text + moreText + '<span class="more-text">' + more + lessText + '</span>';
          }

        }

        elem.append(markup);
        elem.find('.read-more').on('click', function() {
          $(this).hide();
          elem.find('.more-text').addClass('show').slideDown();
        });
        elem.find('.read-less').on('click', function() {
          elem.find('.read-more').show();
          elem.find('.more-text').hide().removeClass('show');
        });

      }
    }
  };
})
.directive('spinner', function() {
  return {
    restrict: 'E',
    scope: {
      size: '@'
    },
    template: '<div class="clearfix"><img src="/assets/images/spinner.gif" style="display:block;margin:0 auto" ng-style="{width: width + \'px\'}" /></div>',
    link: function(scope) {
      scope.width = scope.size || 50;
    }
  };
});
/* jshint ignore:end */
