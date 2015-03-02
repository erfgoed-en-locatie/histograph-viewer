// Old D3.js graph code
// TODO: use this code in viewer!

// <div id="graph" class="hidden">
//   <svg>
//     <defs>
//       <marker id='marker-arrow' orient='auto' markerWidth='8' markerHeight='8'
//               refX='12' refY='4'>
//         <path d='M0,0 V8 L8,4 Z' />
//       </marker>
//     </defs>
//   </svg>
// </div>

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

var svg = d3.select("#graph > svg");

var linkG = svg.append("g"),
    circleG = svg.append("g"),
    textG = svg.append("g"),
    labelG = svg.append("g");

d3.select(window).on("resize", function() {
  clearInterval(resizeTimer);
  resizeTimer = setInterval(resize, 20);
});




function resize() {
  width = window.innerWidth, height = window.innerHeight;
  svg.attr("width", width).attr("height", height);
  force.size([width, height]).resume();
}

function createNode(node) {
  return {
    uri: node.uri,
    name: node.name,
    geometry: node.geometry,
    startDate: node.startDate,
    endDate: node.endDate,
    type: node.type,
    x: width / 2,
    y: height / 2,
    outgoing: [],
    incoming: []
  };
}


//
//   nodes = {};
//   links = {};
//
//   width = window.innerWidth, height = window.innerHeight;
//
//   // Compute the distinct nodes from the links.
//   for (var linkId in json.links) {
//
//     var link = json.links[linkId];
//
//     var source = nodes[link.source] || (nodes[link.source] = createNode(json.nodes[link.source]));
//     var target = nodes[link.target] || (nodes[link.target] = createNode(json.nodes[link.target]));
//
//     nodes[link.source].outgoing.push(target);
//     nodes[link.target].incoming.push(source);
//
//     links[source.uri + "-" + target.uri] || (links[source.uri + "-" + target.uri] = {
//       source: source,
//       target: target,
//       label: link.label
//     });
//
//   }
//
//   for (var nodeId in json.nodes) {
//     if (!(nodeId in nodes)) {
//       nodes[nodeId] = createNode(json.nodes[nodeId]);
//     }
//   }
//
//   update();



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