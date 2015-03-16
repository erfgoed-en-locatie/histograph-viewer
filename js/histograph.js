---
---

var geojson,
    endpoint = "http://{{ site.data.api.host }}/";

var width = window.innerWidth,
    height = window.innerHeight;

var circleRadius = 6;

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

// ================================================================================
// Leaflet map initialization
// ================================================================================

var map = L.map('map', {
      //zoomControl: false
    }),
    color = 'rgba({{ site.data.style.color }}, 1)',
    tileUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  	attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  	disableHashChange = false,
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
    geojsonLayerIds = [],
    geometryTypeOrder = [
      "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection"
    ];

map.zoomControl.setPosition('topright');
map.setView([52.2808, 5.4918], 9);

d3.selectAll("#search-input").on('keyup', function() {
  if(d3.event.keyCode == 13){
    var value = d3.select(this).property('value').trim();

    if (value.indexOf("http") == 0) {
      getData('uri', value);
    } else if (value.indexOf("/") > -1) {
      getData('hgid', value);
    } else {
      getData('name', value);
    }
  }
});


d3.select("#show-graph")
    .on("click", function() {
      d3.select("#graph-container").classed("hidden", false);

      // // calling textBlock() returns the function object textBlock().my
      // // via which we set the "label" property of the textBlock outer func
      // var tb = d3.textBlock().label(function(d) {return d.label;});
      // // now we apply the returned function object my == tb on an enter selection
      // var item = svg.selectAll("rect")
      //     .data(items)
      //   .enter()
      //     .append("svg:g")
      //     .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      //     .call(tb);

    });

d3.select("#concepts-close")
    .on("click", function() {
      d3.select("#concepts-box").classed("hidden", true);
    });

d3.select("#pits-close")
    .on("click", function() {
      d3.select("#pits-box").classed("hidden", true);
      d3.select("#concepts-box").classed("hidden", false);
    });


function createPitList(conceptIndex) {
  d3.select("#pits").selectAll("li.pit").remove();

  var concept = d3.select("#concepts .concept:nth-child(" + (conceptIndex + 1) + ")").datum();

  if (concept && concept.properties.pits && concept.properties.pits.length > 0) {

    d3.select("#pits-count").html(concept.properties.pits.length);
    d3.select("#relations-count").html(concept.properties.relations.length);

    d3.select("#pits").selectAll("li.pit")
        .data(concept.properties.pits)
        .enter()
      .append("li")
        .attr("class", "padding pit")
        .each(createPitListItem(concept));

    //d3.select("#concepts-count").html(geojson.features.length);
    //d3.select("#concepts-concepts").html(geojson.features.length == 1 ? "concept" : "concepts");
    d3.select("#pits-box").classed("hidden", false);
  } else {
    // TODO: refactor, create function
    d3.select("#pits-box").classed("hidden", true);
  }
}

function createPitListItem(concept, d, pitIndex) {
  return function (d, pitIndex) {
    var li = d3.select(this);

    li.append("h6").attr("class", "concept-alt-name").html(d.name);

    li.append("div").append("code").html(d.source);
    li.append("div").append("code").html(d.hgid);
    li.append("div").html(d.uri);

    var dateString;
    if (d.startDate && d.endDate) {
      dateString = d.startDate + " - " + d.endDate;
    } else if (d.startDate) {
      dateString = "From " + d.startDate;
    } else if (d.endDate) {
      dateString = "Until " + d.endDate;
    }

    if (dateString) {
      li.append("div").html(dateString);
    }


    if (d.geometryIndex >= 0) {
      li.append("div").html(concept.geometry.geometries[d.geometryIndex].type);
    }

    //li.append("div").html(d.uri);
    // geometry.type
  }
}

