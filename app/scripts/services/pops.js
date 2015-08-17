'use strict'

/**
 * @ngdoc function
 * @name popmap.service:pops
 * @description
 * # pops
 * Service of popmap
 */
angular.module('popmap').service('pops', ['$q',function($q){

  var api = this
  
  // fake api (resets on page refresh)
  api.pops = {
    ny: { short: 'NY', name: 'New York', address: 'Switch and Data - 111 8th Ave, New York, NY 10011', color: '52779a'},
    dc: { short: 'DC', name: 'Washington', address: 'Equinix, Cage 1010 - 21715 Filigree Ct., Ashburn VA 20147', color: 'aaaaaa'},
    atl: { short: 'ATL', name: 'Atlanta', address: 'UseNetServer Fourth Floor - 56 Marietta St., Atlanta, GA 30303', color: 'cc223c'},
    dal: { short: 'DAL', name: 'Dallas', address: 'Dallas,"1950 Stemmons Frwy"', color: '0972b4'},
    la: { short: 'LA', name: 'Los Angeles', address: 'One Wilshire Bldg., 11th Fl, Cage C1111 - 624 S. Grand Ave, Los Angeles, CA 90017', color: 'ffbc01'},
    chi: { short: 'CHI', name: 'Chicago', address: 'Equinix - 350 E Cermak Rd, Chicago, IL 60616', color: '4ab9e6'},
    sea: { short: 'SEA', name: 'Seattle', address: '2001 Sixth Ave, Seattle WA, 98121', color: '69be3f'},
    mia: { short: 'MIA', name: 'Miami', address: '50 Northeast 9th Street, Miami, FL', color: 'f25e18'}
  }

  api.connections = {
    'ny-dc': ['ny','dc'],
    'dc-atl': ['dc','atl'],
    'atl-mia': ['atl','mia'],
    'atl-dal': ['atl','dal'],
    'dal-mia': ['dal','mia'],
    'dal-la': ['dal','la'],
    'la-sea': ['la','sea'],
    'sea-chi': ['sea','chi'],
    'chi-ny': ['chi','ny']
  }

  this.getPops = function(){
    // fake api
    return $q(function(resolve, reject) {
      resolve(api.pops)
    })
  }

  this.getPop = function(id){
    // fake api
    return $q(function(resolve, reject) {
      if(api.pops[id]){
        resolve(api.pops[id])
      } else {
        reject()
      }
    })
  }

  this.savePop = function(id,pop){
    // fake api
    return $q(function(resolve, reject) {
      if(id){
        api.pops[id] = pop
        resolve(pop)
      } else {
        reject()
      }
    })
  }

  this.deletePop = function(id){
    // fake api
    return $q(function(resolve, reject) {
      if(api.pops[id]){

        // 'cascade'
        var promise = $q.all(null)
        promise = promise.then(function(){
          angular.forEach(api.connections, function(connection, cid) {
            promise = promise.then(function(){
              return $q(function(next) {
                if(connection && connection.indexOf(id) > -1){
                  api.deleteConnection(cid).then(next)
                } else {
                  next()
                }
              })
            })
          })
        })
        
        return promise.then(function(){
          // now delete the pop
          delete api.pops[id]
          resolve()
        })
      } else {
        reject()
      }
    })
  }

  this.getConnections = function(){
    // fake api
    return $q(function(resolve, reject) {
      normalizeConnections(api.connections).then(function(connections){
        resolve(connections)
      })
    })
  }

  this.getConnection = function(id){
    // fake api
    return $q(function(resolve, reject) {
      if(api.connections[id]){
        var connections = {}
        connections[id] = api.connections[id]

        return normalizeConnections(connections).then(function(normalized){
          resolve(normalized[id])
        })
      } else {
        reject()
      }
    })
  }

  this.saveConnection = function(id,start,finish){
    // fake api
    return $q(function(resolve, reject) {
      if(id){
        api.deleteConnection(id).then(function(){
          api.connections[start+'-'+finish] = [start,finish]
          resolve(api.connections[start+'-'+finish])
        })
      } else {
        reject()
      }
    })
  }

  this.deleteConnection = function(id){
    // fake api
    return $q(function(resolve, reject) {
      if(id){
        delete api.connections[id]
        resolve()
      } else {
        reject()
      }
    })
  }

  var normalizeConnections = function(connections){
    if(!connections) {
      var connections = api.connections
    }

    var normalized = {}
    return api.getPops().then(function(pops){
      var promise = $q.all(null)
      angular.forEach(connections, function(connection, id) {
        
        promise = promise.then(function(){
          return $q(function(resolve,reject) {
            if(!pops[connection[0]] || !pops[connection[1]]){
              // console.log('CAUGHT ERROR')
              resolve()
            } else {
              pops[connection[0]].id = connection[0]
              pops[connection[1]].id = connection[1]

              normalized[id] = {
                id: id,
                start: pops[connection[0]],
                finish: pops[connection[1]]
              }
              resolve()
            }
          })
        })

      })
      return promise.then(function(){
        return $q(function(resolve) {
          resolve(normalized)
        })
      })
    })
  }

}])