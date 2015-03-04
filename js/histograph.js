// Examples:
//  Static: http://bl.ocks.org/mbostock/1667139

var endpoint = "http://api.histograph.io/";

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
    color = '#4abb84',
    tileUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  	attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  	subdomains = 'abcd',
    pointStyle = {},
    lineStyle = {
      color: color,
      weight: 3,
      opacity: 0.65
    },
    tileLayer = new L.TileLayer(tileUrl, {
      subdomains: subdomains,
      attribution: attribution,
      minZoom: 4, maxZoom: 18,
      opacity: 1
    }).addTo(map),
    geojsonLayers = [];

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

d3.select("#concepts-close")
    .on("click", function() {
      d3.select("#concepts-box").classed("hidden", true);
    });

function createConcept(d, i) {
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

  li.append("img")
      .attr("class", "concept-zoom-in")
      .attr("src", "images/zoom-in.svg")
      .on("click", function() {
        map.fitBounds(geojsonLayers[i].getBounds());
      });

  var header = li.append("h5")
      .on("click", function() {
        d3.selectAll("ol#concepts li").classed("selected", false);
        d3.select(this.parentNode).classed("selected", true);

        geojsonLayers.forEach(function(geojsonLayer, i) {
          geojsonLayers[i].eachLayer(function (layer) {
            layer.setStyle({color: color});
          });

        });

        geojsonLayers[i].eachLayer(function (layer) {
          layer.setStyle({color :'red'});
        });

      })

  header.append("span").html(name);
  header.append("code").html(d.properties.type.replace("hg:", ""));


  if (names.length > 1) {
    var namesHtml = names
          .map(function(name) { return '<span class="concept-alt-name">' + name + '</span>'; })
          .join(", "),
        namesLengthDiff = sorted.length - names.length,
        namesPlurSing = namesLengthDiff == 1 ? "name" : "names",
        namesSuffix = sorted.length > names.length ? " and " + namesLengthDiff + " other " +  namesPlurSing: "";

    li.append("div")
        .html(namesHtml + namesSuffix);
  }

  var layers = d.properties.pits
    //.filter(function(pit) { return pit.geometryIndex >= 0; })
    .map(function(pit) { return pit.layer; })
    .unique();

  li.append("ul")
      .attr("class", "layer-list")
      .selectAll("li")
      .data(layers)
      .enter()
    .append("li")
    .append("a")
      .attr("href", "#")
      .on("click", function(d) {

      })
    .append("code")
      .html(function(d) { return d; });


  var geojsonLayer = new L.geoJson(null, {
    style: lineStyle,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, pointStyle);
    }
  }).addTo(map);

  geojsonLayers.push(geojsonLayer);

  d.geometry.geometries.forEach(function(geometry) {
    geojsonLayer.addData(geometry);
  });

  //
  //
  // lijstje met bronnen waar je op kunt klikken (alleen met geo!)
  // jaartallen
}

function getData(type, query) {
  var url = endpoint + "search?" + type + "=" + query;
  d3.json(url, function(json) {
    if (json && json.features && json.features.length > 0) {

      geojsonLayers.forEach(function(geojsonLayer) {
        geojsonLayer.clearLayers();
      });
      geojsonLayers = [];

      d3.select("#concepts").selectAll("li").remove();

      d3.select("#concepts").selectAll("li")
          .data(json.features)
          .enter()
        .append("li")
          .attr("class", "padding")
          .each(createConcept);

      d3.select("#concepts-count").html(json.features.length);
      d3.select("#concepts-concepts").html(json.features.length == 1 ? "concept" : "concepts");
      d3.select("#concepts-box").classed("hidden", false);
      location.hash = type + "=" + query;
    }
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

window.onhashchange = function() {
  parseHash(location.hash.substring(1))
};

if (location.hash) {
  parseHash(location.hash.substring(1));
}
