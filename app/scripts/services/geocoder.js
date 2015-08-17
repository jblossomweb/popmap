'use strict'

/**
 * @ngdoc function
 * @name popmap.service:geocoder
 * @description
 * # geocoder
 * Service of popmap
 */
angular.module('popmap').service('geocoder', ['$q', '$timeout', function($q,$timeout){

  var service = this
  var geocoder = new google.maps.Geocoder()

  // safety limit for recursion loop
  var retry = 0
  var retryLimit = 10

  service.getLocation = function(address){
    return service.geocode({'address': address}).then(function(results){
      return $q(function(resolve, reject) {
        var location = results[0].geometry.location
        location.address = results[0].formatted_address || address
        location.asTyped = address
        location.zip = results[0].address_components[0]
        location.city = results[0].address_components[1]
        location.state = results[0].address_components[2]
        resolve(location)
      })
    },function(){
      return $q(function(resolve, reject) {
        reject()
      })
    })
  }

  service.getAddress = function(location){
    return service.geocode({'location': location}).then(function(results){
      return $q(function(resolve, reject) {
        if(results[1]){
          location.address = results[1].formatted_address
          location.zip = results[1].address_components[0]
          location.city = results[1].address_components[1]
          location.state = results[1].address_components[2]
        } else {
          location.address = results[0].formatted_address
          location.zip = results[0].address_components[0]
          location.city = results[0].address_components[1]
          location.state = results[0].address_components[2]
        }
        resolve(location.address)
      })
    })
  }
  
  service.geocode = function(query,isRetry){
    if(!isRetry) retry = 0
    return $q(function(resolve, reject) {
      geocoder.geocode(query, function(results, status) {
        if(status === 'OVER_QUERY_LIMIT'){
          if(retry < retryLimit){
            // pause and try again recursively
            console.log('api query limit. taking a nap.')
            $timeout(function(){
              retry++
              resolve(service.geocode(query,true))
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
          resolve(results)
        }
      })
    })
  }

}])