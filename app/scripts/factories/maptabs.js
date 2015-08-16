'use strict'

/**
 * @ngdoc function
 * @name popmap.service:maptabs
 * @description
 * # maptabs
 * Service of popmap
 */
angular.module('popmap').factory('maptabs', [function(){

  return {
    getTabs: function(){
      return {
        1: { 
          heading: 'POPs',
          content: 'views/dashboard/map/tabs/pops.html'
        },
        2: { 
          heading: 'Conns',
          content: 'views/dashboard/map/tabs/connections.html'
        },
        3: { 
          heading: 'Routes', 
          content: 'views/dashboard/map/tabs/routes.html'
        },
      }
    }
  }
  
}])