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

    $scope.submit = function() {

    	// TODO: some login actions
      $location.path('/dashboard')

      return false
    }

  })
