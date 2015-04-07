'use strict';

var React = require('react');
var L = require('leaflet');

module.exports = React.createClass({
  render: function() {
    return (
      <div id='map' />
    );
  },

  componentDidUpdate: function() {
    //this.fitBounds(this.conceptLayer.getBounds());
  },

  componentDidMount: function() {
    var tileUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
    var attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
    var subdomains = 'abcd';
    var map = L.map(React.findDOMNode(this).id, {
      minZoom: 4, maxZoom: 18
    });
    var tileLayer = L.tileLayer(tileUrl, {
      subdomains: subdomains,
      attribution: attribution,
      opacity: 1
    }).addTo(map);
    var conceptLayer = L.featureGroup().addTo(map);

    map.zoomControl.setPosition('topright');
    map.setView([52.2808, 5.4918], 9);

    // TODO: use state?
    this.map = map;
    this.tileLayer = tileLayer;
    this.conceptLayer = conceptLayer;
  },

  getConceptLayer: function() {
    return this.conceptLayer;
  },

  fitBounds: function(bounds) {
    this.map.fitBounds(bounds, {
      paddingTopLeft: [this.props.sidebarWidth, 0]
    });
  }

});


// var map = L.map('map', {
//       //zoomControl: false
//       minZoom: 4, maxZoom: 18
//     }),
//     color = 'rgba({{ site.data.style.color }}, 1)',
//     tileUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
//     attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
//     subdomains = 'abcd',
//
//     defaultStyle = {
//       point: {
//         color: color,
//         fillColor: color,
//         radius: 9,
//         opacity: 0.95
//       },
//       line: {
//         color: color,
//         weight: 3,
//         opacity: 0.95,
//         fillOpacity: 0.05
//       }
//     },
//
//     fadedStyle = {
//       point: {
//         color: color,
//         fillColor: color,
//         radius: 7,
//         opacity: 0.25
//       },
//       line: {
//         color: color,
//         weight: 2,
//         opacity: 0.25,
//         fillOpacity: 0
//       }
//     },
//
//     tileLayer = L.tileLayer(tileUrl, {
//       subdomains: subdomains,
//       attribution: attribution,
//       opacity: 1
//     }).addTo(map),
//     geometryTypeOrder = [
//       "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection"
//     ];
//
// map.zoomControl.setPosition('topright');
// map.setView([52.2808, 5.4918], 9);
//
// function fitBounds(bounds) {
//   var width = document.getElementById("sidebar-container").offsetWidth;
//   map.fitBounds(bounds, {
//     paddingTopLeft: [width, 0]
//   });
// }
