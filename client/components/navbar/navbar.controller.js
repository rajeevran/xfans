'use strict';
angular.module('xMember').controller('NavbarController', function ($scope, ngCart, $state, Auth, growl) {
  $scope.tototalItems = ngCart.getTotalItems();
  $scope.$on('ngCart:itemAdded', function(event, data) {
    $scope.tototalItems = ngCart.getTotalItems();
  });
  $scope.$on('ngCart:itemRemoved',function(event,data){
    $scope.tototalItems = ngCart.getTotalItems();
  });
  $scope.isLoggedIn = Auth.isLoggedIn;
  if ($scope.isLoggedIn()) {
    Auth.getCurrentUser(null).then(res => $scope.currentUser = res);
  }

  $(document).ready(function () {
    // document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    //   anchor.addEventListener('click', function (e) {
    //       e.preventDefault();
    //
    //       document.querySelector(this.getAttribute('href')).scrollIntoView({
    //           behavior: 'smooth'
    //       });
    //   });
    // });
   $('.menutab a').click(function(){
     $(".tab-content .tab-pane").hide();
     var menu = $(this).attr('aria-controls');
     $("#"+menu).show();
   });

   $('.commentshow').click(function(){
     $(".rcm").click();
   });

    $('.toggle-menu').click(function () {
      $('.menu ul').toggleClass('show-menu');
      return false;
    });
    $('.toggle-profile').click(function () {
      $('.menu-profile ul').slideToggle();
      return false;
    });

    var show = false;
    $('.toggle-profile-custom').click(function () {
      if (!show) {
        $('.menu-profile ul').show();
        show = true;
      }else {
        $('.menu-profile ul').hide();
        show = false;
      }
    });
    $('.profile-top > a').click(function () {
      if(!show){
        $('.profile-top ul').show();
        show = true;
      }else{
        $('.profile-top ul').hide();
        show = false;
      }

      return false;
    });
  });

  $scope.search = function(evt) {
    if (!$scope.keyword) {
      return;
    }
    if (evt && evt.keyCode !== 13) {
      return;
    }

    $state.go('search', {
      q: $scope.keyword,
      r: Math.random()
    });
  };
});
