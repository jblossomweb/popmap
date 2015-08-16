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
      mia: { short: 'MIA', name: 'Miami', address: '50 Northeast 9th Street, Miami, FL', color: 'f25e18'},

      // test
      // bog: { short: 'BOG', name: 'Bogota', address: 'Bogota, Colombia', color: 'ffbc01'},
      // rio: { short: 'RIO', name: 'Rio de Janeiro', address: 'Rio de Janeiro, Brazil', color: '009b3a'},
      // ba: { short: 'BA', name: 'Buenos Aires', address: 'Buenos Aires, Argentina', color: '4ab9e6'},


      // tok: { short: 'TOK', name: 'Tokyo', address: 'Tokyo, Japan', color: 'ffffff'},
      // sha: { short: 'SHA', name: 'Shanghai', address: 'Shanghai, China', color: 'd50d0d'},
      // mos: { short: 'MOS', name: 'Moscow', address: 'Moscow, Russia', color: 'd50d0d'},
      // ber: { short: 'BER', name: 'Berlin', address: 'Berlin, Germany', color: '231f20'},
      // par: { short: 'PAR', name: 'Paris', address: 'Paris, France', color: '0972b4'},
      // rom: { short: 'ROM', name: 'Rome', address: 'Rome, Italy', color: '009b3a'},
      // lon: { short: 'LON', name: 'London', address: 'London, England', color: 'cccccc'},

      // ice: { short: 'ICE', name: 'Iceland', address: 'Reykjavík, Iceland', color: 'ffffff'},
      

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
      },

      // test
      // 'mia-bog': {
      //   start: pops.mia,
      //   finish: pops.bog
      // },
      // 'bog-rio': {
      //   start: pops.bog,
      //   finish: pops.rio
      // },
      // 'rio-ba': {
      //   start: pops.rio,
      //   finish: pops.ba
      // },

      // 'ny-ice': {
      //   start: pops.ny,
      //   finish: pops.ice
      // },

      // 'ice-lon': {
      //   start: pops.ice,
      //   finish: pops.lon
      // },
      // 'lon-par': {
      //   start: pops.lon,
      //   finish: pops.par
      // },
      // 'par-rom': {
      //   start: pops.par,
      //   finish: pops.rom
      // },
      // 'par-ber': {
      //   start: pops.par,
      //   finish: pops.ber
      // },
      // 'ber-mos': {
      //   start: pops.ber,
      //   finish: pops.mos
      // },
      // 'mos-sha': {
      //   start: pops.mos,
      //   finish: pops.sha
      // },
      // 'sha-tok': {
      //   start: pops.sha,
      //   finish: pops.tok
      // },
      // 'tok-sea': {
      //   start: pops.tok,
      //   finish: pops.sea
      // },
    }
    return this.connections
  }

}])