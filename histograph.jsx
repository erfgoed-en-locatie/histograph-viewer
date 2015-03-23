var ResultsBox = React.createClass({

  getInitialState: function() {
    return {
      graphHidden: true,
    };
  },

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
          <ConceptBoxResults feature={feature} back={this.handleBack} showGraph={this.showGraph} graphHidden={this.state.graphHidden}/>
          <ConceptBoxList feature={feature}/>
          <Graph feature={feature} graphHidden={this.state.graphHidden}/>
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

  showGraph: function() {
    this.setState({graphHidden: !this.state.graphHidden});
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

  updateOtherConcepts: function(callingIndex, state) {
    for (var ref in this.refs) {
      var item = this.refs[ref];
      if (callingIndex != item.props.index) {
        item.setState(state);
      }
    }
  },

  render: function() {
    return (
      <ol id="concepts" className="list">
        {this.props.features.map(function(feature, index) {
          // Compute subgraph key from hgids
          var key = feature.properties.pits
              .map(function(pit) {return pit.hgid; })
              .join(",")
              .hashCode();

          var boundSelect = this.handleSelect.bind(this, index),
              boundUpdateOtherConcepts = this.updateOtherConcepts.bind(this, index);

          return <ConceptsBoxListItem key={key} feature={feature} index={index}
              onSelect={boundSelect} ref={'item' + index}
              updateOtherConcepts={boundUpdateOtherConcepts}/>;
        }.bind(this))}
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
  getInitialState: function() {
    return {
      selected: false,
      unfade: true
    };
  },

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
    var className = "padding concept" + (!this.state.selected &! this.state.unfade ? " faded" : "");

    return (
      <li className={className}>
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
          <button className="select" onClick={this.select}>Details...</button>
          <button className="zoom" onClick={this.zoom}>Show</button>
        </div>
        <div className="clear" />
      </li>
    );
  },

  select: function(params) {
    if (!params.noFitBounds) {
      fitBounds(this.featureGroup.getBounds());
    }
    document.getElementById("concepts-box").scrollTop = 0;

    this.props.updateOtherConcepts({selected: false, unfade: false, disabled: true});
    this.setState({selected: true, unfade: false, disabled: false});
    this.props.onSelect();
  },

  zoom: function(params) {
    if (!params.noFitBounds) {
      fitBounds(this.featureGroup.getBounds());
    } else {
      //TODO: fix -60 hack!
      document.getElementById("concepts-box").scrollTop = React.findDOMNode(this).offsetTop - 60;
    }

    this.props.updateOtherConcepts({selected: false, unfade: false});
    this.setState({selected: true, unfade: false});
  },

  componentDidMount: function() {
    var _this = this,
        feature = this.props.feature;

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
      var geojson = L.geoJson(feature, {
        geometryType: feature.geometry.type,
        style: lineStyle,
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, pointStyle);
        },
        onEachFeature: function(feature, layer) {
          layer.on('click', function (e) {
            _this.zoom({
              noFitBounds: true,
              scrollList: true
            });
          });
        }
      }).addTo(map);
      this.featureGroup.addLayer(geojson);
    }.bind(this));

    featureGroups.addLayer(this.featureGroup);
  },

  componentDidUpdate: function() {
    if (this.state.disabled) {
      featureGroups.removeLayer(this.featureGroup);
    } else {
      featureGroups.addLayer(this.featureGroup);
    }

    this.featureGroup.getLayers().forEach(function(layer) {
      if (layer.options.geometryType == "Point") {
        layer.setStyle(!this.state.selected &! this.state.unfade ? fadedPointStyle : pointStyle);
      } else {
        layer.setStyle(!this.state.selected &! this.state.unfade ? fadedLineStyle : lineStyle);
      }
    }.bind(this));
  },

  componentWillUnmount: function() {
    // Remove item's GeoJSON layer from Leaflet map
    featureGroups.removeLayer(this.featureGroup);
  }
});

/**
 * Components for single concept
 */

var ConceptBoxResults = React.createClass({
  render: function() {
    var feature = this.props.feature;
    var sortedNames = sortNames(feature.properties.pits),
        selectedName = sortedNames[0].name;
        pitCount = feature.properties.pits.length,
        message = "Concept contains " + pitCount + " place "
            + ((pitCount == 1) ? "name" : "names");

    return (
      <div>
        <div id="pits-results" className="padding results">
          1 concept selected:
          <a id="pits-close" className="float-right" href="#" onClick={this.props.back}>Back to concept list</a>
        </div>
        <div id="pits-header" className="padding">
          <h5>{selectedName}<code>{this.props.feature.properties.type.replace("hg:", "")}</code></h5>
          {message}
          <a id="show-graph" className="float-right" href="#" onClick={this.showGraph}>{this.props.graphHidden ? "Show graph" : "Hide graph"}</a>

        </div>
      </div>
    );
  },

  showGraph: function() {
    this.props.showGraph();
  }
});

