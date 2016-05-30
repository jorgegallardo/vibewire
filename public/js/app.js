angular.module('vibewire', ['ngRoute'])
.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {

  $locationProvider.html5Mode(true).hashPrefix('!');

  //set up routes
  $routeProvider
    .when('/', {
      templateUrl: 'partials/home.html',
      controller: 'IndexController'
    })
    .when('/register', {
      templateUrl: 'partials/register.html',
      controller: 'RegisterController'
    })
    .otherwise({
      redirectTo: '/'
    });
}])

.controller('IndexController', ['$scope', function($scope) {
  $scope.name = 'Jorge';
}])

.controller('RegisterController', ['$scope', '$http', function($scope, $http) {
  $scope.name = 'Josh';

  $scope.save = function() {
    $scope.showErrorsCheckValidity = true;
    
    if ($scope.userForm.$valid) {
      alert('User saved');
      $scope.reset();
    } else {
      alert("There are invalid fields");
    }
  };
  
  $scope.reset = function() {
    $scope.user = { name: '', email: '' };
  }

  $scope.register = function() {
    var newUser = {
      firstName: $scope.firstName,
      lastName: $scope.lastName,
      email: $scope.email,
      password: $scope.password
    };

    $http.post('/register', newUser).then(function() {
      $scope.firstName = "";
      $scope.lastName = "";
      $scope.email = "";
      $scope.password = "";
      alert('Registered');
    });
  };
}])

.directive('showErrors', function ($timeout, showErrorsConfig) {
      var getShowSuccess, linkFn;
      getShowSuccess = function (options) {
        var showSuccess;
        showSuccess = showErrorsConfig.showSuccess;
        if (options && options.showSuccess != null) {
          showSuccess = options.showSuccess;
        }
        return showSuccess;
      };
      linkFn = function (scope, el, attrs, formCtrl) {
        var blurred, inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses;
        blurred = false;
        options = scope.$eval(attrs.showErrors);
        showSuccess = getShowSuccess(options);
        inputEl = el[0].querySelector('[name]');
        inputNgEl = angular.element(inputEl);
        inputName = inputNgEl.attr('name');
        if (!inputName) {
          throw 'show-errors element has no child input elements with a \'name\' attribute';
        }
        inputNgEl.bind('blur', function () {
          blurred = true;
          return toggleClasses(formCtrl[inputName].$invalid);
        });
        scope.$watch(function () {
          return formCtrl[inputName] && formCtrl[inputName].$invalid;
        }, function (invalid) {
          if (!blurred) {
            return;
          }
          return toggleClasses(invalid);
        });
        scope.$on('show-errors-check-validity', function () {
          return toggleClasses(formCtrl[inputName].$invalid);
        });
        scope.$on('show-errors-reset', function () {
          return $timeout(function () {
            el.removeClass('has-error');
            el.removeClass('has-success');
            return blurred = false;
          }, 0, false);
        });
        return toggleClasses = function (invalid) {
          el.toggleClass('has-error', invalid);
          if (showSuccess) {
            return el.toggleClass('has-success', !invalid);
          }
        };
      };
      return {
        restrict: 'A',
        require: '^form',
        compile: function (elem, attrs) {
          if (!elem.hasClass('form-group')) {
            throw 'show-errors element does not have the \'form-group\' class';
          }
          return linkFn;
        }
      };
    }
  )
  
  .provider('showErrorsConfig', function () {
    var _showSuccess;
    _showSuccess = false;
    this.showSuccess = function (showSuccess) {
      return _showSuccess = showSuccess;
    };
    this.$get = function () {
      return { showSuccess: _showSuccess };
    };
  });