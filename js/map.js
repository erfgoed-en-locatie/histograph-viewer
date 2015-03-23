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
      fillColor: color,
      fill: true,
      radius: 9,
      opacity: 0.95
    },

    fadedPointStyle = {
      color: color,
      fillColor: color,
      fill: true,
      radius: 7,
      opacity: 0.25
    },

    lineStyle = {
      color: color,
      fill: false,
      weight: 3,
      opacity: 0.95
    },

    fadedLineStyle = {
      color: color,
      fill: false,
      weight: 2,
      opacity: 0.25
    },

    tileLayer = L.tileLayer(tileUrl, {
      subdomains: subdomains,
      attribution: attribution,
      opacity: 1
    }).addTo(map),
    featureGroups = L.featureGroup().addTo(map),
    geometryTypeOrder = [
      "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection"
    ];

map.zoomControl.setPosition('topright');
map.setView([52.2808, 5.4918], 9);

function fitMapBounds() {
  fitBounds(featureGroups.getBounds());
}

function fitBounds(bounds) {
  var width = document.getElementById("sidebar-container").offsetWidth;
  map.fitBounds(bounds, {
    paddingTopLeft: [width, 0]
  });
}
