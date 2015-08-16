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
  'maptabs',
  function($scope, $q, $timeout, $window, pops, maptabs) {
    
    var geocoder = new google.maps.Geocoder()

    $scope.yes = true

    $scope.pops = pops.getPops()
    $scope.connections = pops.getConnections()
    $scope.maptabs = maptabs.getTabs()

    // safety limit for recursion loop
    $scope.retry = 0
    $scope.retryLimit = 10

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
                    label: pop.id,
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
            // $scope.connectMarkers()
            $scope.showConnectButton = true
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

        var promise = $q.all(null)

        $scope.displayConnections = []

        angular.forEach($scope.connections, function(connection, id) {
          connection.id = id

          // TODO: modularize callback hell
          promise = promise.then(function(){
            return $q(function(resolve) {
              return $scope.getPopLocation(connection.start).then(function(start){
                return $scope.getPopLocation(connection.finish).then(function(finish){
                  return $timeout(function(){
                    return $scope.drawLine(start,finish).then(function(line){
                      connection.line = line
                      connection.displayMiles = Math.round(line.distance.miles)
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
          geocoder.geocode({'location': location}, function(results, status) {
            if(status === 'OVER_QUERY_LIMIT'){
              if($scope.retry < $scope.retryLimit){
                // pause and try again recursively
                console.log('api query limit. taking a nap.')
                $timeout(function(){
                  $scope.retry++
                  resolve($scope.getLocationAddress(location))
                },1200)
              } else {
                console.log('max retry')
                reject(new Error('over query limit: maximum retry attempts'))
              }
            } else if(!results || !results.length){
              reject(new Error('no results'))
            } else if (status !== 'OK'){
              reject(new Error(status))
            } else {
              if(results[1]){
                location.address = results[1].formatted_address
              } else {
                location.address = results[0].formatted_address
              }
              resolve(location.address)
            }
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
        geocoder.geocode( { 'address': address}, function(results, status) {
          if(status === 'OVER_QUERY_LIMIT'){
            if($scope.retry < $scope.retryLimit){
              // pause and try again recursively
              console.log('api query limit. taking a nap.')
              $timeout(function(){
                $scope.retry++
                resolve($scope.getAddressLocation(address))
              },1200)
            } else {
              console.log('max retry')
              reject(new Error('over query limit: maximum retry attempts'))
            }
          } else if(!results || !results.length){
            reject(new Error('no results'))
          } else if (status !== 'OK'){
            reject(new Error(status))
          } else {
            var location = results[0].geometry.location
            location.address = results[0].formatted_address || address
            resolve(location)
          }
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
          strokeColor: options.color || '#000000',
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
          console.log('Your closest POP is '+pop.name)
          $scope.closestPop = pop
          $scope.pathLines = []
          $scope.drawLine($scope.client.location,$scope.closestPop.location,{
            color: '#e21b24',
            weight: 4
          }).then(function(line){
              $scope.pathLines.push(line)
              $scope.clientMarked = true
              // default to closest.
              $scope.server = $scope.closestPop
              
              // listen for change
              $scope.unWatchServer = $scope.$watch('server.id',function(id){
                
                $scope.server = $scope.pops[id]
                $scope.server.id = id

                $scope.routeDestination($scope.closestPop,$scope.server).then(function(){
                  // do something

                  // $scope.unWatchServer()
                })
              })
          })
        })
      })
    }

    $scope.routeDestination = function(startPop,endPop){
      // write some code here
      return $q(function(resolve) {
        
        console.log($scope.pathLines)

        var promise = $q.all(null)

        angular.forEach($scope.connections, function(connection, id) {
          promise = promise.then(function(){
            return $q(function(resolve) {

            })
          })
        })


        resolve()
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
      if($scope.unWatchServer){
        $scope.unWatchServer()
      }
      $scope.client = {}
      $scope.server = {}
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
