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
  '$state',
  'pops',
  function($scope, $state, pops) {
  	$scope.$state = $state
  	pops.getPops().then(function(p){ 
  		$scope.pops = p 
  		pops.getConnections().then(function(c){ 
  			$scope.connections = c 
  		})
  	})
  }
])


/**
 * @ngdoc function
 * @name popmap.controller:EditPopCtrl
 * @description
 * # EditPopCtrl
 * Controller of popmap
 */
angular.module('popmap').controller('EditPopCtrl', [
  '$scope',
  '$stateParams',
  'pops',
  'geocoder',
  function($scope, $stateParams, pops, geocoder) {

  	$scope.id = $stateParams.id

  	pops.getPop($stateParams.id).then(function(pop){
    	$scope.pop = pop
    	if($scope.pop.address){
    		$scope.centerToAddress()
    	}
  	})

  	$scope.centerToAddress = function() {
    	if($scope.pop && $scope.pop.address && $scope.map){
    		geocoder.getLocation($scope.pop.address).then(function(location){
    			// console.log('center map to '+$scope.pop.name)
    			$scope.map.setCenter(location)
    		})
    	}
    }

    $scope.savePop = function(){
    	// talk to the service
    	if(!$scope.id){
    		// add new
    		$scope.id = $scope.pop.short.toLowerCase().replace(/ /g, "-")
    	}
    	pops.savePop($scope.id,$scope.pop).then(function(pop){
    		// console.log('saved '+$scope.id)
    	})
    }

    // trim hash from hex codes
    $scope.$watch('pop.color', function() {
    	if($scope.pop && $scope.pop.color && $scope.pop.color[0] == '#'){
    		$scope.pop.color = $scope.pop.color.slice(1)
    	}
    }, true)

    $scope.$watch('pop.address', $scope.centerToAddress, true) //glitchy
    $scope.$watch('map',function(map){ if(!$scope.map) $scope.map = map })


  }
])