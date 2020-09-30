"use strict";
// angular.module('xMember').controller('SignupCtrl', function($scope, $state, Auth, packages){
//   if(Auth.isLoggedIn()){
//     $state.go('home');
//   }
//   $scope.packages = packages;
//   angular.forEach($scope.packages,function(item){
//     var PriceArr = item.price.toString().split('.');
//     item['priceArr'] = PriceArr;
//     if(typeof PriceArr[1] == 'undefined'){
//       PriceArr[1] = '00';
//     }
//   });
// });

angular
  .module("xMember")
  .controller("SignupUserCtrl", function(
    $scope,
    $rootScope,
    $state,
    userService,
    growl,
    Auth,
    User,
    $stateParams,
    $cookies,
    Upload
  ) {
    if (Auth.isLoggedIn()) {
      $state.go("home");
    }
    $scope.user = {
      name: null,
      email: null,
      password: null,
      isVip: false,
      imageType: "direct",
      role: "user",
      status: "active",
      dateExpire: new Date()
    };

    $scope.register = function(form, file) {
      $scope.submitted = true;
      $scope.validateEmail = false;
      var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!regex.test($scope.user.email)) {
        form.$valid = false;
        $scope.validateEmail = true;
      }
      // if (form.$valid) {
      //   console.log($scope.user);
      //   userService.create($scope.user)
      //     .then((user) => {
      //       console.log(user);
      //       // Account created, redirect to home
      //       growl.success("Register successfully!",{ttl:5000});
      //       $state.go('login');
      //     })
      //     .catch(err => {
      //       err = err.data;
      //       this.errors = {};
      //
      //       // Update validity of form fields that match the mongoose errors
      //       angular.forEach(err.errors, (error, field) => {
      //         form[field].$setValidity('mongoose', false);
      //         this.errors[field] = error.message;
      //       });
      //     });
      // }
      //
      if (form.$valid) {
        if (file != null && typeof file.size != "undefined") {
          file.upload = Upload.upload({
            url: "/api/v1/users",
            method: "POST",
            data: $scope.user,
            file: file
          }).catch(err => {
            err = err.data;

            this.errors = {};
            // Update validity of form fields that match the mongoose errors
            angular.forEach(err.errors, (error, field) => {
              //form[field].$setValidity('mongoose', false);
              this.errors[field] = error.message;
            });
            $scope.err = err.errors;
          });

          file.upload.then(
            function(response) {
              $timeout(function() {
                if (response) {
                  growl.success(
                    "Congrats, your resiger has been successfully, please check your email address to verify your account"
                  );
                  $state.go("login", {
                    email:
                      response.data && response.data.email
                        ? response.data.email
                        : "",
                    type: "user"
                  });
                }
              });
            },
            function(response) {
              if (response.status > 0)
                $scope.errorMsg = response.status + ": " + response.data;
            },
            function(evt) {
              file.progress = Math.min(
                100,
                parseInt((100.0 * evt.loaded) / evt.total)
              );
            }
          );
        } else {
          Upload.upload({
            url: "/api/v1/users",
            method: "POST",
            data: $scope.user,
            file: file
          })
            .then(function(res) {
              growl.success(
                "Congrats, your resiger has been successfully, please check your email address to verify your account"
              );
              $state.go("login", { email: res.data.email, type: "user" });
            })
            .catch(err => {
              growl.error(
                err.data && err.data.message
                  ? err.data.message
                  : "This email address already taken!"
              );
            });
        }
      }
    };
  });

// angular.module('xMember').controller('SignupStep3Ctrl', function($scope, $state, Auth, packageData, $stateParams){
// if(Auth.isLoggedIn()){
//    $state.go('home');
//  }
//   $scope.package= packageData;
//   $scope.month = ['01','02','03','04','05','06','07','08','09','10','11','12'];
//   var year = parseInt(moment(new Date()).format('YYYY'));
//   $scope.years = [];
//   for(var i = year; i<= year+20; i++ ){
//     $scope.years.push(i);
//   }
//
// });

angular
  .module("xMember")
  .controller("SignupSuccessCtrl", function(
    $scope,
    $state,
    Auth,
    $stateParams
  ) {
    return false;
  });

angular
  .module("xMember")
  .controller("ForgotCtrl", function($scope, $state, Auth, userService) {
    if (Auth.isLoggedIn()) {
      $state.go("home");
    }
    $scope.email = null;
    $scope.forgot = function(form) {
      $scope.submitted = true;
      if (form.$valid) {
        userService.forgot($scope.email).then(function(res) {
          if (res) {
            $scope.success = "We sent new password to your email.";
          } else {
            $scope.errors = { email: "This email is not registered." };
          }
        });
      }
    };
  });
