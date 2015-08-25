var React = require('react');
var ConceptList = require('./conceptlist');
var Concept = require('./concept');
var Message = require('./message');

module.exports = React.createClass({

  render: function() {
    var examples = this.props.language.queryExamples.map(function(values){
      return <a href={ values.href }>{values.label}</a>  ;
    });

    var geojson = this.props.geojson;
    if (geojson && geojson.features) {
      if (geojson.features.length > 0) {
        return (
          <div className='box list-box' id='concepts-box'>
            <ConceptList config={this.props.config} language={this.props.language} geojson={this.props.geojson} map={this.props.map} route={this.props.route} />
          </div>
        );
      } else {
        if (!this.props.route.hidden.getValue()) {
          return (
            <div className='box list-box'>
              <Message message={language.noConceptsFound} error={true} onMessageClose={this.messageClose} />
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
          <p className="examples">{ this.props.language.queryExamplesIntro }: {examples}</p>
        </div>
      );
    }
  },

  messageClose: function() {
    this.props.route.hidden.set(true);
  }

});
