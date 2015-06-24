'use strict';

var React = require('react');
var ConceptList = require('./conceptlist');
var Concept = require('./concept');
var Message = require('./message');

var languages = {
  english: require('../language/english.json'),
  dutch: require('../language/dutch.json')
};

var language = languages.english;
//language = languages.dutch;

module.exports = React.createClass({

  render: function() {
    var examples = language.queryExamples.map(function(values){
      return <a href={ values.href }>{values.label}</a>  ;
    });

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
              <Message message={ language.no_concepts_found } error={true} onMessageClose={this.messageClose} />
            </div>
          );
        } else {
          return null;
        }
      }
    } else {
      return (
        <div className='box padding'>
          <p>{ language.explanation }</p>
          <p className="examples">{ language.queryExamplesIntro }: {examples}</p>
        </div>
      );
    }
  },

  messageClose: function() {
    this.props.route.hidden.set(true);
  }

});
