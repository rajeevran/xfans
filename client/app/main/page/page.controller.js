"use strict";
angular.module('xMember').controller('PageViewCtrl', function ($scope, $sce, page) {
  page.description = $sce.trustAsHtml(page.description);
  $scope.page = page;
});
