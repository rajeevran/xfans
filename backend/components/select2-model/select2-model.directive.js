angular.module('xMember').directive('select2Directive', function ($state, $rootScope, $timeout) {
  return {
    restrict: 'A',
    scope:{
      'ngModel': '='
    },
    link: function (scope, element) {    
      
      
      $(element).select2({
//        ajax: {
//          url: "/api/v1/performers",
//          dataType: 'json',
//          delay: 250,
//          data: function (params) {              
//            return {
//              keyword: params.term, // search term
//              limit: 10,
//              offset: 0,
//              sort: 'name'
//            };
//          },   
//          processResults: function (data, params) {                           
//            return {                
//              results: data.map(function(item) {
//                item.id = item._id;
//                return item;
//              })               
//            };
//          }            
//        },          
//        minimumInputLength: 1,
//        templateResult: function(object){            
//          return object.name;
//        }, 
//        templateSelection: function(object){                             
////          scope.ngModel = $(element).select2('val');          
//          return object.name;      
//        }
      });
      $timeout(function() {        
          var sss = [999, 888, 7777];
          for (i=0; i<sss.length; i++) {
            $(element).append($("<option/>", {
                value: sss[i],
                text: "Option "+sss[i],
                selected: true
            })).trigger('change');
          }                   
      }, 999);
      $timeout(function() {    
        
      $(element).select2({
        ajax: {
          url: "/api/v1/performers",
          dataType: 'json',
          delay: 250,
          data: function (params) {              
            return {
              keyword: params.term, // search term
              limit: 10,
              offset: 0,
              sort: 'name'
            };
          },   
          processResults: function (data, params) {                           
            return {                
              results: data.map(function(item) {
                item.id = item._id;
                return item;
              })               
            };
          }            
        },          
        minimumInputLength: 1,
        templateResult: function(object){            
          return object.name;
        }, 
        templateSelection: function(object){                             
//          scope.ngModel = $(element).select2('val');          
          return object.name;      
        }
      });
      
      }, 2000);
      
    }
  };
});