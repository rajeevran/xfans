(function (angular) {
  'use strict';

  angular.module('xMember')
    .config(function($stateProvider) {
      $stateProvider
        .state('messages', {
          url: '/chat/messages?recipientId',
          templateUrl: 'app/messages/views/messages.html',
          controller: 'MessagesCtrl',
          resolve: {
            groups(messageService, $stateParams) {
              if (!$stateParams.recipientId) {
                return messageService.findAllGroups({type: 'subscriber'});
              }

              return messageService.getGroup({recipientId:$stateParams.recipientId, type:'subscriber'})
                .then(() => messageService.findAllGroups({type: 'subscriber'}));
            },
            user(Auth) {
              return Auth.getCurrentUser();
            }
          },
          data: {
            pageTitle: 'Messages'
          },
        })
        .state('modelMessages', {
          url: '/chat/performer-messages?recipientId',
          templateUrl: 'app/messages/views/model-messages.html',
          controller: 'ModelMessagesCtrl',
          resolve: {
            user(Auth) {
              return Auth.getCurrentUser();
            }
          },
          data: {
            pageTitle: 'Messages'
          },
        })
    });
})(angular);
