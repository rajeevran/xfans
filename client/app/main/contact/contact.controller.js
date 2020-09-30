"use strict";
angular.module('xMember').controller('ContactCtrl', function ($scope, $state, $rootScope, settingService, growl) {
  // $scope.intialize = function() {
  //   var mapCanvas = document.getElementById('map');
  //   $rootScope.$watch('setting', function(nv) {
  //     if (!nv) {
  //       return;
  //     }
  //
  //     var MyLats = new google.maps.LatLng(37.791917, -122.400662);
  //     var mapOptions = {
  //       center: MyLats,
  //       zoom: 14,
  //       mapTypeId: google.maps.MapTypeId.ROADMAP
  //     };
  //     var map = new google.maps.Map(mapCanvas, mapOptions);
  //     var contentString = '<div style="color:#111">' +
  //             'Company:' +nv.companyName
  //             +'<br>Email:' + nv.email
  //             +'<br>Address:' +nv.address
  //             +'<br>Hotline:' +nv.hotline
  //             +'</div>';
  //     var infowindow = new google.maps.InfoWindow({
  //       content: contentString
  //     });
  //
  //     if (nv.address) {
  //       var geocoder = new google.maps.Geocoder();
  //       geocoder.geocode( { 'address': nv.address}, function(results, status) {
  //         if (status == google.maps.GeocoderStatus.OK) {
  //           map.setCenter(results[0].geometry.location);
  //           var marker = new google.maps.Marker({
  //             map: map,
  //             position: results[0].geometry.location,
  //             title: nv.companyName
  //           });
  //         } else {
  //           new google.maps.Marker({
  //             position: MyLats,
  //             map: map,
  //             title: nv.companyName
  //           });
  //         }
  //       });
  //     } else {
  //       new google.maps.Marker({
  //         position: MyLats,
  //         map: map,
  //         title: nv.companyName
  //       });
  //     }
  //   });
  // }
  // $scope.intialize();

  $scope.submitted = false;
  $scope.data = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };
  $scope.sendContact = function(frm) {
    $scope.submitted = true;
    if (!frm.$valid) {
      return;
    }

    settingService.sendContact($scope.data)
      .then(() => {
        $scope.submitted = false;
        $scope.data = {
          name: '',
          email: '',
          phone: '',
          message: ''
        };
        growl.success('Thank you. your message has been sent!');
      })
      .catch(() => growl.error('Sorry, an error occurred, please try again!'));
  };
});
