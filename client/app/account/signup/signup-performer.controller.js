"use strict";

angular
  .module("xMember")
  .controller("SignupPerformerCtrl", function(
    $scope,
    $state,
    Auth,
    growl,
    Upload
  ) {
    $(".login-page").css("height", $(window).height());

    $scope.user = {
      sex: "female"
    };
    $scope.file;

    $scope.submit = function(frm) {
      $scope.submitted = true;
      if (!$scope.file) {
        return;
      }

      if (frm.$valid) {
        Upload.upload({
          url: "/api/v1/performers/register/upload",
          data: {
            file: $scope.file
          }
        }).then(
          function(resp) {
            Auth.registerPerformer(
              Object.assign($scope.user, {
                idImg1: resp.data._id
              })
            )
              .then(resp => {
                growl.success(
                  "Please check your email address to verify email & contact with our administrator to verify your issue documment",
                  { ttl: 3000 }
                );
                $scope.user = {
                  sex: "female"
                };
                $state.go("login");
                $scope.submitted = false;
              })
              .catch(err => growl.error(err.data.message, { ttl: 3000 }));
          },
          function() {
            growl.error("Cannot upload file, please double check!", {
              ttl: 3000
            });
          }
        );
      }
    };
  });
