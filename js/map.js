---
---

var map = L.map('map', {
      //zoomControl: false
      minZoom: 4, maxZoom: 16
    }),
    color = 'rgba({{ site.data.style.color }}, 1)',
    tileUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  	attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains = 'abcd',

    pointStyle = {
      color: color,
      stroke: true,
      fillColor: color,
      fill: true,
      radius: 9,
      opacity: 0.95
    },

    fadedPointStyle = {
      color: color,
      stroke: true,
      fillColor: color,
      fill: true,
      radius: 7,
      opacity: 0.25
    },

    faded2PointStyle = {
      stroke: false,
      fill: false
    },

    lineStyle = {
      color: color,
      fill: true,
      stroke: true,
      weight: 3,
      opacity: 0.95,
      fillOpacity: 0.05
    },

    fadedLineStyle = {
      color: color,
      fill: true,
      stroke: true,
      weight: 2,
      opacity: 0.25,
      fillOpacity: 0
    },

    faded2LineStyle = {
      stroke: false,
      fill: false
    },

    tileLayer = L.tileLayer(tileUrl, {
      subdomains: subdomains,
      attribution: attribution,
      opacity: 1
    }).addTo(map),
    geometryTypeOrder = [
      "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection"
    ];

map.zoomControl.setPosition('topright');
map.setView([52.2808, 5.4918], 9);

function fitBounds(bounds) {
  var width = document.getElementById("sidebar-container").offsetWidth;
  map.fitBounds(bounds, {
    paddingTopLeft: [width, 0]
  });
}
