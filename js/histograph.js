// Examples:
//  Static: http://bl.ocks.org/mbostock/1667139

var histograph = "http://localhost:3000/";

var width = window.innerWidth, height = window.innerHeight;

var THRESHOLD = 2;

var circleRadius = 6;

var resizeTimer;
var nodes = {},
    links = {};

var circle,
    text,
    link;

var force = d3.layout.force()
    .gravity(.09)
    .charge(-800)
    .linkDistance(200)
    .on("tick", tick)
    .size([width, height]);

var svg = d3.select("#graph");

var linkG = svg.append("g");
var circleG = svg.append("g");
var textG = svg.append("g");

function tick() {
  circle.attr("transform", transform);
  text.attr("transform", transform);
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return minusCircleRadiusX({x: d.source.x, y: d.source.y}, {x: d.target.x, y: d.target.y}); })
      .attr("y2", function(d) { return minusCircleRadiusY({x: d.source.x, y: d.source.y}, {x: d.target.x, y: d.target.y}); });
}

function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

d3.select(window).on("resize", function() {
  clearInterval(resizeTimer);
  resizeTimer = setInterval(resize, 20);
});

function resize() {
  width = window.innerWidth, height = window.innerHeight;
  svg.attr("width", width).attr("height", height);
  force.size([width, height]).resume();
}

function getData() {

  d3.json(histograph + "test-source1/2", function(json) {

    width = window.innerWidth, height = window.innerHeight;

    // Compute the distinct nodes from the links.
    json.links.forEach(function(link) {

      var source = nodes[link.source] || (nodes[link.source] = {
        uri: json.nodes[link.source].uri,
        name: json.nodes[link.source].name,
        x: width / 2,
        y: height / 2,
        outgoing: [],
        incoming: []
      });

      var target = nodes[link.target] || (nodes[link.target] = {
        uri: json.nodes[link.target].uri,
        name: json.nodes[link.target].name,
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

    });

    // Remove links to nodes with distance > THRESHOLD
    // and update incoming and outgoing properties
    for (var key in links) {
      var s = links[key].source.distance > THRESHOLD
      var t = links[key].target.distance > THRESHOLD
      if (s || t) {
        // TODO: check!
        if (s) {
          var index = links[key].source.incoming.indexOf(links[key].target);
          if (index > -1) {
            links[key].source.incoming.splice(index, 1);
          }
        }
        if (t) {
          var index = links[key].target.outgoing.indexOf(links[key].source);
          if (index > -1) {
            links[key].target.outgoing.splice(index, 1);
          }
        }
        delete links[key];
      }
    }

    // Remove all nodes with distance > THRESHOLD
    for (var key in nodes) {
      if (nodes[key].distance > THRESHOLD) {
        delete nodes[key];
      }
    }

    update();

  });
}

function minusCircleRadiusX(source, target) {
  var l = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)),
      c = (l - circleRadius * 2) / l;
  return (target.x - source.x) * c + source.x;
}

function minusCircleRadiusY(source, target) {
  var l = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)),
      c = (l - circleRadius * 2) / l;
  return (target.y - source.y) * c + source.y;
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

  link = linkG.selectAll("line")
      .data(force.links(), function(d) { return d.source.uri + "-" + d.target.uri; });

  link.enter().append("line")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return minusCircleRadiusX({x: d.source.x, y: d.source.y}, {x: d.target.x, y: d.target.y}); })
      .attr("y2", function(d) { return minusCircleRadiusY({x: d.source.x, y: d.source.y}, {x: d.target.x, y: d.target.y}); })
      .attr("id", function(d, i) { return "path" + i; })
      .style("marker-end", "url(#markerArrow");
  link.exit().remove();

  // var pathText = linkG.selectAll("text")
  //     .data(force.links())
  //   .enter().append("text")
  //     .style("width", "100%")
  //     .style("text-anchor", "middle")
  //     .style("font-size", "8px")
  //     .style("padding", "3px")
  //     .style("background-color", "white")
  //     .attr("dy", "-4px")
  //   .append("textPath")
  //     .attr("xlink:href", function(d, i) { return "#path" + i; })
  //     .attr("startOffset", "50%")
  //     .html(function(d) { return d.type; });

  circle = circleG.selectAll("circle")
      .data(force.nodes(), function(d) { return d.uri;});

  circle.enter().append("circle")
      .attr("transform", transform)
      .attr("r", circleRadius)
      .on("click", onclick)
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

getData();