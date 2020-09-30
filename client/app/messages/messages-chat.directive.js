'use strict';

angular.module('xMember').directive('messageChat', function(messageService, socket, Auth, Upload, perfomerService, growl, $state) {
  return {
    restrict: 'E',
    templateUrl: 'app/messages/views/messages-chat.directive.html',
    scope: {
      activeGroup: '='
    },
    link(scope, elem) {
      let page = 1;
      let count = 0;
      let currentId;
      scope.items = [];
      scope.currentUser = Auth.getCurrentUser();
      scope.newMessage = {
        msg: ''
      };
      scope.$watch('activeGroup', function(group) {
        var groupUser = _.find(group.users, gUser => gUser._id !== scope.currentUser._id);
        scope.recipient = groupUser;
        scope.blocked = false;
        scope.allowed = false;
        scope.subcribed = group.subscribed;
        scope.isBlocked = group.blocked;
        if (scope.currentUser.role === 'performer') {
          perfomerService.checkAllowViewProfile({
            objectId: groupUser._id,
            userId: scope.currentUser._id
          }).then(res => {
            scope.allowed = res.allowed;
          });
          messageService.checkBlock({
            objectId: groupUser._id,
            userId: scope.currentUser._id
          }).then(res => {
            scope.blocked = res.blocked;
          });
        }
        if (!group) {
          return;
        }

        if (currentId !== group._id) {
          loadMessages();
          currentId = group._id;
        }
      }, true);

      scope.block = function() {
        if (window.confirm('Do you want to block this user?')) {
          messageService.block({
              userId: scope.currentUser._id,
              objectId: scope.recipient._id
            }).then((res) => {
              if (res) {
                growl.success('Success!', {
                  ttl: 2000
                });
                scope.blocked = true;
              }
            })
            .catch(err => growl.error(err))
        }
      };

      scope.allow = function() {
        scope.currentUser.allowIds.unshift(scope.recipient._id);
        if (window.confirm('Do you want to allow this Model to view your profile?')) {
          Upload.upload({
            url: '/api/v1/performers/' + scope.currentUser._id,
            method: 'PUT',
            data: {
              allowIds: scope.currentUser.allowIds
            },
            file: ''
          }).then((resp) => {
            scope.allowed = true;
          })
        }
      };

      scope.sendMessage = function() {
        messageService.sendMessage(scope.activeGroup._id, scope.newMessage.msg)
          .then(resp => {
            scope.items.push(resp);
            scope.newMessage.msg = '';
          });
      }


      function loadMessages() {
        messageService.getMessagesInGroup(scope.activeGroup._id)
          .then(resp => {
            scope.items = resp.items.reverse();
            count = resp.count;
          });
      }

      scope.getRecipient = function(id) {
        return _.find(scope.activeGroup.users, u => u._id === id);
      };


      scope.uploadImage = function(file) {
        Upload.upload({
          url: '/api/v1/messages/image',
          method: 'POST',
          file: file,
          data: {
            messageGroupId: scope.activeGroup._id
          }
        }).then(function(response) {
          scope.items.push(response.data);
        }, function(response) {
          if (response.status > 0) {
            //$scope.errorMsg = response.status + ': ' + response.data;
          }
        }, function(evt) {
          //$scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          //$scope.safeApply();
        });
      };

      socket.socket.on('NEW_MESSAGE', function(data) {
        if (data.messageGroupId === scope.activeGroup._id) {
          scope.items.push(data);
        }
      });
    }
  };
});
