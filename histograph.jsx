var ResultsBox = React.createClass({

  render: function() {
    var conceptBox = null,
        hideConceptList = false;

    if (!this.props.geojson) {
      return null;
    }

    if (this.props.selected != -1) {
      var feature = this.props.geojson.features[this.props.selected],
          hideConceptList = true
      var conceptBox = (
        <div>
          <ConceptBoxResults feature={feature} back={this.handleBack}/>
          <ConceptBoxList feature={feature}/>
        </div>
      );
    }

    if (this.props.geojson && this.props.geojson.features && this.props.geojson.features.length > 0) {
      var className = (hideConceptList || this.props.hidden) ? "hidden" : "";

      return (
        <div>
          <div className={className}>
            <ConceptsBoxResults features={this.props.geojson.features} hide={this.handleHide}/>
            <ConceptsBoxList features={this.props.geojson.features} onSelect={this.handleSelect}/>
          </div>
          {conceptBox}
        </div>
      );
    } else {
      return (
        <div className={className}>
          <ConceptsBoxResults error={this.props.error} hide={this.handleHide}/>
        </div>
      );
    }
  },

  handleBack: function() {
    this.setProps({
      selected: -1
    });
  },

  handleHide: function() {
    this.setProps({
      hidden: true
    });
  },

  handleSelect: function(index) {
    this.setProps({
      selected: index
    });
  }
});

/**
 * Components for list of concepts
 */

var ConceptsBoxResults = React.createClass({
  render: function() {
    var message;
    if (this.props.features && this.props.features.length) {
      var subgraph = this.props.features.length == 1 ? "subgraph" : "subgraphs",
          message = this.props.features.length + " " + subgraph + " found:";
    } else if (this.props.error) {
      message = "Error: " + this.props.error;
    } else {
      message = "No subgraphs found";
    }

    return (
      <div id="concepts-results" className="padding results">
        <span id="concepts-results-message">{message}</span>
        <a id="concepts-close" className="float-right" href="#" onClick={this.props.hide}>Close</a>
      </div>
    );
  }
});

var ConceptsBoxList = React.createClass({

  handleSelect: function(index) {
    this.props.onSelect(index)
  },

  render: function() {
    var conceptsBoxList = this;
    return (
      <ol id="concepts" className="list">
        {this.props.features.map(function(feature, index) {
          // Compute subgraph key from hgids
          var key = feature.properties.pits
              .map(function(pit) {return pit.hgid; })
              .join(",")
              .hashCode();

          var boundSelect = conceptsBoxList.handleSelect.bind(conceptsBoxList, index);

          return <ConceptsBoxListItem key={key} feature={feature} onSelect={boundSelect}/>;
        })}
      </ol>
    );
  },
  componentDidMount: function() {
    fitMapBounds();
  },
  componentDidUpdate: function() {
    fitMapBounds();
  }
});

