angular.module('xMember').service('commonHelper', ['$q', '$http', function ($q, $http) {
    return {
      getTimeStamp: function (date) {
        var timestmpCompletedDate = new Date(date).getTime();
        return timestmpCompletedDate - (new Date().getTimezoneOffset() * 60 * 1000);
      },
      obToquery: function (obj, prefix) {
        var str = [];
        for (var p in obj) {
          var k = prefix ? prefix + "[" + p + "]" : p,
                  v = obj[k];
          str.push(angular.isObject(v) ? this.obToquery(v, k) : (k) + "=" + encodeURIComponent(v));
        }
        return str.join("&");
      },
      getCurrenLocation: function () {
        var defer = $q.defer();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (position) {
            defer.resolve({
              long: position.coords.longitude,
              lat: position.coords.latitude
            });
          }, function (err) {
            defer.resolve({
              long: 0,
              lat: 0
            });
          });
        } else {
          defer.resolve({
            long: 0,
            lat: 0
          });
        }
        return defer.promise;
      },
      countWord: function (input) {
        if (input) {
          var input = input.replace(/(^\s*)|(\s*$)/gi, "");//exclude  start and end white-space
          input = input.replace(/[ ]{2,}/gi, ' ');//2 or more space to 1
          input = input.replace(/\n /, ' '); // exclude newline with a start spacing    
          input = input.replace(/\n/, ' ');//      exclude newline
          return input.split(' ').length;
        }
         return '';
      }
     
    };
  }]);