'use strict'

/**
 * @ngdoc home
 * @name popmap
 * @description
 * # popmap
 *
 * Main module of the application.
 */
 angular
 .module('popmap', [
    'ui.router',
    'snap',
    'ngAnimate',
    'ngMap'
    ])
 .config(function($stateProvider, $urlRouterProvider) {

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
.controller('MapCtrl', function($scope, $timeout) {
    var geocoder = new google.maps.Geocoder()
    //TODO: pull out to factory
    $scope.addresses = [
      'Switch and Data - 111 8th Ave, New York, NY 10011',
      'Equinix, Cage 1010 - 21715 Filigree Ct., Ashburn VA 20147',
      'UseNetServer Fourth Floor - 56 Marietta St., Atlanta, GA 30303',
      'Dallas,"1950 Stemmons Frwy"',
      'One Wilshire Bldg., 11th Fl, Cage C1111 - 624 S. Grand Ave, Los Angeles, CA 90017',
      'Equinix - 350 E Cermak Rd, Chicago, IL 60616',
      '2001 Sixth Ave, Seattle WA, 98121',
      '50 Northeast 9th Street, Miami, FL'
    ]
    $scope.toggleBounce = function() {
      if (this.getAnimation() != null) {
        this.setAnimation(null)
      } else {
        this.setAnimation(google.maps.Animation.BOUNCE)
      }
    }
    var iterator=0
    var markersDropped = false
    $scope.addMarkers = function() {
      if(!markersDropped){
        for (var i=0; i<$scope.addresses.length; i++) {
          $timeout(function() {
            // add a marker this way does not sync. marker with <marker> tag
            var address = $scope.addresses[iterator++]
            geocoder.geocode( { 'address': address}, function(results, status) {
              new google.maps.Marker({
                position: results[0].geometry.location,
                map: $scope.map,
                draggable: false,
                animation: google.maps.Animation.DROP
              })
            })
          }, i * 200)
        }
        markersDropped = true
      }
    }
})