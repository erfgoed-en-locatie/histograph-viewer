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