function createConceptListItem(d, conceptIndex) {
  var names = d.properties.pits.map(function(pit) { return pit.name; });

  var counts = { };
  for (var k = 0, j = names.length; k < j; k++) {
    counts[names[k]] = (counts[names[k]] || 0) + 1;
  }

  var sorted = Object.keys(counts).map(function(name) {
    return {
      name: name,
      count: counts[name]
    };
  }).sort(function(a, b) {
    if (a.count > b.count) {
      return -1;
    } else if (a.count < b.count) {
      return 1;
    } else {
      return 0;
    }
  });

  var name = sorted[0].name,
      names = sorted.slice(0, 4).map(function(name) { return name.name; });

  var li = d3.select(this);

  // li.append("img")
  //     .attr("class", "concept-zoom-in")
  //     .attr("src", "images/zoom-in.svg")
  //     .on("click", function() {
  //       map.fitBounds(geojsonLayers[conceptIndex].getBounds());
  //     });

  var header = li.append("h5")
      // .on("click", function() {
      //   d3.selectAll("ol#concepts li").classed("selected", false);
      //   d3.select(this.parentNode).classed("selected", true);
      //
      //   geojsonLayers.forEach(function(geojsonLayer, layerIndex) {
      //     geojsonLayers[layerIndex].eachLayer(function (layer) {
      //       layer.setStyle({color: color});
      //     });
      //
      //   });
      //
      //   geojsonLayers[conceptIndex].eachLayer(function (layer) {
      //     layer.setStyle({color :'red'});
      //   });
      //
      // })

  header.append("span").html(name);
  header.append("code").html(d.properties.type.replace("hg:", ""));

  li.append("div").html("Reason found:")

  if (names.length > 1) {
    var namesHtml = names
          .map(function(name) { return '<span class="concept-alt-name">' + name + '</span>'; })
          .join(", "),
        namesLengthDiff = sorted.length - names.length,
        namesPlurSing = namesLengthDiff == 1 ? "name" : "names",
        namesSuffix = sorted.length > names.length ? " and " + namesLengthDiff + " other " +  namesPlurSing: "";

    li.append("div")
        .html("Names: " + namesHtml + namesSuffix);
  }

  var sources = d.properties.pits
    //.filter(function(pit) { return pit.geometryIndex >= 0; })
    .map(function(pit) { return pit.source; })
    .unique();

  li.append("ul")
      .attr("class", "source-list")
      .selectAll("li")
      .data(sources)
      .enter()
    .append("li")
    .append("a")
      .attr("href", "#")
      .on("click", function(d) {

      })
    .append("code")
      .html(function(d) { return d; });

  var buttons = li.append("div").attr("class", "buttons");
  buttons.append("button")
      .attr("class", "select")
      .html("Select")
      .on("click", function() {
        createPitList(conceptIndex);
        d3.select("#concepts-box").classed("hidden", true);
        map.fitBounds(geojsonLayers.getLayer(geojsonLayerIds[conceptIndex]).getBounds());
      });

  buttons.append("button")
      .attr("class", "zoom")
      .html("Show")
      .on("click", function() {
        selectConcept(conceptIndex);
      });


//   var dates = d.properties.pits
//     .filter(function(pit) { return pit.geometryIndex > -1 && (pit.startDate || pit.endDate); })
//     .map(function(pit) { return [pit.startDate, pit.endDate]; })
//     .reduce(function(a, b) {
//       return a.concat(b);
//     })
//     .filter(function(date) { return date; })
//     .sort(function(a, b) {
//       return new Date(b.date) - new Date(a.date);
//     });
// console.log(dates)


  var geojsonLayer = new L.geoJson(null, {
    style: lineStyle,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, pointStyle);
    },
    onEachFeature: function(feature, layer) {
      layer.on('click', function (e) {
        var properties = e.target.feature.properties;
        selectConcept(properties.conceptIndex, properties.pitIndex);
      });
    }
  }).addTo(map);

  geojsonLayers.addLayer(geojsonLayer);
  geojsonLayerIds.push(geojsonLayers.getLayerId(geojsonLayer));

  d.geometry.geometries.map(function(geometry, geometryIndex) {
    var hgid,
        pitIndex;
    for (pitIndex = 0; pitIndex < d.properties.pits.length; pitIndex++) {
      if (d.properties.pits[pitIndex].geometryIndex == geometryIndex) {
        hgid = d.properties.pits[pitIndex].hgid;
        break;
      }
    }

    return {
      type: "Feature",
      properties: {
        conceptIndex: conceptIndex,
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

  //
  //
  // lijstje met bronnen waar je op kunt klikken (alleen met geo!)
  // jaartallen
}

function selectConcept(conceptIndex, pitIndex) {
  d3.selectAll("ol#concepts li.concept")
      .classed("pb-pattern o-lines-light", function(d, i) {
        return i == conceptIndex;
      });

  map.fitBounds(geojsonLayers.getLayer(geojsonLayerIds[conceptIndex]).getBounds());
}

function createConceptList(geojson) {
  geojsonLayers.clearLayers();
  geojsonLayerIds = [];

  d3.select("#concepts").selectAll("li.concept").remove();

  if (geojson && geojson.features && geojson.features.length > 0) {
    d3.select("#concepts").selectAll("li.concept")
        .data(geojson.features)
        .enter()
      .append("li")
        .attr("class", "padding concept")
        .each(createConceptListItem);

    d3.select("#concepts-count").html(geojson.features.length);
    d3.select("#concepts-concepts").html(geojson.features.length == 1 ? "concept" : "concepts");
    d3.select("#concepts-box").classed("hidden", false);
  } else {
    // TODO: refactor, create function
    d3.select("#concepts-box").classed("hidden", true);
  }
}

function getData(type, query) {
  d3.select("#pits-box").classed("hidden", true);
  var url = endpoint + "search?" + type + "=" + query;
  d3.json(url, function(data) {
    geojson = data;
    createConceptList(geojson);
    map.fitBounds(geojsonLayers.getBounds());
    setHash(type + "=" + query);
  });
}

function parseHash(hash) {
  params = {};
  hash.split("&").forEach(function(param) {
    if (param.indexOf("=") > -1) {
      var kv = param.split("=");
      params[kv[0]] = kv[1];
    }
  });

  if (params.uri) {
    d3.select("#search-input").property('value', params.uri);
    getData('uri', params.uri);
  } else if (params.hgid) {
    d3.select("#search-input").property('value', params.hgid);
    getData('hgid', params.hgid);
  } else if (params.name) {
    d3.select("#name-input").property('value', params.name);
    getData('name', params.name);
  }
}

function setHash(hash) {
  disableHashChange = true;
  location.hash = hash;
  setTimeout(function(){
    disableHashChange = false;
  }, 1000);
}

window.onhashchange = function() {
  if (!disableHashChange) {
    parseHash(location.hash.substring(1))
  }
};

if (location.hash) {
  parseHash(location.hash.substring(1));
}
