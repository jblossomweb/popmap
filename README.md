## POP Map - A Network Point of Presence Map

A take home test for [Highwinds](http://www.highwinds.com/).

## [Demo]()

## Summary

You are going to build a network map using the Google Maps API directly, with some light functionality. You can use other libraries such as JQuery for some of the functionality, but you must access the Google Maps API with your own code, not JQuery or a plugin for JQuery. You will drop a pin onto the addresses of our network POP's ("point of presence", having servers in a data center), draw lines between them to represent our network map, and build a feature that interacts with this map.

The specific UI design of this exercise is up to you. We hope you take it as an opportunity to show off your UX skills. We will be evaluating the result of this exercise by the following criteria:

* How good is the JavaScript? (You should write the code as if it's a single view of a production application that could have more screens. The code you write should be something you'd want to put into production and maintain over time.)
* Are all of the requirements met? Is it bug free?
* How good is the usability?

## Requirements

### Network Map Management

1. Use the following addresses to drop pins on the map that represent our pop's:

* Switch and Data - 111 8th Ave, New York, NY 10011
* Equinix, Cage 1010 - 21715 Filigree Ct., Ashburn VA 20147
* UseNetServer Fourth Floor - 56 Marietta St., Atlanta, GA 30303
* Dallas,"1950 Stemmons Frwy"
* One Wilshire Bldg., 11th Fl, Cage C1111 - 624 S. Grand Ave, Los Angeles, CA 90017
* Equinix - 350 E Cermak Rd, Chicago, IL 60616
* 2001 Sixth Ave, Seattle WA, 98121
* 50 Northeast 9th Street, Miami, FL

2. Draw lines on the map that make the following "network" connections (assume they are all bi-directional, no need to visually represent that, just understand that point).

* NY <-> DC
* DC <-> Atlanta
* Atlanta <-> Miami
* Atlanta <-> Dallas
* Dallas <-> Miami
* Dallas <-> LA
* LA <-> Seattle
* Seattle <-> Chicago
* Chicago <-> NY

3. Display the distance between the two pop's in the map UI. Feel free to use this (http://www.movable-type.co.uk/scripts/latlong.html) to calculate the distance.

### Client/Destination routing

1. The UI should accept two street addresses as a pair. One labeled "client" and the other labeled "server". The "server" address can only be one of the street addresses of the network POP's. Drop a pin onto the map for the client address, draw a line entering the network using the closest POP to the "client", and then draw a line through the network to get to the POP with the destination server.

2. All inputted address pairs should be retained and displayed somewhere in the UI. You should be able to select the pair and have the map redraw the route.

_Bonus points (not required): Get the client to the server with as little physical distance as possible, and display on the screen proof that it was the shortest distance._

## Awknowledgement

Uses [Versatile Dashboard Theme](https://github.com/start-angular/versatile-dashboard-theme), a Boilerplate for Animated AngularJS. Starter Theme written with Bootstrap LESS. Powered by Gulp.

Also uses [ng-map](http://ngmap.github.io/) directive for AngularJS, which exposes the Google Maps API verbatim. (thus it does not count as an 'API abstraction' plugin, per the rules of this assignment)

## Installation
1. Clone this project or Download that ZIP file
2. Make sure you have [bower](http://bower.io/), [gulp](https://www.npmjs.com/package/gulp) and  [npm](https://www.npmjs.org/) installed globally
3. On the command prompt run the following commands
- cd `project-directory`
- `bower install`
- `npm install`
- `gulp serve` - For development mode
- `gulp build` - concat, minify and generate the files for deployment

### Automation tools

- [Gulp](http://gulpjs.com/)
