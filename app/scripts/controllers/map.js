'use strict'

/**
 * @ngdoc function
 * @name popmap.controller:MapCtrl
 * @description
 * # MainCtrl
 * Controller of popmap
 */
angular.module('popmap').controller('MapCtrl', [
  '$scope',
  '$q',
  '$timeout',
  '$window',
  'pops',
  'geocoder',
  'dijkstras',
  'maptabs',
  function($scope, $q, $timeout, $window, pops, geocoder, dijkstras, maptabs) {
    pops.getPops().then(function(p){ $scope.pops = p })
    pops.getConnections().then(function(c){ $scope.connections = c })
    $scope.maptabs = maptabs.getTabs()

    $scope.routeLineOpts = {
      color: '#e21b24',
      weight: 4,
      opacity: 1
    }

    $scope.defaultColor = 'e6595d'

    // hacky but necessary
    if($window.innerWidth > 480){
      $scope.mapZoom = 3
      $scope.smallScreen = false
    } else {
      $scope.mapZoom = 2
      $scope.smallScreen = true
    }

    $scope.$watch('map',function(map){
      $scope.originalCenter = map.getCenter()
      $scope.originalZoom = map.getZoom()

      // map click listener
      $scope.addMarkerListener = google.maps.event.addListener($scope.map, 'click', function(event){
        $scope.addMarkers()
      })
    })
    

    $scope.toggleBounce = function() {
      if (this.getAnimation() != null) {
        this.setAnimation(null)
      } else {
        this.setAnimation(google.maps.Animation.BOUNCE)
      }
    }

    $scope.addMarkers = function() {
      if(!$scope.markersDrop){
        $scope.markersDrop = true
        google.maps.event.removeListener($scope.addMarkerListener)
        var promise = $q.all(null)

        $scope.displayLocations = []

        angular.forEach($scope.pops, function(pop, id) {
          pop.id = pop.id || id
          promise = promise.then(function(){
            return $q(function(resolve) {
              return $scope.getPopLocation(pop).then(function(location){
                location.pop = pop
                return $timeout(function(){
                  return $scope.markLocation(location,{
                    title: pop.name,
                    label: {
                      text: pop.id.toUpperCase(),
                      color: 'black',
                      fontSize: '6px'
                    },
                    icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|'+pop.color
                  }).then(function(marker){
                    location.marker = marker
                    $scope.displayLocations.push(location)
                    resolve(marker)
                  })
                },250)
              })
            })
          })
        })

        promise.then(function(){
          return $timeout(function(){
            $scope.markersDropped = true
            $scope.showConnectButton = true
            // map click listener
				    $scope.connectMarkersListener = google.maps.event.addListener($scope.map, 'click', function(event){
				      $scope.connectMarkers()
				    })
          // },1250)
           },500)
          
        })
      }
    }

    $scope.connectMarkers = function() {
      $scope.showConnectButton = false
      $scope.showConnections = true
      
      // gross
      $scope.maptabs[1].active = false
      $scope.maptabs[2].active = true
      $scope.maptabs[3].active = false

      if($scope.markersDropped && !$scope.markersConnect){
        $scope.markersConnect = true

        google.maps.event.removeListener($scope.connectMarkerListener)

        var promise = $q.all(null)

        $scope.displayConnections = []

        angular.forEach($scope.connections, function(connection, id) {
          connection.id = id

          if(!connection.start.connections) connection.start.connections = {}
          if(!connection.finish.connections) connection.finish.connections = {}

          // TODO: modularize callback hell
          promise = promise.then(function(){
            return $q(function(resolve) {
              return $scope.getPopLocation(connection.start).then(function(start){
                return $scope.getPopLocation(connection.finish).then(function(finish){
                  return $timeout(function(){
                    return $scope.drawLine(start,finish).then(function(line){
                      connection.line = line
                      connection.displayMiles = Math.round(line.distance.miles)
                      connection.start.connections[connection.id] = connection
                      connection.finish.connections[connection.id] = connection
                      $scope.displayConnections.push(connection)
                      resolve(line)
                    })
                  },250)
                })
              })
            })
          })
        })
        return promise.then(function(){
          $scope.markersConnected = true
          $scope.initForm()
          return promise
        })
      }
    }

    $scope.getLocationAddress = function(location){
      return $q(function(resolve, reject) {
        if(location.address){
          // save an api call if already geocoded
          resolve(location.address)
        } else {
          // reverse geocode the location 
					geocoder.getAddress(location).then(function(address){
						resolve(address)
					})
        }
      })
    }

    $scope.getPopLocation = function(pop){
      return $q(function(resolve, reject) {
        if(pop.location){
          // save an api call if already geocoded
          resolve(pop.location)
        } else {
          // geocode the address
          $scope.retry = 0
          $scope.getAddressLocation(pop.address).then(function(location){
            pop.location = location
            resolve(pop.location)
          })
        }
      })
    }

    $scope.getClickedLocation = function(event){
      return $q(function(resolve) {
        var location = event.latLng
        $scope.getLocationAddress(location).then(function(address){
          location.address = address
          resolve(location)
        })
      })
    }

    $scope.getAddressLocation = function(address){
      return $q(function(resolve, reject) {
				geocoder.getLocation(address).then(function(location){
					resolve(location)
				})
      })
    }

    $scope.markLocation = function(location,options){
      if(!options) var options = {}
      return $q(function(resolve) {
        resolve(new google.maps.Marker({
          position: location,
          map: $scope.map,
          draggable: options.draggable || false,
          animation: google.maps.Animation.DROP,
          title: options.title || null,
          label: options.label || null,
          icon: options.icon || null
        }))
      })
    }

    $scope.drawLine = function(start,finish,options){
      if(!options) var options = {}
      return $q(function(resolve) {
        var line = new google.maps.Polyline({
          strokeColor: options.color || '#333333',
          strokeOpacity: options.opacity || 0.7,
          strokeWeight: options.weight || 2,
          map: $scope.map
        })
        var path = line.getPath()
        path.push(start)
        path.push(finish)
        $scope.getDistance(start,finish).then(function(meters){
          line.distance = $scope.convertDistanceFromMeters(meters)
          resolve(line)
        })
      })
    }

    $scope.convertDistanceFromMeters = function(meters){
      return {
        meters: meters,
        kilometers: meters / 1000,
        miles: 0.000621371 * meters
      }
    }

    $scope.getDistance = function(start,finish){
      return $q(function(resolve, reject) {
        var distance = google.maps.geometry.spherical.computeDistanceBetween(start,finish)
        resolve(distance)
      })
    }

    $scope.getClosestPop = function(location){
      var distances = {}
      var closest = -1
      var promise = $q.all(null)
      angular.forEach($scope.pops, function(pop, id) {
        promise = promise.then(function(){
          return $q(function(resolve) {
            return $scope.getDistance(location,pop.location).then(function(meters){
              var distance = $scope.convertDistanceFromMeters(meters)
              distances[id] = distance
              if ( closest == -1 || distance.meters < distances[closest].meters ) {
                closest = id
              }
              resolve()
            })
          })
        })
      })
      return promise.then(function(){
        return $q(function(resolve) {
          var closestPop = $scope.pops[closest]
          closestPop.id = closest
          resolve(closestPop)
        })  
      })
    }

    $scope.markClient = function(location){
      $scope.client.location = location
      $scope.clientMark = true

      // gross
      $scope.maptabs[1].active = false
      $scope.maptabs[2].active = false
      $scope.maptabs[3].active = true

      if($scope.unWatchClient){
        $scope.unWatchClient()
      }
      $scope.showClientInput = false
      $scope.showServerInput = true
      google.maps.event.removeListener($scope.clientMarkListener)
      $scope.map.setCenter(location)
      $scope.markLocation(location,{title: location.address}).then(function(marker){
        $scope.client.marker = marker
        $scope.map.setZoom($scope.originalZoom + 2)
        $scope.getClosestPop(location).then(function(pop){
          $scope.closestPop = pop
          $scope.pathLines = []
          $scope.drawLine($scope.client.location,$scope.closestPop.location,$scope.routeLineOpts).then(function(line){
          		
          		// fudge a fake pop for display purposes
          		$scope.client.location.pop = {
          			name: $scope.client.location.city ? $scope.client.location.city.long_name || $scope.client.location.city : $scope.client.location.asTyped,
          			short: $scope.client.location.city ? $scope.client.location.city.short_name || $scope.client.location.city : $scope.client.location.asTyped,
          			color: $scope.defaultColor
          		}

          		line.start = $scope.client.location
          		line.finish = $scope.closestPop.location
              $scope.pathLines.push(line)
              $scope.clientMarked = true

              // default to closest.
              $scope.setServer($scope.closestPop.id)

              $scope.popListeners = {}
              angular.forEach($scope.pops, function(pop, id) {
              	var marker = pop.location.marker
              	$scope.popListeners[id] = marker.addListener('click', function() {
              		$scope.setServer(id)
              	})
              })
          })
        })
      })
    }

    $scope.setServer = function(id){
    	$scope.serverId = id
    	
	    $scope.map.setZoom($scope.originalZoom)
      $scope.map.setCenter($scope.originalCenter)
    	
    	$scope.clearPathLines().then(function(){
    		return $scope.drawLine($scope.client.location,$scope.closestPop.location,$scope.routeLineOpts).then(function(line){

    			line.start = $scope.client.location
    			line.finish = $scope.closestPop.location

    			$scope.pathLines.push(line)
    			$scope.clientMarked = true
    			$scope.server = $scope.pops[id]
          $scope.server.id = id

          return $scope.routeDestination($scope.closestPop,$scope.server).then(function(route){
            return $scope.connectRoute(route).then(function(totalMiles){
            	$scope.totalMiles = Math.round(totalMiles)
            	return true
            })
          })
    		})
    	})
    }

    $scope.routeDestination = function(startPop,endPop){
      return $q(function(resolve) {
				var g = new dijkstras()
        var promise = $q.all(null)
        
        angular.forEach($scope.pops, function(pop, id) {
          promise = promise.then(function(){
            return $q(function(resolve) {
            	var lines = {}
            	var promise = $q.all(null)
            	angular.forEach(pop.connections, function(connection, id) {
            		var lid = null
            		if(connection.start.id == pop.id) {
            			lid = connection.finish.id
            		} else if(connection.finish.id == pop.id) {
            			lid = connection.start.id
            		}
            		lines[lid] = connection.line.distance.miles
            	})
            	return promise.then(function(){
            		g.addVertex(id, lines)
			          resolve()
			        })
            })
          })
        })
        return promise.then(function(){
        	var route = g.shortestPath(startPop.id, endPop.id).concat([startPop.id]).reverse()
          resolve(route)
        })
      })
    }

    $scope.connectRoute = function(route) {

    	var promise = $q.all(null)
      $scope.pathLines = $scope.pathLines || []

      var prev = route[0]

      angular.forEach(route, function(popId, i) {
      	promise = promise.then(function(){
          return $q(function(resolve) {
          	if(i > 0){

          		var start = $scope.pops[prev].location
          		start.id = prev

          		var finish = $scope.pops[popId].location
          		finish.id = popId

          		return $timeout(function(){
			          return $scope.drawLine(start,finish,$scope.routeLineOpts).then(function(line){
			          	line.start = start
			          	line.finish = finish
			          	line.displayMiles = Math.round(line.distance.miles)

			          	$scope.pathLines.push(line)
			            prev = popId
			            resolve()
			          })
			        },250)
          	} else {
          		prev = popId
          		resolve()
          	}
          })
        })
      })
      return promise.then(function(){
        $scope.pathLines[0].displayMiles = Math.round($scope.pathLines[0].distance.miles)
        var totalMiles = 0
        var promise = $q.all(null)
        angular.forEach($scope.pathLines, function(line) {
	      	promise = promise.then(function(){
	          return $q(function(resolve) {
	          	totalMiles = totalMiles + line.distance.miles
	          	resolve()
	          })
	        })
	      })

        return promise.then(function(){
        	return $q(function(resolve) {
        		$scope.totalMiles = totalMiles
        		resolve(totalMiles)
        	})
        })
      })
    }

    $scope.clearPathLines = function(){
      var promise = $q.all(null)
      angular.forEach($scope.pathLines, function(line) {
        promise = promise.then(function(){
          line.setMap(null)
        })
      })
      return promise.then(function(){
        $scope.pathLines = []
      })
    }

    $scope.initForm = function(){
      if($scope.client && $scope.client.marker){
        $scope.client.marker.setMap(null)
      }
      if($scope.unWatchClient){
        $scope.unWatchClient()
      }
      if($scope.popListeners){
        angular.forEach($scope.popListeners, function(listener) {
          google.maps.event.removeListener(listener)
        })
      }
      $scope.client = {}
      $scope.server = {}
      delete $scope.serverId
      delete $scope.closestPop

      $scope.showClientInput = true
      $scope.showServerInput = false

      $scope.clearPathLines().then(function(){

        $scope.map.setZoom($scope.originalZoom)
        $scope.map.setCenter($scope.originalCenter)

        // map click listener
        $scope.clientMarkListener = google.maps.event.addListener($scope.map, 'click', function(event){
          $scope.getClickedLocation(event).then($scope.markClient)
        })
        // address field model listener
        $scope.unWatchClient = $scope.$watch('client.address',function(address){
          $scope.getAddressLocation(address).then($scope.markClient)
        })
      })
    }

}])