var ConceptBoxList = React.createClass({
  getInitialState: function() {
    var sortFields = [
          "# relations",
          "name",
          "period",
          "source"
        ],
        sources = this.props.feature.properties.pits
          .map(function(pit) { return pit.source; })
          .unique()
          .reduce(function(o, v) {
            o[v] = true;
            return o;
          }, {});

    return {
      filters: {
        sources: sources,
        name: /.*/
      },
      sortField: sortFields[0],
      sortFields: sortFields
    };
  },

  render: function() {
    var sources = this.props.feature.properties.pits
            .map(function(pit) { return pit.source; })
            .unique()
        filteredPits = this.props.feature.properties.pits
            .filter(function(pit) {
              return this.state.filters.name.test(pit.name.toLowerCase()) && this.state.filters.sources[pit.source];
            }.bind(this));

    if (this.state.sortField != this.state.sortFields[0]) {
      filteredPits.sort(function(a, b) {
        if (this.state.sortField == "name") {
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        } else if (this.state.sortField == "period") {
          var dateA = a.startDate || a.endDate,
              dateB = b.startDate || b.endDate;

          // http://stackoverflow.com/questions/11526504/minimum-and-maximum-date
          if (!dateA) dateA = 8640000000000000;
          if (!dateB) dateB = 8640000000000000;

          return (new Date(dateA)) - (new Date(dateB));
        } else if (this.state.sortField == "source") {
          return a.source.localeCompare(b.source);
        }
      }.bind(this));
    }

    filteredPits = filteredPits.map(function(pit, index) {
      return <Pit key={pit.hgid} pit={pit} feature={this.props.feature}/>;
    }.bind(this));

    return (
      <div>
        <div className="padding">
          <table>
            <tbody>
              <tr>
                <td className="label">Names</td>
                <td>
                  <input type="search" placeholder="Filter names" id="pit-name-filter" onChange={this.filterName}/>
                </td>
              </tr>
              <tr>
                <td className="label">Sources</td>
                <td>
                  <span className="source-list">
                    {sources.map(function(source, index) {
                      var boundFilterSource = this.filterSource.bind(this, source),
                          className = this.state.filters.sources[source] ? "" : "filtered";
                      return <a className={className} key={source} href="#"
                                onClick={boundFilterSource}><code>{source}</code></a>;
                    }.bind(this))}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="label">Sort</td>
                <td className="sort-fields">
                  {this.state.sortFields.map(function(field) {
                    var boundSort = this.sort.bind(this, field),
                        className = this.state.sortField === field ? "selected" : "";
                    return <span><a className={className} key={field} href="#" onClick={boundSort}>{field}</a></span>;
                  }.bind(this))}
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            Showing {filteredPits.length} place names (x on map):
            <a id="loop-pits" className="float-right" href="#" onClick={this.loop}>Loop <img src="images/rocket.png" height="18px"/></a>
          </p>
        </div>
        <ol id="pits" className="list">
          {filteredPits}
        </ol>
      </div>
    );
  },

  sort: function(field) {
    this.state.sortField = field;
    this.forceUpdate();
  },

  loop: function() {

  },

  filterName: function(e) {
    var value = document.getElementById("pit-name-filter").value.toLowerCase();
    this.state.filters.name = new RegExp(".*" + value + ".*");
    this.forceUpdate();
  },

  filterSource: function(source, event) {
    if (event.shiftKey) {
      var current = this.state.filters.sources[source];

      var count = 0;
      for (s in this.state.filters.sources) {
        count += this.state.filters.sources[s] ? 1 : 0;
      }

      var length = Object.keys(this.state.filters.sources).length;
      if (length == count) {
        current = !current;
      }

      for (s in this.state.filters.sources) {
        this.state.filters.sources[s] = current;
      }
      this.state.filters.sources[source] = !current;
    } else {
      this.state.filters.sources[source] = !this.state.filters.sources[source];
    }

    event.preventDefault();
    this.forceUpdate();
  }
});

var Pit = React.createClass({
  render: function() {
    var pit = this.props.pit,
        uriRow,
        geometryRow,
        periodRow,
        geometrySpan,
        buttons;

    if (pit.uri) {
      uriRow = (<tr><td className="label">URI</td><td><a href={pit.uri}>{pit.uri}</a></td></tr>);
    }

    if (pit.geometryIndex > -1) {
      geometryRow = (<tr><td className="label">Geometry</td><td>Jaatjes</td></tr>);
    }

    if (pit.startDate || pit.endDate) {
      var period;
      if (pit.startDate && pit.endDate) {
        period = pit.startDate + " - " + pit.endDate;
      } else if (pit.startDate) {
        period = "from " + pit.startDate;
      } else if (pit.endDate) {
        period = "until " + pit.endDate;
      }
      periodRow = (<tr><td className="label">Period</td><td>{period}</td></tr>);
    }

    if (pit.geometryIndex > -1) {
      var className = "float-right geometry-type ",
          geometryType = this.props.feature.geometry.geometries[pit.geometryIndex].type;

      if (geometryType === "Point" || geometryType === "MultiPoint") {
        className += "geometry-type-point";
      } else if (geometryType === "LineString" || geometryType === "MultiLineString") {
        className += "geometry-type-line";
      } else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
        className += "geometry-type-polygon";
      }
      geometrySpan = (<span className={className}/>);

      buttons = (
        <div className="buttons">
          <button className="zoom" onClick={this.zoom}>Show</button>
        </div>
      );
    }

    return (
      <li className="padding pit">
        <h6>{pit.name}{geometrySpan}</h6>
        <div>
          <table>
            <tbody>
              <tr>
                <td className="label">hgid</td>
                <td><code>{pit.hgid}</code></td>
              </tr>
              {uriRow}
              {periodRow}
            </tbody>
          </table>
          {buttons}
          <div className="clear" />
        </div>
      </li>
    );
  }
});

var Graph = React.createClass({
  render: function() {
    if (this.props.graphHidden) {
      return null;
    } else {
      return (
        <div id="graph-container" className="box-container">
          <div className="box-container-padding">
            <div id="graph-box" className="box">
              <svg id="graph" />
            </div>
          </div>
        </div>
      );
    }
  },

  componentDidUpdate: function() {
    d3.select("#graph")
        .datum(this.props.feature)
        .call(graph());
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
