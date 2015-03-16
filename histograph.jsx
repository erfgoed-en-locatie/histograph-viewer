---
layout:
---

Array.prototype.unique = function() {
	var n = {},
      r=[];
	for(var i = 0; i < this.length; i++) 	{
		if (!n[this[i]]) {
			n[this[i]] = true;
			r.push(this[i]);
		}
	}
	return r;
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

var ConceptsBox = React.createClass({

  render: function() {

    if (this.props.geojson.features && this.props.geojson.features.length > 0) {
      return (
        <div>
          <ConceptsBoxResults features={this.props.geojson.features} />
          <ConceptsBoxList features={this.props.geojson.features} />
        </div>
      );
    } else {
      return (
        <div>
          <ConceptsBoxResults features={this.props.geojson.features} />
        </div>
      );
    }
  }
});

var ConceptsBoxResults = React.createClass({
  render: function() {
    var message;
    if (this.props.features && this.props.features.length) {
      var subgraph = this.props.features.length == 1 ? "subgraph" : "subgraphs",
          message = this.props.features.length + " " + subgraph + " found:";
    } else {
      message = "No subgraphs found"
    }

    return (
      <div id="concepts-results" className="padding results">
        <span id="concepts-results-message">{message}</span>
        <a id="concepts-close" className="float-right" href="#">Close</a>
      </div>
    );
  }
});

var ConceptsBoxList = React.createClass({
  render: function() {
    return (
      <ol id="concepts" className="list">
        {this.props.features.map(function(feature, index) {
          // Compute subgraph key from hgids
          var key = feature.properties.pits
              .map(function(pit) {return pit.hgid; })
              .join(",")
              .hashCode();

          return <ConceptsBoxListItem key={key} feature={feature} />;
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
        names = feature.properties.pits.map(function(pit) { return pit.name; });

    var counts = { };
    for (var k = 0, j = names.length; k < j; k++) {
      counts[names[k]] = (counts[names[k]] || 0) + 1;
    }

    var sortedNames = Object.keys(counts).map(function(name) {
      return {
        name: name,
        count: counts[name]
      };
    }).sort(function(a, b) {
      return b.count - a.count;
    });

    var name = sortedNames[0].name,
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

    // Leaflet GeoJSON Layer
    // ----------------------------------------------------------------------

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

    //geojsonLayers.getLayerId(this.geojsonLayer)

    // HTML
    // ----------------------------------------------------------------------

    return (
      <li className="padding concept">
        <h5>
          <span>{name}</span>
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
          <button className="select">Select</button>
          <button className="zoom">Show</button>
        </div>
        <div className="clear" />
      </li>
    );
  },

  componentWillUnmount: function() {
    // Remove item's GeoJSON layer from Leaflet map
    geojsonLayers.removeLayer(geojsonLayers.getLayerId(this.geojsonLayer));
  }
});


d3.selectAll("#search-input").on('keyup', function() {
  if(d3.event.keyCode == 13){
    var value = d3.select(this).property('value').trim();
    d3.json("{{ site.data.api.host }}search?name=" + value, function(geojson) {

      React.render(
        <ConceptsBox geojson={geojson} />,
        document.getElementById('concepts-box')
      );
    });
  }
});


// <div id="concepts-results" class="padding results">
//   <span id="concepts-count"></span> <span id="concepts-concepts"></span> found:
//   <a id="concepts-close" class="float-right" href="#">Close</a>
// </div>
// <ol id="concepts" class="list">
// </ol>