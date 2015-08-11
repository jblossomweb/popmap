'use strict';

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

      $location.path('/dashboard');

      return false;
    }

  });