var ConceptsBoxListItem = React.createClass({
  render: function() {
    var feature = this.props.feature,
        sortedNames = sortNames(feature.properties.pits),
        selectedName = sortedNames[0].name,
        selectedNames = sortedNames.slice(0, 4).map(function(name) { return name.name; }),
        selectedNamesRow;

    if (selectedNames.length > 1) {
      var namesLengthDiff = sortedNames.length - selectedNames.length,
          namesPlurSing = namesLengthDiff == 1 ? "name" : "names";

      selectedNamesSuffix = sortedNames.length > selectedNames.length ? " and " + namesLengthDiff + " other " +  namesPlurSing : "";

      selectedNamesRow =  <tr>
          <td className="label">Names</td>
          <td>
            <span>
              {selectedNames.map(function(selectedName, index) {
                return <span key={index} className="concept-alt-name">{selectedName}</span>;
              })}
            </span>
            <span>{selectedNamesSuffix}</span>
          </td>
        </tr>;
    }

    var sources = feature.properties.pits
      //.filter(function(pit) { return pit.geometryIndex >= 0; })
      .map(function(pit) { return pit.source; })
      .unique();


    // HTML
    // ----------------------------------------------------------------------

    return (
      <li className="padding concept">
        <h5>
          <span>{selectedName}</span>
          <code>{feature.properties.type.replace("hg:", "")}</code>
        </h5>
        <table>
          <tbody>
            {selectedNamesRow}
            <tr>
              <td className="label">Sources</td>
              <td>
                <span className="source-list">
                  {sources.map(function(source, index) {
                    return <span key={index}><code>{source}</code></span>;
                  })}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="buttons">
          <button className="select" onClick={this.props.onSelect}>Select</button>
          <button className="zoom" onClick={this.zoom}>Show</button>
        </div>
        <div className="clear" />
      </li>
    );
  },

  zoom: function() {
    fitBounds(this.geojsonLayer.getBounds());
  },

  componentDidMount: function() {
    var feature = this.props.feature;

    this.geojsonLayer = new L.geoJson(null, {
      style: lineStyle,
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, pointStyle);
      },
      onEachFeature: function(feature, layer) {
        layer.on('click', function (e) {
          // var properties = e.target.feature.properties;
          // selectConcept(properties.conceptIndex, properties.pitIndex);
        });
      }
    }).addTo(map);

    var geojsonLayer = this.geojsonLayer;

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
          geometryIndex: geometryIndex,
          pitIndex: pitIndex,
          hgid: hgid
        },
        geometry: geometry
      };
    }).sort(function(a, b) {
      return geometryTypeOrder.indexOf(b.geometry.type) - geometryTypeOrder.indexOf(a.geometry.type);
    })
    .forEach(function(feature) {
      geojsonLayer.addData(feature);
    });

    geojsonLayers.addLayer(geojsonLayer);
  },

  componentWillUnmount: function() {
    // Remove item's GeoJSON layer from Leaflet map
    geojsonLayers.removeLayer(geojsonLayers.getLayerId(this.geojsonLayer));
  }
});

/**
 * Components for single concept
 */

var ConceptBoxResults = React.createClass({
  render: function() {
    var sortedNames = sortNames(this.props.feature.properties.pits),
        selectedName = sortedNames[0].name;
        pitCount = this.props.feature.properties.pits.length,
        relCount = this.props.feature.properties.relations.length,
        message = pitCount
            + ((pitCount == 1) ? " PIT" : " PITs")
            + ", "
            + relCount
            + ((relCount == 1) ? " relation" : " relations");

    return (
      <div>
        <div id="pits-results" className="padding results">
          1 concept selected:
          <a id="pits-close" className="float-right" href="#" onClick={this.props.back}>Back to concept list</a>
        </div>
        <div id="pits-header" className="padding">
          <h5>{selectedName}<code>Place</code></h5>
          {message}
          <a id="show-graph" className="float-right" href="#">Show graph</a>
        </div>
      </div>
    );
  }
});

var ConceptBoxList = React.createClass({
  render: function() {
    return (
      <ol id="pits" className="list">
        {this.props.feature.properties.pits.map(function(pit, index) {
          //var boundSelect = conceptsBoxList.handleSelect.bind(conceptsBoxList, index);
          return <Pit key={pit.hgid} pit={pit}/>;
        })}
      </ol>
    );
  }
});

var Pit = React.createClass({
  render: function() {
    var pit = this.props.pit;

    return (
      <li className="padding pit">
        <h6 className="concept-alt-name">{pit.name}</h6>
        <div><code>{pit.hgid}</code></div>
      </li>
    );
  }
});

/**
 * D3.js - GeoJSON from Histograph API
 */

d3.selectAll("#search-input").on('keyup', function() {
  if (d3.event.keyCode == 13) {
    var value = d3.select(this).property('value');
    d3.json(getApiUrl(value), function(error, geojson) {
      var errorMessage = null;
      if (error) {
        try {
          errorMessage = JSON.parse(error.response).error;
        } catch (e) {
          errorMessage = "Invalid reponse from Histograph API";
        }
      }
      resultsBox.setProps({
        geojson: geojson,
        error: errorMessage,
        selected: -1,
        hidden: false
      });

    });
  }
});

var resultsBox = React.render(
  <ResultsBox />,
  document.getElementById('concepts-box')
);
