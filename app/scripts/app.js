'use strict'

/**
 * @ngdoc home
 * @name popmap
 * @description
 * # popmap
 *
 * Main module of the application.
 */
var app = angular.module('popmap', [
  'ui.router',
  'snap',
  'ngAnimate',
  'ngMap'
])
 
app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/dashboard', '/dashboard/home')
    $urlRouterProvider.otherwise('/login')

    $stateProvider
    .state('base', {
        abstract: true,
        url: '',
        templateUrl: 'views/base.html'
    })
    .state('login', {
      url: '/login',
      parent: 'base',
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })
    .state('dashboard', {
      url: '/dashboard',
      parent: 'base',
      templateUrl: 'views/dashboard.html',
      controller: 'DashboardCtrl'
    })
    .state('home', {
        url: '/home',
        parent: 'dashboard',
        templateUrl: 'views/dashboard/home.html'
    })
    .state('map', {
        url: '/map',
        parent: 'dashboard',
        templateUrl: 'views/dashboard/map.html'
    })
    .state('reports', {
        url: '/reports',
        parent: 'dashboard',
        templateUrl: 'views/dashboard/reports.html'
    })
})

app.factory('pops', [function(){
  // TODO: get from an API
  return {
    ny: { name: 'New York', address: 'Switch and Data - 111 8th Ave, New York, NY 10011', color: '52779a'},
    dc: { name: 'Washington', address: 'Equinix, Cage 1010 - 21715 Filigree Ct., Ashburn VA 20147', color: 'aaaaaa'},
    atl: { name: 'Atlanta', address: 'UseNetServer Fourth Floor - 56 Marietta St., Atlanta, GA 30303', color: 'cc223c'},
    dal: { name: 'Dallas', address: 'Dallas,"1950 Stemmons Frwy"', color: '0972b4'},
    la: { name: 'Los Angeles', address: 'One Wilshire Bldg., 11th Fl, Cage C1111 - 624 S. Grand Ave, Los Angeles, CA 90017', color: 'ffbc01'},
    chi: { name: 'Chicago', address: 'Equinix - 350 E Cermak Rd, Chicago, IL 60616', color: '4ab9e6'},
    sea: { name: 'Seattle', address: '2001 Sixth Ave, Seattle WA, 98121', color: '69be3f'},
    mia: { name: 'Miami', address: '50 Northeast 9th Street, Miami, FL', color: 'f25e18'}
  }
}])

app.factory('connections', ['pops', function(pops){
  // TODO: get from an API
  return {
    'ny-dc': {
      start: pops.ny,
      finish: pops.dc
    },
    'dc-atl': {
      start: pops.dc,
      finish: pops.atl
    },
    'atl-mia': {
      start: pops.atl,
      finish: pops.mia
    },
    'atl-dal': {
      start: pops.atl,
      finish: pops.dal
    },
    'dal-mia': {
      start: pops.dal,
      finish: pops.mia
    },
    'dal-la': {
      start: pops.dal,
      finish: pops.la
    },
    'la-sea': {
      start: pops.la,
      finish: pops.sea
    },
    'sea-chi': {
      start: pops.sea,
      finish: pops.chi
    },
    'chi-ny': {
      start: pops.chi,
      finish: pops.ny
    }
  }
}])

app.controller('MapCtrl', [
  '$scope',
  '$q',
  '$timeout',
  'pops', 
  'connections', 
  function($scope, $q, $timeout, pops, connections) {
    
    var geocoder = new google.maps.Geocoder()

    $scope.pops = pops
    $scope.connections = connections

    // safety limit for recursion loop
    $scope.retry = 0
    $scope.retryLimit = 10

    // $scope.originalCenter = $scope.map.getCenter()

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
            resolve(results[0].geometry.location)
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
          resolve($scope.pops[closest])
        })  
      })
    }

    $scope.markClient = function(location){
      $scope.client.location = location
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
          $scope.drawLine($scope.client.location,$scope.closestPop.location,{
            color: '#e21b24',
            weight: 4
          }).then(function(line){
              $scope.pathLines.push(line)
              // default to closest.
              $scope.server = $scope.closestPop
              // listen for change
              $scope.unWatchServer = $scope.$watch('server.id',function(id){
                $scope.server = $scope.pops[id]
                $scope.server.id = id
                $scope.routeDestination($scope.closestPop,$scope.server).then(function(){
                  // do something
                  $scope.unWatchServer()
                })
              })
          })
        })
      })
    }

    $scope.routeDestination = function(startPop,endPop){
      // write some code here
      return $q(function(resolve) {
        // console.log($scope.connections)
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