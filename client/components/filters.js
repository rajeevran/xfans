'use strict';

angular.module('xMember')
.filter('removeSpaces', function() {
  return function(string) {
    return angular.isDefined(string) ? string.replace(/\s/g, '') : '';
  };
})
.filter('fromNow', function() {
  return function(string) {
    return angular.isDefined(string) ? moment(string).fromNow() : '';
  };
})
.filter('elipsis', function() {
  return function(string, count) {
    if (angular.isDefined(string) && _.isString(string)) {
      return string.length > count ? string.substring(0, count) + '...' : string;
    } else {
      return '';
    }
  };
})
.filter('ucFirst', function() {
  return function(string) {
    return angular.isDefined(string) ? string.charAt(0).toUpperCase() + string.slice(1) : '';
  };
})
.filter('linkify', function () {
  return function (text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp, '<a href="$1" target="_blank">$1</a>');
  };
})
.filter('htmlToPlaintext', function() {
  return function(text) {
    var tag = document.createElement('div');
    tag.innerHTML = text;

    return tag.innerText;
    //return String(text).replace(/<[^>]+>/gm, '');
  };
})
.filter('checkHeader', function() {
    return function(check) {
      if(typeof(check) == 'undefined' || check === 'null'){
        return '/assets/images/background-header.jpg';
      }
      return check;
    }
  })
.filter('checkImage', function() {
    return function(check) {
      if(typeof(check) == 'undefined' || check === 'null'){
        return '/assets/images/noimage.jpg';
      }
      return check;
    }
  })
  .filter('checkAvatar', function() {
    return function(check) {
      if(typeof(check)== 'undefined' || check === 'null'){
        return '/assets/images/default.jpg';
      }
      return check;
    }
  })
.filter('phoneNumber', function() {
  return function(str) {
    if(typeof str !== 'string'){ return ''; }

    //format number
    var rawNumber = str.replace(/[^0-9]/g,'');
    var regex = /^1?([2-9]..)([2-9]..)(....)$/;

    return rawNumber.replace(regex,'($1) $2 $3');
  };
})
.filter('decimal', function () {
    return function (input, places) {
      return !isNaN(input) ? parseFloat(input).toFixed(places) : input;
    };
  }
)
.filter('age', function(){
  return function(input, defaultText){
    defaultText = defaultText || 'Unknown';
    if(!input || !input.date || (!input.date.start && !input.date.end)){return 'Unknown'; }
    else{
      var birthdate = new Date(input.date.start);
      var cur;
      if(input.date.end){
        cur = new Date(input.date.end);
      }else{
        cur = new Date();
      }
      var diff = cur-birthdate; // This is the difference in milliseconds
      return Math.floor(diff/31536000000); // Divide by 1000*60*60*24*365
    }
  };
})
.filter('avatarUrl', function(){
  return function(profile){
    return profile && profile.avatarUrl ? profile.avatarUrl : '/assets/images/no-avatar.jpg';
  };
})
.filter('name', function() {
  return function(profile){
    return [profile.firstName, profile.lastName].join(' ');
  };
})
.filter('address', function() {
  return function(profile){
    if (!profile.profileAddress) { return ''; }

    return profile.profileAddress.fullAddress;
  };
})
.filter('gearIcon', function() {
  return function(key){
    let icon;
    switch(key) {
      case 'cameraModel':
        icon = 'camera.png';
        break;
      case 'lensBrand':
        icon = 'lens.png';
        break;
      case 'iso':
        icon = 'iso.png';
        break;
      case 'takenTime':
        icon = 'time.png';
        break;
      case 'aperture':
        icon = 'aperture.png';
        break;
      case 'angle':
        icon = 'angle';
        break;
      default:
        icon = 'camera.png';
        break;
    }

    return `/assets/images/icons/${icon}`;
  };
})
.filter('gearText', function() {
  return function(key, object){
    let text;
    switch(key) {
      case 'takenTime':
        text = [object.takenDate, object.takenTime].join(' ');
        break;
      case 'iso':
        text = `ISO ${object.iso}`;
        break;
      default:
        text = object[key];
        break;
    }

    return text;
  };
})
.filter('ssn', function () {
    return function (ssn) {

        if (!ssn) { return ''; }

        var value = ssn.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) return ssn;

        var three = value.slice(0, 3);
        var six = value.slice(3);

        if (six) {

            if(six.length > 2) six = six.slice(0, 2) + '-' + six.slice(2,6);

            return (three + "-" + six).trim();

        } else return three;
    };
})
.filter('durationFormat', function () {
  return function (seconds) {
    var sec_num = parseInt(seconds, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
  };
})
.filter('chiizDate', function(){
  return function(time, format) {
    var date = new Date(time);
    if(typeof date !== 'object') {
      return date;
    }
    return moment(date).format(format);
  };
})
.filter('cdn', function(appConfig) {
  return function(path, type) {
    if (!path) {
      return path;
    }

    if (!appConfig.cdn || isURL(path)) {
      return path;
    }

    if (!type || !appConfig.cdn[type]) {
      type = 'file';
    }

    var firstChar = path.charAt(0);
    return appConfig.cdn[type] + (firstChar === '/' ? '' : '/') + path;
  };
});
