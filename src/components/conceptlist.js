'use strict';

var React = require('react');
var L = require('leaflet');
var Message = require('./message');

module.exports = React.createClass({

  componentDidMount: function() {
    this.props.map.fitBounds(this.props.map.getConceptLayer().getBounds());
  },

  render: function() {
    var geojson = this.props.geojson.getValue();
    var message;
    if (geojson.features && geojson.features.length) {
      var concept = geojson.features.length == 1 ? "concept" : "concepts",
          message = geojson.features.length + " " + concept+ " found:";
    } else if (this.props.error) {
      // TODO: error
      message = "Error: " + "FOUT";
    } else {
      message = "No concepts found";
    }

    return (
      <div className="box list-box">
        <Message message={message} />
        <ol id="concepts" className="list">
          {geojson.features.map(function(feature, index) {
            // Compute subgraph key from hgids
            var key = feature.properties.pits
                .map(function(pit) {return pit.hgid; })
                .join(",")
                .hashCode();

            return <ConceptListItem key={key} feature={this.props.geojson.features[index]} map={this.props.map} />;

            // <ConceptsBoxList features={this.props.geojson.features} featureGroups={this.state.featureGroups}
            //   pitLayers={this.state.pitLayers} onSelect={this.handleSelect}/>


            // var boundSelect = this.handleSelect.bind(this, index),
            //     boundUpdateOtherConcepts = this.updateOtherConcepts.bind(this, index);

            // return <ConceptsBoxListItem key={key} feature={feature} index={index}
            //     featureGroups={this.props.featureGroups} pitLayers={this.props.pitLayers}
            //     onSelect={boundSelect} ref={'item' + index}
            //     updateOtherConcepts={boundUpdateOtherConcepts}/>;
          }.bind(this))}
        </ol>
      </div>
    );
  }
});




















// var ResultsBox = React.createClass({
//

// });
//
// /**
//  * Components for list of concepts
//  */
//

//
// var ConceptsBoxList = React.createClass({
//
//   handleSelect: function(index) {
//     this.props.onSelect(index)
//   },
//
//   updateOtherConcepts: function(callingIndex, state) {
//     for (var ref in this.refs) {
//       var item = this.refs[ref];
//       if (callingIndex != item.props.index) {
//         item.setState(state);
//       }
//     }
//   },
//
//   render: function() {
//     return (
//       <ol id="concepts" className="list">
//         {this.props.features.map(function(feature, index) {
//           // Compute subgraph key from hgids
//           var key = feature.properties.pits
//               .map(function(pit) {return pit.hgid; })
//               .join(",")
//               .hashCode();
//
//           var boundSelect = this.handleSelect.bind(this, index),
//               boundUpdateOtherConcepts = this.updateOtherConcepts.bind(this, index);
//
//           return <ConceptsBoxListItem key={key} feature={feature} index={index}
//               featureGroups={this.props.featureGroups} pitLayers={this.props.pitLayers}
//               onSelect={boundSelect} ref={'item' + index}
//               updateOtherConcepts={boundUpdateOtherConcepts}/>;
//         }.bind(this))}
//       </ol>
//     );
//   },
//
//   componentDidMount: function() {
//     fitBounds(this.props.featureGroups.getBounds());
//   },
//
//   componentDidUpdate: function() {
//     fitBounds(this.props.featureGroups.getBounds());
//   }
// });

var ConceptListItem = React.createClass({

  getInitialProps: function() {
    return {
      //conceptLayer: null
    };
  },

  getInitialState: function() {
    return {
      // selected: false,
      // unfade: true
    };
  },

  render: function() {
    var feature = this.props.feature.getValue();
    var sortedNames = this.sortNames(feature.properties.pits);
    var selectedName = sortedNames[0].name;
    var selectedNames = sortedNames.slice(0, 4).map(function(name) { return name.name; });
    var selectedNamesRow;

    if (selectedNames.length > 1) {
      var namesLengthDiff = sortedNames.length - selectedNames.length;
      var namesPlurSing = namesLengthDiff == 1 ? "name" : "names";

      var selectedNamesSuffix = sortedNames.length > selectedNames.length ? " and " + namesLengthDiff + " other " +  namesPlurSing : "";

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
      .map(function(pit) { return pit.source; })
      .unique();

    // HTML
    // ----------------------------------------------------------------------
    var className = "padding concept"; //+ (!this.state.selected &! this.state.unfade ? " faded" : "");

    return (
      <li className={className} onClick={this.zoom}>
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
          <button className="details" onClick={this.details} title="Show concept details">Details...</button>
        </div>
        <div className="clear" />
      </li>
    );
  },

  details: function(params) {
    this.props.map.fitBounds(this.featureGroup.getBounds());
    // document.getElementById("concepts-box").scrollTop = 0;
    //
    // this.props.updateOtherConcepts({selected: false, unfade: false, disabled: true});
    // this.setState({selected: true, unfade: false, disabled: false});
    // this.props.onSelect();
  },

  zoom: function(params) {
    this.props.map.fitBounds(this.featureGroup.getBounds());

    // if (!params.noFitBounds) {
    //   fitBounds(this.featureGroup.getBounds());
    // } else {
    //   //TODO: fix -60 hack!
    //   document.getElementById("concepts-box").scrollTop = React.findDOMNode(this).offsetTop - 60;
    // }
    //
    // this.props.updateOtherConcepts({selected: false, unfade: false});
    // this.setState({selected: true, unfade: false});
  },

  select: function(params) {
    // this.props.updateOtherConcepts({selected: false, unfade: false});
    // this.setState({selected: true, unfade: false});
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

  componentDidMount: function() {
    var feature = this.props.feature.getValue();

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
        style: defaultStyle.line,
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, defaultStyle.point);
        },
        onEachFeature: function(feature, layer) {
          layer.on('click', function (e) {
            // TODO: FIX! bij pitlijst
            this.zoom({
              hgid: feature.hgid,
              noFitBounds: true
            });
          }.bind(this));
        }.bind(this)
      });
      this.featureGroup.addLayer(geojson);
    }.bind(this));

    this.addLayer();
  },

  componentDidUpdate: function() {
    // if (this.state.disabled) {
    //   this.removeLayer();
    // } else {
    //   this.addLayer();
    // }
    //
    // this.featureGroup.getLayers().forEach(function(layer) {
    //   // TODO: make function for styling based on state
    //   // TODO: make selection object in state, denoting all possible selection states
    //   if (layer.options.geometryType == "Point") {
    //     layer.setStyle(!this.state.selected &! this.state.unfade ? fadedStyle.point : defaultStyle.point);
    //   } else {
    //     layer.setStyle(!this.state.selected &! this.state.unfade ? fadedStyle.point : defaultStyle.line);
    //   }
    // }.bind(this));
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