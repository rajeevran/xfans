'use strict';

angular.module('xMember')
.factory('messageService', function ($http) {
  return {
    findAllGroups(params) {
      return $http.get('/api/v1/messages/groups', {params:params}).then(resp => resp.data);
    },
    getGroup(params) {
      return $http.post('/api/v1/messages/groups', { params: params }).then(resp => resp.data);
    },
    sendMessage(messageGroupId, content) {
      return $http.post('/api/v1/messages', { messageGroupId, content }).then(resp => resp.data);
    },
    getMessagesInGroup(messageGroupId, params) {
      return $http.get('/api/v1/messages/groups/' + messageGroupId, { params }).then(resp => resp.data);
    },
    block: function(item){
      return $http.post('/api/v1/blocks', item).then(function(resp) { return resp.data; });
    },
    checkBlock: function(params) {
      return $http.get('/api/v1/blocks/check', {params: params}).then(resp => resp.data);
    }
  };
});
