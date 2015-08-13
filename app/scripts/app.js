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

app.factory('addresses', [function(){
  // TODO: get from an API
  return {
    NY: { address: 'Switch and Data - 111 8th Ave, New York, NY 10011'},
    DC: { address: 'Equinix, Cage 1010 - 21715 Filigree Ct., Ashburn VA 20147'},
    Atlanta: { address: 'UseNetServer Fourth Floor - 56 Marietta St., Atlanta, GA 30303'},
    Dallas: { address: 'Dallas,"1950 Stemmons Frwy"'},
    LA: { address: 'One Wilshire Bldg., 11th Fl, Cage C1111 - 624 S. Grand Ave, Los Angeles, CA 90017'},
    Chicago: { address: 'Equinix - 350 E Cermak Rd, Chicago, IL 60616'},
    Seattle: { address: '2001 Sixth Ave, Seattle WA, 98121'},
    Miami: { address: '50 Northeast 9th Street, Miami, FL'}
  }
}])

app.factory('connections', ['addresses', function(addresses){
  // TODO: get from an API
  return [
    {
      start: addresses.NY,
      finish: addresses.DC
    },
    {
      start: addresses.DC,
      finish: addresses.Atlanta
    },
    {
      start: addresses.Atlanta,
      finish: addresses.Miami
    },
    {
      start: addresses.Atlanta,
      finish: addresses.Dallas
    },
    {
      start: addresses.Dallas,
      finish: addresses.Miami
    },
    {
      start: addresses.Dallas,
      finish: addresses.LA
    },
    {
      start: addresses.LA,
      finish: addresses.Seattle
    },
    {
      start: addresses.Seattle,
      finish: addresses.Chicago
    },
    {
      start: addresses.Chicago,
      finish: addresses.NY
    }
  ]
}])

app.controller('MapCtrl', [
  '$scope',
  '$q',
  '$timeout',
  'addresses', 
  'connections', 
  function($scope, $q, $timeout, addresses, connections) {
    
    var geocoder = new google.maps.Geocoder()

    $scope.addresses = addresses
    $scope.connections = connections

    $scope.markersDrop = false
    $scope.markersDropped = false
    $scope.markersConnect = false
    $scope.markersConnected = false

    // safety limit for recursion loop
    $scope.retry = 0
    $scope.retryLimit = 10

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
        angular.forEach($scope.addresses, function(address, i) {
          promise = promise.then(function(){
            return $q(function(resolve) {
              return $scope.getLocation(address).then(function(location){
                return $timeout(function(){
                  return $scope.markLocation(location).then(function(marker){
                    resolve(marker)
                  })
                },250)
              })
            })
          })
        })

        promise.then(function(){
          $scope.markersDropped = true
          // i could fire the connect method here
          $scope.connectMarkers()
        })
      }
    }

    $scope.connectMarkers = function() {
      if($scope.markersDropped && !$scope.markersConnect){
        $scope.markersConnect = true
        var promise = $q.all(null)
        angular.forEach($scope.connections, function(connection, i) {
          promise = promise.then(function(){
            return $q(function(resolve) {
              return $scope.getLocation(connection.start).then(function(start){
                return $scope.getLocation(connection.finish).then(function(finish){
                  return $timeout(function(){
                    return $scope.drawLine(start,finish).then(function(line){
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
          return promise
        })
      }
    }

    $scope.getLocation = function(address){
      return $q(function(resolve, reject) {
        if(address.location){
          // save an api call if already geocoded
          resolve(address.location)
        } else {
          // geocode the address
          geocoder.geocode( { 'address': address.address}, function(results, status) {
            if(status === 'OVER_QUERY_LIMIT'){
              if($scope.retry < $scope.retryLimit){
                // pause and try again recursively
                console.log('api qps limit. taking a nap.')
                $timeout(function(){
                  $scope.retry++
                  resolve($scope.getLocation(address))
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
              address.location = results[0].geometry.location 
              resolve(address.location)
            }
          })
        }
      })
    }

    $scope.markLocation = function(location){
      return $q(function(resolve) {
        resolve(new google.maps.Marker({
          position: location,
          map: $scope.map,
          draggable: false,
          animation: google.maps.Animation.DROP
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
          
          line.distance = {
            meters: meters,
            kilometers: meters / 1000,
            miles: 0.000621371 * meters
          }
          console.log(Math.round(line.distance.miles) + ' miles')

          resolve(line)
        })
      })
    }

    $scope.getDistance = function(start,finish){
      return $q(function(resolve, reject) {
        var distance = google.maps.geometry.spherical.computeDistanceBetween(start,finish)
        resolve(distance)
      })
    }
}])