'use strict';

var React = require('react');
var d3 = require('d3');

module.exports = React.createClass({
  render: function() {
    if (this.props.route.graph && this.props.route.graph.getValue()) {
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
    } else {
      return null;
    }
  },

  componentDidUpdate: function() {

    // #graph has fixed position, z-index does not work...
    // d3.select("#map .leaflet-control-container").classed("hidden", !this.props.graphHidden);
    //
    // var graphContainer = document.querySelectorAll("#graph-container > div");
    // d3.select("#graph")
    //     .datum(this.props.feature)
    //     .call(graph().width(graphContainer.offsetWidth).height(graphContainer.offsetHeight));
  }
});