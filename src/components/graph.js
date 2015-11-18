var React = require('react');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      visible: false
    }
  },

  graphVisible: function() {
    return this.props.route.graph && this.props.route.graph.getValue();
  },

  toggleLeafletControls: function(visible) {
    d3.selectAll('.leaflet-control-container').classed('hidden', visible);
  },

  render: function() {
    if(!this.graphVisible()) {
      return null;
    }

    return (
      <div id='graph-container' className='box-container'>
        <div className='box-container-padding' ref='container'>
          <div id='graph-box' className='box'>
            <svg id='graph'>
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
    var visible = this.graphVisible();
    if (this.state.visible !== visible) {
      this.setState({
        visible: visible
      });

      this.toggleLeafletControls(visible);

      if (visible) {
        this.updateGraph();
      }
    }
  },

  updateGraph: function() {

    var geojson = this.props.route.geojson.getValue();
    var feature = geojson.features[this.props.route.getValue().concept.selected];

    if (feature && feature.properties) {
      var node = React.findDOMNode(this.refs.container);
      d3.select('#graph')
          .datum(feature)
          .call(this.createNodeGraph, node, this);

    }
  },

  createNodeGraph: function(selection, graphContainer, component) {
    var createSVGPathString = this.createSVGPathString;

    var width = graphContainer.offsetWidth;
    var height = graphContainer.offsetHeight;
    var svgGroups = [
      'link', 'circle', 'text', 'label'
    ];

    selection.each(function() {
      var groups = selection.selectAll('g')
          .data(svgGroups)
        .enter('g').append('g')
          .attr('class', function(d) { return d; });

      var feature = d3.select(this).datum();
      var linkG = selection.select('.' + svgGroups[0]);
      var circleG = selection.select('.' + svgGroups[1]);
      var textG = selection.select('.' + svgGroups[2]);
      var labelG = selection.select('.' + svgGroups[3]);

      var nodes = {};
      var links = {};

      var createNode = function(pit) {
        return {
          id: pit.id,
          uri: pit.uri,
          name: pit.name,
          type: pit.type,
          dataset: pit.dataset,
          geometryIndex: pit.geometryIndex,
          x: 0,
          y: 0,
          outgoing: [],
          incoming: []
        }
      };

      // First, create D3 nodes from all PITs
      feature.properties.pits.forEach(function(pit) {
        nodes[pit.id || pit.uri] = createNode(pit);
      });

      // Then create links from each PIT's relations
      feature.properties.pits.forEach(function(pit) {
        var source = nodes[pit.id || pit.uri];

        if (!pit.relations) {
          return;
        }

        Object.keys(pit.relations)
          .filter(function(relation) {
            return relation !== '@id';
          })
          .forEach(function(relation) {
            pit.relations[relation].forEach(function(id) {
              var targetId = id['@id'];
              var sourceId = pit.id || pit.uri;

              if (nodes[targetId]) {
                var target = nodes[targetId];

                source.outgoing.push(target);
                target.incoming.push(source);

                links[sourceId + '-' + targetId] = {
                  source: source,
                  target: target,
                  label: relation
                };
              }
            });

        });
      });

      var circle;
      var text;
      var link;
      var label;
      var circleRadius = 5;
      var transform = function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      };
      var tick = function() {
        circle.attr('transform', transform);
        text.attr('transform', transform);
        link.attr('d', createSVGPathString);
        // label.attr('xlink:href', function(d, i) { return '#path' + i; });
      };
      var force = cola.d3adaptor()
          .jaccardLinkLengths(100,0.7)
          //.linkDistance(50)
          //.symmetricDiffLinkLengths(130)
          .start(30, 30)
          .on('tick', tick)
          .size([
            width,
            height
          ]);

      force
        .nodes(d3.values(nodes))
        .links(d3.values(links));

      link = linkG.selectAll('path')
          .data(force.links(), function(d) {
            return (d.source.id || d.source.uri) + '-' + (d.target.id || d.target.uri);
          });

      link.enter().append('path')
          .attr('d', createSVGPathString)
          .attr('id', function(d, i) { return 'path' + i; });
      link.exit().remove();

      circle = circleG.selectAll('circle')
          .data(force.nodes(), function(d) {
            return d.id || d.uri;
          });

      circle.enter().append('circle')
          .attr('transform', transform)
          .attr('r', circleRadius)
          .attr('class', 'graph-pit')
          .classed('has-geometry', function(d) { return d.geometryIndex > -1; })
          //.on('click', vertexClick)
          .call(force.drag);
      circle.exit().remove();

      text = textG.selectAll('text')
          .data(force.nodes(), function(d) { return d.id || d.uri; });

      var tspans = text.enter().append('text');
      tspans.append('tspan')
          .text(function(d) {
            return d.name;
          })
          .attr('x', '12px')
          .attr('y', '12px');
      tspans.append('tspan')
          .text(function(d) {
            return d.id || d.uri;
          })
          .attr('class', 'graph-id')
          .attr('x', '12')
          .attr('y', '30px');

      text.exit().remove();

      force.start();
    });
  },

  createSVGPathString: function(link) {
    return 'M' + link.source.x + ',' + link.source.y + ' ' + 'L' + link.target.x + ',' + link.target.y;
  }

});
