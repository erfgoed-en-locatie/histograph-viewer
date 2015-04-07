'use strict';

var React = require('react');
var ConceptList = require('./conceptlist');
var Concept = require('./concept');
var Message = require('./message');

module.exports = React.createClass({

  render: function() {
    var geojson = this.props.geojson;
    if (geojson && geojson.features) {
      if (geojson.features.length > 0) {
        return (
          <div className='box list-box' id='concepts-box'>
            <ConceptList geojson={this.props.geojson} map={this.props.map} route={this.props.route} />
          </div>
        );
      } else {
        if (!this.props.route.hidden.getValue()) {
          return (
            <div className='box list-box'>
              <Message message='No concepts found' error={true} onMessageClose={this.messageClose} />
            </div>
          );
        } else {
          return null;
        }
      }
    } else {
      // if needed, welcome/introduction message could be returned here
      return null;
    }
  },

  messageClose: function() {
    this.props.route.hidden.set(true);
  }

});
