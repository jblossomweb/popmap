'use strict'

/**
 * @ngdoc function
 * @name popmap.controller:EditCtrl
 * @description
 * # EditCtrl
 * Controller of popmap
 */
angular.module('popmap').controller('EditCtrl', [
  '$scope',
  '$q',
  '$timeout',
  'pops',
  function($scope, $q, $timeout, pops) {

  	$scope.pops = pops.getPops()
    $scope.connections = pops.getConnections()

  }
])