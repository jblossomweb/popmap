'use strict'

/**
 * @ngdoc function
 * @name popmap:config
 * @description
 * # MainCtrl
 * config for popmap
 */
angular.module('popmap').config(function($stateProvider, $urlRouterProvider) {

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