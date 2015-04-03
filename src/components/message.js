'use strict';

var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <div id="concepts-results" className="padding results">
        <span id="concepts-results-message">{this.props.message}</span>
        <a id="concepts-close" className="float-right" href="#" onClick={this.props.hide}>Close</a>
      </div>
    );
  }
});

// var ConceptsBoxResults = React.createClass({
//   render: function() {
//     var message;
//     if (this.props.features && this.props.features.length) {
//       var concept = this.props.features.length == 1 ? "concept" : "concepts",
//           message = this.props.features.length + " " + concept+ " found:";
//     } else if (this.props.error) {
//       message = "Error: " + this.props.error;
//     } else {
//       message = "No concepts found";
//     }
//
//     return (
//       <div id="concepts-results" className="padding results">
//         <span id="concepts-results-message">{message}</span>
//         <a id="concepts-close" className="float-right" href="#" onClick={this.props.hide}>Close</a>
//       </div>
//     );
//   }
// });