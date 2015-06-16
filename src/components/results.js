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
      return (
        <div className='box padding'>
          <p>
            Search for names, alternative names and old spelling variants of streets, places, municipalities and provinces in the Netherlands. Some examples: <a href='#search=noviomagus'>Noviomagus</a>, <a href='#search=sutpheren'>Sutpheren</a>, <a href='#search=friese%20landen'>Friese landen</a>.
          </p>
        </div>
      );
    }
  },

  messageClose: function() {
    this.props.route.hidden.set(true);
  }

});
