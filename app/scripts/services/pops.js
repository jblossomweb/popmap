'use strict'

/**
 * @ngdoc function
 * @name popmap.service:pops
 * @description
 * # pops
 * Service of popmap
 */
angular.module('popmap').service('pops', [function(){
  
  // TODO: get from an API
  this.getPops = function(){
    this.pops = {
      ny: { short: 'NY', name: 'New York', address: 'Switch and Data - 111 8th Ave, New York, NY 10011', color: '52779a'},
      dc: { short: 'DC', name: 'Washington', address: 'Equinix, Cage 1010 - 21715 Filigree Ct., Ashburn VA 20147', color: 'aaaaaa'},
      atl: { short: 'ATL', name: 'Atlanta', address: 'UseNetServer Fourth Floor - 56 Marietta St., Atlanta, GA 30303', color: 'cc223c'},
      dal: { short: 'DAL', name: 'Dallas', address: 'Dallas,"1950 Stemmons Frwy"', color: '0972b4'},
      la: { short: 'LA', name: 'Los Angeles', address: 'One Wilshire Bldg., 11th Fl, Cage C1111 - 624 S. Grand Ave, Los Angeles, CA 90017', color: 'ffbc01'},
      chi: { short: 'CHI', name: 'Chicago', address: 'Equinix - 350 E Cermak Rd, Chicago, IL 60616', color: '4ab9e6'},
      sea: { short: 'SEA', name: 'Seattle', address: '2001 Sixth Ave, Seattle WA, 98121', color: '69be3f'},
      mia: { short: 'MIA', name: 'Miami', address: '50 Northeast 9th Street, Miami, FL', color: 'f25e18'}
    }
    return this.pops
  }

  this.getConnections = function(){
    if(this.pops){
      var pops = this.pops
    } else {
      var pops = this.getPops()
      this.pops = pops
    }
    this.connections = {
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
    return this.connections
  }

}])