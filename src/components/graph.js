'use strict';

var React = require('react');
var d3 = require('d3');

module.exports = React.createClass({
  checkNeccesary: function(){
    return this.props.route.graph && this.props.route.graph.getValue();
  },

  render: function() {
    if(!this.checkNeccesary()){
      return null;
    }
    
    return (
      <div id="graph-container" className="box-container">
        <div className="box-container-padding">
          <div id="graph-box" className="box">
            <svg id="graph">
              <defs>
                <marker id='marker-arrow' orient='auto' markerWidth='8' markerHeight='8'
                    refX='12' refY='4'>
                  <path d='M0,0 V8 L8,4 Z' />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    );
  },

  componentDidUpdate: function() {
    var feature;

    if(!this.checkNeccesary()){
      return null;
    }
    
    feature = this.props.geojson.features[this.props.route.getValue().concept.selected];

    var graphContainer = document.querySelectorAll("#graph-container > div")[0];
    
    d3.select("#graph")
        .datum(feature)
        .call(createNodeGraph, graphContainer);

  }
});

function createNodeGraph(selection, graphContainer){
  var width = graphContainer.offsetWidth,
      height = graphContainer.offsetHeight,
      svgGroups = [
        'link', 'circle', 'text', 'label'
      ];

  selection.each(function(){

    var groups = selection.selectAll('g')
          .data(svgGroups)
          .enter('g')
          .append('g')
          .attr('class', function(d){ return d; }),
        feature = d3.select(this).datum(),
        linkG = selection.select("." + svgGroups[0]),
        circleG = selection.select("." + svgGroups[1]),
        textG = selection.select("." + svgGroups[2]),
        labelG = selection.select("." + svgGroups[3]),
        nodes = {},
        links = {},
        enrichPit = function(pit){
          pit.x = 0;
          pit.y = 0;
          pit.outgoing = [];
          pit.incoming = [];

          return pit;
        };

    // First, create D3 nodes from all PITs
    feature.properties.pits.forEach(function(pit) {
      nodes[pit.hgid] = enrichPit(pit);
    });

    // Then create links from each PIT's relations
    feature.properties.pits.forEach(function(pit) {
      var source = nodes[pit.hgid];

      if(!pit.relations) return;

      Object.keys(pit.relations).forEach(function(relation) {
        if (relation !== "@id") {
          pit.relations[relation].forEach(function(id) {
            var hgid = id["@id"],
                target = nodes[hgid];

            nodes[pit.hgid].outgoing.push(target);
            nodes[hgid].incoming.push(source);

            links[pit.hgid + "-" + hgid] = {
              source: source,
              target: target,
              label: relation
            };
          });
        }
      });

    });


  var circle,
      text,
      link,
      label,
      transform = function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      },
      tick = function () {
        circle.attr("transform", transform);
        text.attr("transform", transform);
        link.attr("d", function(d) {
          return "M" + d.source.x + "," + d.source.y + " "
              + "L" + d.target.x + "," + d.target.y;
        });

        //label.attr("xlink:href", function(d, i) { return "#path" + i; });
      },
      circleRadius = 5,
      force = cola.d3adaptor()
        .jaccardLinkLengths(100,0.7)
        //.linkDistance(50)
        //.symmetricDiffLinkLengths(130)
        .start(30, 30)
        .on("tick", tick)
        .size([
          width,
          height
        ]);



    force.nodes(d3.values(nodes))
         .links(d3.values(links));

    link = linkG.selectAll("path")
        .data(force.links(), function(d) { return d.source.hgid + "-" + d.target.hgid; });

    link.enter().append("path")
        .attr("d", function(d) {
          return "M" + d.source.x + "," + d.source.y + " "
              + "L" + d.target.x + "," + d.target.y;
        })
        .attr("id", function(d, i) { return "path" + i; });
    link.exit().remove();

    circle = circleG.selectAll("circle")
        .data(force.nodes(), function(d) { return d.hgid;});

    circle.enter().append("circle")
        .attr("transform", transform)
        .attr("r", circleRadius)
        .attr("class", "graph-pit")
        .classed("has-geometry", function(d) {
          return d.geometryIndex > -1;
        })
        //.on("click", vertexClick)
        .call(force.drag);
    circle.exit().remove();

    text = textG.selectAll("text")
        .data(force.nodes(), function(d) { return d.hgid;});

    var tspans = text.enter().append("text")

    tspans.append("tspan")
        .text(function(d) { return d.name; })
        .attr("x", "12px")
        .attr("y", "12px");

    tspans.append("tspan")
        .text(function(d) { return d.hgid; })
        .attr("class", "graph-hgid")
        .attr("x", "12")
        .attr("y", "30px");

    text.exit().remove();

    force.start();

  });
}