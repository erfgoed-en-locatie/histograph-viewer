// Examples:
//  Static: http://bl.ocks.org/mbostock/1667139

var endpoint = "http://localhost:3000/";

var width = window.innerWidth,
    height = window.innerHeight;

var circleRadius = 6;


// ================================================================================
// Leaflet map initialization
// ================================================================================

var map = L.map('map'),
    tileUrl = "http://otile2.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png",
    pointStyle = {},
    tileLayer = new L.TileLayer(tileUrl, {
      minZoom: 4, maxZoom: 18,
      opacity: 1
    }).addTo(map),
    geojsonLayer = new L.geoJson(null, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, pointStyle);
      }
    }).addTo(map);
map.setZoom(12);

var resizeTimer;
var nodes = {},
    links = {};

var circle,
    text,
    link,
    label;

var force = d3.layout.force()
    .gravity(.09)
    .charge(-800)
    .linkDistance(200)
    .on("tick", tick)
    .size([width, height]);

var svg = d3.select("#graph");

var linkG = svg.append("g"),
    circleG = svg.append("g"),
    textG = svg.append("g"),
    labelG = svg.append("g");

d3.select(window).on("resize", function() {
  clearInterval(resizeTimer);
  resizeTimer = setInterval(resize, 20);
});

d3.selectAll("#name-input, #uri-input").on('keyup', function() {
  if(d3.event.keyCode == 13){
    var value = d3.select(this).property('value').trim();
    var id = d3.select(this).attr('id');
    if (id === "uri-input") {
      getData('uri', value);
    } else if (id === "name-input") {
      getData('name', value);
    }
  }
});

function resize() {
  width = window.innerWidth, height = window.innerHeight;
  svg.attr("width", width).attr("height", height);
  force.size([width, height]).resume();
}

function getData(type, query) {
  closeBox();
  var url = endpoint + "q?" + type + "=" + query;
  d3.json(url, function(json) {
    if (json && json.nodes && Object.keys(json.nodes).length > 0 && json.links && Object.keys(json.links).length > 0) {

      location.hash = type + "=" + query;

      nodes = {};
      links = {};

      width = window.innerWidth, height = window.innerHeight;

      // Compute the distinct nodes from the links.
      for (var linkId in json.links) {

        var link = json.links[linkId];

        var source = nodes[link.source] || (nodes[link.source] = {
          uri: json.nodes[link.source].uri,
          name: json.nodes[link.source].name,
          geometry: json.nodes[link.source].geometry,
          beginDate: json.nodes[link.source].beginDate,
          endDate: json.nodes[link.source].endDate,
          type: json.nodes[link.source].type,
          x: width / 2,
          y: height / 2,
          outgoing: [],
          incoming: []
        });

        var target = nodes[link.target] || (nodes[link.target] = {
          uri: json.nodes[link.target].uri,
          name: json.nodes[link.target].name,
          geometry: json.nodes[link.target].geometry,
          beginDate: json.nodes[link.target].beginDate,
          endDate: json.nodes[link.target].endDate,
          type: json.nodes[link.target].type,
          x: width / 2,
          y: height / 2,
          outgoing: [],
          incoming: []
        });

        nodes[link.source].outgoing.push(target);
        nodes[link.target].incoming.push(source);

        links[source.uri + "-" + target.uri] || (links[source.uri + "-" + target.uri] = {
          source: source,
          target: target,
          label: link.label
        });

      }
      update();
    }

  });
}

function closeBox() {
  d3.select("#info-box").classed("hidden", true);
}

function vertexClick(d) {
  d3.select("#info-box").classed("hidden", false);

  d3.select("#info-pit-name").html(d.name);
  d3.select("#info-pit-uri").attr("href", "#uri=" + d.uri).html(d.uri);
  d3.select("#info-pit-type").html(d.type);
  d3.select("#info-pit-start-date").html(d.startDate);
  d3.select("#info-pit-end-date").html(d.endDate);

  if (d.geometry && d.geometry.type) {
    d3.select("#info-box #map").classed("hidden", false);
    geojsonLayer.clearLayers()
    geojsonLayer.addData(d.geometry);
    map.panTo(geojsonLayer.getBounds().getCenter());
  } else {
    d3.select("#info-box #map").classed("hidden", true);
  }
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
    d3.select("#uri-input").property('value', params.uri);
    getData('uri', params.uri);
  } else if (params.name) {
    d3.select("#name-input").property('value', params.name);
    getData('name', params.name);
  }
}

function tick() {
  circle.attr("transform", transform);
  text.attr("transform", transform);
  link.attr("d", function(d) {
    return "M" + d.source.x + "," + d.source.y + " "
        + "L" + d.target.x + "," + d.target.y;
  });

  //label.attr("xlink:href", function(d, i) { return "#path" + i; });
}

function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

function update() {
  force.nodes(d3.values(nodes))
       .links(d3.values(links));

  // Per-type markers, as they don't inherit styles.
  // svg.append("defs").selectAll("marker")
  //     .data(["suit", "licensing", "resolved"])
  //   .enter().append("marker")
  //     .attr("id", function(d) { return d; })
  //     .attr("viewBox", "0 -5 10 10")
  //     .attr("refX", 15)
  //     .attr("refY", -1.5)
  //     .attr("markerWidth", 6)
  //     .attr("markerHeight", 6)
  //     .attr("orient", "auto")
  //   .append("path")
  //     .attr("d", "M0,-5L10,0L0,5");

  link = linkG.selectAll("path")
      .data(force.links(), function(d) { return d.source.uri + "-" + d.target.uri; });

  link.enter().append("path")
      .attr("d", function(d) {
        return "M" + d.source.x + "," + d.source.y + " "
            + "L" + d.target.x + "," + d.target.y;
      })
      .attr("id", function(d, i) { return "path" + i; });
  link.exit().remove();

  label = labelG.selectAll("text")
      .data(force.links(), function(d) { return d.source.uri + "-" + d.target.uri; });

  label.enter().append("text")
      .style("width", "100%")
      .style("text-anchor", "middle")
      .style("padding", "3px")
      .style("background-color", "white")
      .attr("dy", "-4px")
    .append("textPath")
      .attr("xlink:href", function(d, i) { return "#path" + i; })
      .attr("startOffset", "50%")
      .html(function(d) { return d.label; });
  label.exit().remove();

  circle = circleG.selectAll("circle")
      .data(force.nodes(), function(d) { return d.uri;});

  circle.enter().append("circle")
      .attr("transform", transform)
      .attr("r", circleRadius)
      .attr("class", "pit")
      .classed("has-geometry", function(d) {
        return d.geometry && d.geometry.type;
      })
      .on("click", vertexClick)
      .call(force.drag);
  circle.exit().remove();

  text = textG.selectAll("text")
      .data(force.nodes(), function(d) { return d.uri;});

  text.enter().append("text")
      .attr("x", "12px")
      .attr("y", "12px")
      .text(function(d) { return d.name; });
  text.exit().remove();

  force.start();
}

window.onhashchange = function() {
  parseHash(location.hash.substring(1))
};

if (location.hash) {
  parseHash(location.hash.substring(1));
}

d3.select("#info-box-close").on("click", closeBox);
