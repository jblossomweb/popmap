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
  '$timeout',
  '$location',
  'pops',
  'geocoder',
  function($scope, $stateParams, $timeout, $location, pops, geocoder) {

  	$scope.id = $stateParams.id

  	$scope.consoleMsg = null

  	pops.getPop($stateParams.id).then(function(pop){
    	$scope.pop = pop
    	if($scope.pop.address){
    		$scope.centerToAddress()
    	}
  	})

  	$scope.centerToAddress = function() {
    	if($scope.pop && $scope.pop.address && $scope.map){
    		geocoder.getLocation($scope.pop.address).then(function(location){
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
    	$scope.pop.id = $scope.id
    	pops.savePop($scope.id,$scope.pop).then(function(pop){
    		$scope.centerToAddress()
    		// console.log('saved '+$scope.id)
    		$scope.consoleMsg = 'saved!'
    		$timeout(function(){
    			$scope.consoleMsg = null
    		}, 3000)
    	})
    }

    $scope.deletePop = function(){
    	if($scope.id){
    		pops.deletePop($scope.id).then(function(){
    			$scope.consoleMsg = 'deleted!'
	    		$timeout(function(){
	    			$scope.consoleMsg = null
	    		}, 3000)
	    		$location.path('dashboard/edit')
    		})
    	}
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


/**
 * @ngdoc function
 * @name popmap.controller:EditConnectionCtrl
 * @description
 * # EditConnectionCtrl
 * Controller of popmap
 */
angular.module('popmap').controller('EditConnectionCtrl', [
  '$scope',
  '$stateParams',
  '$timeout',
  '$location',
  'pops',
  function($scope, $stateParams, $timeout, $location, pops) {

  	$scope.id = $stateParams.id

  	$scope.refresh = function(){
  		pops.getPops().then(function(p){ 
	  		$scope.pops = p 
		  	pops.getConnection($scope.id).then(function(connection){
		    	$scope.connection = connection
		    	$scope.startId = connection.start.id
		    	$scope.finishId = connection.finish.id
		  	})
		  })
  	}

  	$scope.refresh()

    $scope.saveConnection = function(){
    	// talk to the service
    	if(!$scope.id){
    		// add new
    		$scope.id = $scope.startId + '-' + $scope.finishId
    	}

    	pops.saveConnection($scope.id,$scope.startId,$scope.finishId).then(function(connection){
    		$scope.consoleMsg = 'saved!'
    		$timeout(function(){
    			$scope.consoleMsg = null
    		}, 3000)
    		$location.path('dashboard/edit/connection/'+connection[0]+'-'+connection[1])
    	})
    }

    $scope.deleteConnection = function(){
    	if($scope.id){
    		pops.deleteConnection($scope.id).then(function(){
    			$scope.consoleMsg = 'deleted!'
	    		$timeout(function(){
	    			$scope.consoleMsg = null
	    		}, 3000)
	    		$location.path('dashboard/edit')
    		})
    	}
    }
  }
])