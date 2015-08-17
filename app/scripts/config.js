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
    .state('edit', {
        url: '/edit',
        parent: 'dashboard',
        templateUrl: 'views/dashboard/edit.html'
    })
    .state('editpop', {
        url: '/edit/pop/{id}',
        parent: 'dashboard',
        templateUrl: 'views/dashboard/edit/pop.html'
    })
    .state('newpop', {
        url: '/edit/pops/new',
        parent: 'dashboard',
        templateUrl: 'views/dashboard/edit/pop.html'
    })
    .state('editconnection', {
        url: '/edit/connection/{id}',
        parent: 'dashboard',
        templateUrl: 'views/dashboard/edit/connection.html'
    })
    .state('newconnection', {
        url: '/edit/connections/new',
        parent: 'dashboard',
        templateUrl: 'views/dashboard/edit/connection.html'
    })

})