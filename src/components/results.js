var React = require('react');
var ConceptList = require('./conceptlist');
var Concept = require('./concept');
var Message = require('./message');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      examples: this.props.language.queryExamples.map(function(values, index) {
        return <a href={ values.href } key={index}>{values.label}</a>
      })
    };
  },

  render: function() {
    var geojson = this.props.route.geojson.getValue();
    if (geojson && geojson.features) {
      if (geojson.features.length > 0) {
        return (
          <div className='box list-box' id='concepts-box'>
            <ConceptList config={this.props.config} language={this.props.language} map={this.props.map} route={this.props.route} />
          </div>
        );
      } else {
        if (!this.props.route.hidden.getValue()) {
          return (
            <div className='box list-box'>
              <Message language={this.props.language} message={this.props.language.noConceptsFound} error={true} onMessageClose={this.messageClose} />
            </div>
          );
        } else {
          return null;
        }
      }
    } else {
      return (
        <div className='box padding'>
          <p>{ this.props.language.explanation }</p>
          <p className='examples'>{ this.props.language.queryExamplesIntro }: {this.state.examples}</p>
        </div>
      );
    }
  },

  messageClose: function() {
    this.props.route.hidden.set(true);
  }

});
