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

    var title = selectedName;
    var liesInPits = [];
    feature.properties.pits.forEach(function(pit) {
      var liesInIds = [];
      if (pit.relations && pit.relations['hg:liesIn']) {
        liesInIds.push(pit.relations['hg:liesIn'].map(function(relation) {
          return relation['@id'];
        })[0]);
      }

      if (pit.hairs) {
        pit.hairs.forEach(function(hair) {
          if (liesInIds.indexOf(hair['@id']) > -1 && hair.name) {
            liesInPits.push(hair);
          }
        }.bind(this));
      }
    }.bind(this));

    if (liesInPits.length > 0) {
      var liesInTitle = liesInPits[0].name
      this.props.config.viewer.suffixFilters.forEach(function(filter) {
        liesInTitle = liesInTitle.replace(filter, '').trim();
      });

      title += ', ' + liesInTitle;
    }

    if (selectedNames.length > 1) {
      var namesLengthDiff = sortedNames.length - selectedNames.length;
      var namesPlurSing = namesLengthDiff == 1 ? this.props.language.name : this.props.language.names;
      selectedNamesSuffix = sortedNames.length > selectedNames.length ? ' ' + this.props.language.and + ' ' + namesLengthDiff + ' ' + this.props.language.other + " " +  namesPlurSing.toLowerCase() : '';
    }

    var datasets = feature.properties.pits
      .filter(function(pit) {
        return pit.dataset;
      })
      .map(function(pit) {
        return pit.dataset;
      })
      .unique();

    var color = this.props.config.viewer.color;

    return {
      datasets: datasets,
      names: {
        title: title,
        name: selectedName,
        names: sortedNames,
        selected: selectedNames,
        suffix: selectedNamesSuffix
      },
      defaultStyle: {
        point: {
          color: color,
          fillColor: color,
          radius: 9,
          opacity: 0.95
        },
        line: {
          color: color,
          weight: 3,
          opacity: 0.95,
          fillOpacity: 0.05
        }
      },
      fadedStyle: {
        point: {
          color: color,
          fillColor: color,
          radius: 7,
          opacity: 0.25
        },
        line: {
          color: color,
          weight: 2,
          opacity: 0.25,
          fillOpacity: 0
        }
      },
      linkFormatters: [
        {
          title: 'API',
          format: function(apiUrl, id) {
            return apiUrl;
          }
        },
        {
          title: 'GeoThesaurus',
          default: true,
          format: function(apiUrl, id) {
            return 'http://thesaurus.erfgeo.nl/hgconcept/?id=' + encodeURIComponent(id);
          }
        },
        {
          title: 'JSON-LD',
          format: function(apiUrl, id) {
            return 'http://json-ld.org/playground/index.html#startTab=tab-normalized&json-ld=' + apiUrl;
          }
        },
        {
          title: 'geojson.io',
          format: function(apiUrl, id) {
            return 'http://geojson.io/#data=data:text/x-url,' + encodeURIComponent(apiUrl);
          }
        }
      ]
    };
  },

  sortNames: function(pits) {
    var names = pits.filter(function(pit) {
      return pit.name;
    }).map(function(pit) {
      return pit.name;
    });
    var counts = {};

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
      conceptContent = <ConceptSimple config={this.props.config} language={this.props.language} datasets={this.state.datasets} names={this.state.names}
          type={this.props.feature.properties.type} showDetails={this.details} />;
    } else {
      conceptContent = <ConceptDetails config={this.props.config} language={this.props.language} datasets={this.state.datasets} names={this.state.names} linkFormatters={this.state.linkFormatters}
          feature={this.props.feature} route={this.props.route} />;
    }

    return (
      <li className={className} onClick={this.zoom} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        <div className='side-padding'>
          <h5>
            <span>{this.state.names.title}</span>
            <span className='type-header'>{this.props.feature.properties.type.replace('hg:', '')}</span>
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
    if (this.props.config.viewer.mode === 'simple') {
      var linkFormatter = this.state.linkFormatters.filter(function(linkFormatter) {
        return linkFormatter.default;
      })[0];

      var firstPit = this.props.feature.properties.pits[0];
      var firstId = firstPit.id || firstPit.uri;
      var apiUrl = this.props.config.api.baseUrl + 'search?q=' + firstId;
      window.location.href = linkFormatter.format(apiUrl, firstId);
    } else {
      this.props.map.fitBounds(this.featureGroup.getBounds());
      this.props.route.concept.selected.set(this.props.index);
    }
  },

  zoom: function(params) {
    this.props.route.hidden.set(false);
    this.props.map.fitBounds(this.featureGroup.getBounds());
  },

  componentDidMount: function() {
    var geometryTypeOrder = [
      'Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon', 'GeometryCollection'
    ];

    var feature = this.props.feature;

    this.featureGroup = L.featureGroup();

    feature.geometry.geometries.map(function(geometry, geometryIndex) {
      var id;
      var uri;
      var pitIndex;

      for (pitIndex = 0; pitIndex < feature.properties.pits.length; pitIndex++) {
        if (feature.properties.pits[pitIndex].geometryIndex == geometryIndex) {
          id = feature.properties.pits[pitIndex].id;
          uri = feature.properties.pits[pitIndex].uri;
          break;
        }
      }

      return {
        type: 'Feature',
        properties: {
          conceptIndex: this.props.index,
          geometryIndex: geometryIndex,
          pitIndex: pitIndex,
          id: id,
          uri: uri
        },
        geometry: geometry
      };
    }.bind(this)).sort(function(a, b) {
      return geometryTypeOrder.indexOf(b.geometry.type) - geometryTypeOrder.indexOf(a.geometry.type);
    })
    .forEach(function(feature) {
      var geojson = L.geoJson(feature, {
        geometryType: feature.geometry.type,
        style: this.state.defaultStyle.line,
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, this.state.defaultStyle.point);
        }.bind(this),
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
        layer.setStyle(this.state.defaultStyle.line);
      } else {
        layer.setStyle(this.state.fadedStyle.line);
      }
    }.bind(this));
  },

  addLayer: function() {
    this.props.map.getConceptLayer().addLayer(this.featureGroup);
  },

  removeLayer: function() {
    // Remove item's GeoJSON layer from Leaflet map
    this.props.map.getConceptLayer().removeLayer(this.featureGroup);
  },

  componentWillUnmount: function() {
    this.removeLayer();
  }
});