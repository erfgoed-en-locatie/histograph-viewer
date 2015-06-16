'use strict';

var React = require('react');
var L = require('leaflet');
var ConceptSimple = require('./concept-simple');
var ConceptDetails = require('./concept-details');
var Message = require('./message');

module.exports = React.createClass({

  getInitialState: function() {
    var feature = this.props.feature;
    var sortedNames = this.sortNames(feature.properties.pits);
    var selectedName = sortedNames[0].name;
    var selectedNames = sortedNames.slice(0, 4).map(function(name) { return name.name; });
    var selectedNamesSuffix;

    if (selectedNames.length > 1) {
      var namesLengthDiff = sortedNames.length - selectedNames.length;
      var namesPlurSing = namesLengthDiff == 1 ? "name" : "names";
      selectedNamesSuffix = sortedNames.length > selectedNames.length ? " and " + namesLengthDiff + " other " +  namesPlurSing : "";
    }

    var sources = feature.properties.pits
      .map(function(pit) { return pit.source; })
      .unique();

    return {
      sources: sources,
      names: {
        name: selectedName,
        names: sortedNames,
        selected: selectedNames,
        suffix: selectedNamesSuffix
      }
    };
  },

  sortNames: function(pits) {
    var names = pits.map(function(pit) { return pit.name; }),
        counts = {};

    for (var k = 0, j = names.length; k < j; k++) {
      counts[names[k]] = (counts[names[k]] || 0) + 1;
    }

    return Object.keys(counts).map(function(name) {
      return {
        name: name,
        count: counts[name]
      };
    }).sort(function(a, b) {
      return b.count - a.count;
    });
  },

  render: function() {
    var highlighted = this.props.route.concept.highlighted.getValue();
    var selected = this.props.route.concept.selected.getValue();
    var className = 'concept';
    if (highlighted != -1 && highlighted != this.props.index) {
      className += ' faded';
    }

    var conceptContent;
    if (selected == -1) {
      conceptContent = <ConceptSimple sources={this.state.sources} names={this.state.names}
          type={this.props.feature.properties.type} showDetails={this.details} />;
    } else {
      conceptContent = <ConceptDetails sources={this.state.sources} names={this.state.names}
          feature={this.props.feature} />;
    }

    return (
      <li className={className} onClick={this.zoom} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        <div className='side-padding'>
          <h5>
            <span>{this.state.names.name}</span>
            <span className='type-header'>{this.props.feature.properties.type.replace("hg:", "")}</span>
          </h5>
        </div>
        {conceptContent}
      </li>
    );
  },

  mouseEnter: function() {
    this.props.route.concept.highlighted.set(this.props.index);
  },

  mouseLeave: function() {
    var highlighted = this.props.route.concept.highlighted.getValue();
    if (highlighted == this.props.index) {
      this.props.route.concept.highlighted.set(-1);
    }
  },

  details: function() {
    this.props.map.fitBounds(this.featureGroup.getBounds());
    this.props.route.concept.selected.set(this.props.index);
  },

  zoom: function(params) {
    this.props.route.hidden.set(false);
    this.props.map.fitBounds(this.featureGroup.getBounds());
  },

  componentDidMount: function() {
    var feature = this.props.feature;

    this.featureGroup = L.featureGroup();

    feature.geometry.geometries.map(function(geometry, geometryIndex) {
      var hgid,
          pitIndex;
      for (pitIndex = 0; pitIndex < feature.properties.pits.length; pitIndex++) {
        if (feature.properties.pits[pitIndex].geometryIndex == geometryIndex) {
          hgid = feature.properties.pits[pitIndex].hgid;
          break;
        }
      }

      return {
        type: "Feature",
        properties: {
          conceptIndex: this.props.index,
          geometryIndex: geometryIndex,
          pitIndex: pitIndex,
          hgid: hgid
        },
        geometry: geometry
      };
    }.bind(this)).sort(function(a, b) {
      return geometryTypeOrder.indexOf(b.geometry.type) - geometryTypeOrder.indexOf(a.geometry.type);
    })
    .forEach(function(feature) {
      var geojson = L.geoJson(feature, {
        geometryType: feature.geometry.type,
        style: defaultStyle.line,
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, defaultStyle.point);
        },
        onEachFeature: function(feature, layer) {
          // layer.on('mouseover', function(e) {
          //   this.props.route.concept.highlighted.set(feature.properties.conceptIndex);
          // }.bind(this));
          //
          // layer.on('mouseout', function(e) {
          //   this.props.route.concept.highlighted.set(-1);
          // }.bind(this));

          layer.on('dblclick', function(e) {
            this.details();
          }.bind(this));

          layer.on('click', function(e) {
            // TODO: check if single concept is selected
            this.props.route.concept.highlighted.set(feature.properties.conceptIndex);

            // TODO: fix -60 hack!
            document.getElementById('concepts-box').scrollTop = React.findDOMNode(this).offsetTop - 60;
          }.bind(this));
        }.bind(this)
      });
      this.featureGroup.addLayer(geojson);
    }.bind(this));

    this.addLayer();
  },

  componentDidUpdate: function() {
    var highlightIndex = this.props.route.concept.highlighted.getValue();
    var highlight = highlightIndex == -1 || highlightIndex == this.props.index;
    this.featureGroup.getLayers().forEach(function(layer) {
      // TODO:
      // if (layer.options.geometryType == "Point") {
      // } else {
      //
      // }
      if (highlight) {
        layer.setStyle(defaultStyle.line);
      } else {
        layer.setStyle(fadedStyle.line);
      }
    });
  },

  addLayer: function() {
    this.props.map.getConceptLayer().addLayer(this.featureGroup);
    // this.featureGroup.getLayers().forEach(function(layer) {
    //   var hgid = layer.getLayers()[0].feature.properties.hgid;
    //   this.props.pitLayers[hgid] = {
    //     layer: layer,
    //     featureGroup: this.featureGroup
    //   };
    // }.bind(this));
  },

  removeLayer: function() {
    // // Remove item's GeoJSON layer from Leaflet map
    this.props.map.getConceptLayer().removeLayer(this.featureGroup);


    // this.featureGroup.getLayers().forEach(function(layer) {
    //   var hgid = layer.getLayers()[0].feature.properties.hgid;
    //   delete this.props.pitLayers[hgid];
    // }.bind(this));
  },

  componentWillUnmount: function() {
    this.removeLayer();
  }
});