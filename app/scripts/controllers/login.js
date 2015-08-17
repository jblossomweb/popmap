'use strict'

/**
 * @ngdoc function
 * @name popmap.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of popmap
 */
angular.module('popmap')
  .controller('LoginCtrl', function($scope, $location) {

  	var fakeUser = 'admin'
  	var fakePassword = 'password'

    $scope.submit = function() {

    	// hardcoded login for demo (normally this is a service)
    	if($scope.user == fakeUser && $scope.password == fakePassword){
    		$location.path('/dashboard')
    	} else {
    		$scope.showForgot = true
    	}

      return false
    }

    $scope.demoLogin = function() {
    	alert('Demo: "admin"/"password"')
    	$scope.user = fakeUser
    	$scope.password = fakePassword
    }

  })
