angular.module('xMember').controller('UserCtrl', function ($scope, $state, growl, userService, users, userCount) {
  $scope.users = users;
  $scope.query = {
   keyword:'',
   sort:'createdAt',
   order:-1
  };
  //Set up sort Gird
  $(function(){
    $(".dataTables_filter input").keyup(function(e){
      if(e.keyCode ==13){
        $scope.pageChanged(1);
      }
    })
    $(".table-scrollable th").on('click',function(){
      var indexClick = $(this).index();
      $(".table-scrollable th").each(function(index){
          if(index!=indexClick){
            if($(this).hasClass('sorting')){
              $(this).removeClass('sorting_desc');
              $(this).removeClass('sorting_asc');
            }else if($(this).hasClass('sorting_desc')){
              $(this).removeClass('sorting_desc');
              $(this).addClass('sorting');
            }else if($(this).hasClass('sorting_asc')){
              $(this).removeClass('sorting_asc');
              $(this).addClass('sorting');
            }
          }
      });

      if($(this).hasClass('sorting_desc')){
          $(this).removeClass('sorting_desc');
          $(this).addClass('sorting_asc');
          $scope.query.order = 1;
        }else if($(this).hasClass('sorting_asc')){
          $(this).removeClass('sorting_asc');
          $(this).addClass('sorting_desc');
          $scope.query.order = -1;
        }else if($(this).hasClass('sorting')){
          $(this).addClass('sorting_asc');
          $scope.query.order = 1;
        }
        $scope.$apply();
        if(typeof $(this).attr('rel') != 'undefined'){
          $scope.query.sort = $(this).attr('rel');
          $scope.pageChanged(1);
        }
    });
  })
  $scope.maxSize = 10;
  $scope.totalItems = userCount;
  $scope.currentPage = 1;
  $scope.itemsPerPage = 10;
  $scope.totalItemInPage = 10;
  $scope.delete = function(user,index){
    userService.delete(user._id).then(function(res){
      if(res){
        $scope.users.splice(index,true);
        $scope.totalItems = $scope.totalItems-1;
        growl.success("Deleted successfully",{ttl:3000});
      }
    });
  }
  $scope.pageChanged = function (currentPage) {
    userService.findAll('undefined','undefined',$scope.query).then(function(res){
      $scope.totalItems = res.data;
    });
    userService.findAll($scope.itemsPerPage, currentPage - 1,$scope.query).then(function (data) {
      $scope.users = data.data;
      $scope.totalItemInPage = ($scope.itemsPerPage * ($scope.currentPage -1)) + data.data.length;
    });
  };

});

angular.module('xMember').controller('UserEditCtrl', function ($scope, $sce, $state, userService, growl, user, Upload, $timeout) {
  $scope.action = 'Edit';
  $scope.user = user;
  $scope.submitForm = function(form,file){
  $scope.submitted = true;
    if (form.$valid) {
      if(file != null && typeof file.size != 'undefined'){
       file.upload = Upload.upload({
                url: '/api/v1/users/'+$scope.user._id,
                method: 'PUT',
                data: $scope.user,
                file:file
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
          file.upload.then(function (response) {
              $timeout(function () {
                  if(response){
                    growl.success("Updated successfully",{ttl:3000});
                    $state.go('user');
                  }
              });
          }, function (response) {
              if (response.status > 0)
                  $scope.errorMsg = response.status + ': ' + response.data;
          }, function (evt) {
              file.progress = Math.min(100, parseInt(100.0 *
                                       evt.loaded / evt.total));
          });
        }else{
          Upload.upload({
                url: '/api/v1/users/'+$scope.user._id,
                method: 'PUT',
                data: $scope.user,
                file:file
            }).then(function(res){
              if(res){
                growl.success("Updated successfully",{ttl:3000});
                    $state.go('user');
              }
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
        }

      }
    }

  $scope.today = function() {
    $scope.user.dateExpire = new Date($scope.user.dateExpire);
  };
  $scope.today();

  $scope.clear = function() {
    $scope.user.dateExpire = null;
  };

  $scope.inlineOptions = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  $scope.toggleMin();

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.user.dateExpire = new Date(year, month, day);
  };

  $scope.formats = ['dd-MMMM-yyyy','yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[1];
  $scope.altInputFormats = ['yyyy-MM-dd'];

  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
    {
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }
  $state.current['data'] = {
    pageTitle: $scope.user.name,
    metaKeywords: $scope.user.description,
    metaDescription: $scope.user.description
  }
});

angular.module('xMember').controller('UserAddCtrl', function ($scope, $sce, $state, userService, growl, Upload, $timeout) {
  $scope.action = 'Add';
  $scope.user = {
    name:'',
    role:'user',
    emailVerified: true,
    photo:null,
    isVip:false,
    imageThumbPath:null,
    imageFullPath:null,
    status:'active'
  };
  $scope.submitForm = function(form,file){
  $scope.submitted = true;
    if (form.$valid) {
         if(file != null && typeof file.size != 'undefined'){
       file.upload = Upload.upload({
                url: '/api/v1/users',
                method: 'POST',
                data: $scope.user,
                file:file
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
          file.upload.then(function (response) {
              $timeout(function () {
                  if(response){
                    growl.success("Added successfully",{ttl:3000});
                    $state.go('user');
                  }
              });
          }, function (response) {
              if (response.status > 0)
                  $scope.errorMsg = response.status + ': ' + response.data;
          }, function (evt) {
              file.progress = Math.min(100, parseInt(100.0 *
                                       evt.loaded / evt.total));
          });
        }else{
          Upload.upload({
                url: '/api/v1/users',
                method: 'POST',
                data: $scope.user,
                file:file
            }).then(function(res){
              growl.success("Added successfully",{ttl:3000});
                    $state.go('user');
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
        }
      }
    }
  $scope.today = function() {
    $scope.user.dateExpire = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.user.dateExpire = null;
  };

  $scope.inlineOptions = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  $scope.toggleMin();

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.user.dateExpire = new Date(year, month, day);
  };

  $scope.formats = ['dd-MMMM-yyyy','yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[1];
  $scope.altInputFormats = ['yyyy-MM-dd'];

  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
    {
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }
  $state.current['data'] = {
    pageTitle: $scope.user.name,
    metaKeywords: $scope.user.description,
    metaDescription: $scope.user.description
  }
});


angular.module('xMember').controller('UserViewCtrl', function ($scope, $sce, $state, user) {
  $scope.user = user;
  $state.current['data'] = {
    pageTitle: $scope.user.name,
    metaKeywords: $scope.user.description,
    metaDescription: $scope.user.description
  }
});

