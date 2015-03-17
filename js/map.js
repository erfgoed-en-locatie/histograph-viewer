---
---

var map = L.map('map', {
      //zoomControl: false
    }),
    color = 'rgba({{ site.data.style.color }}, 1)',
    tileUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  	attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains = 'abcd',
    pointStyle = {},
    lineStyle = {
      color: color,
      weight: 3,
      opacity: 0.65
    },
    tileLayer = L.tileLayer(tileUrl, {
      subdomains: subdomains,
      attribution: attribution,
      minZoom: 4, maxZoom: 18,
      opacity: 1
    }).addTo(map),
    geojsonLayers = L.featureGroup().addTo(map),
    geometryTypeOrder = [
      "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection"
    ];

map.zoomControl.setPosition('topright');
map.setView([52.2808, 5.4918], 9);

function fitMapBounds() {
  fitBounds(geojsonLayers.getBounds());
}

function fitBounds(bounds) {
  var width = document.getElementById("sidebar-container").offsetWidth;
  map.fitBounds(bounds, {
    paddingTopLeft: [width, 0]
  });
}
