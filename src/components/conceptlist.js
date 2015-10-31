var React = require('react');
var Concept = require('./concept');
var Message = require('./message');

module.exports = React.createClass({

  render: function() {
    var geojson = this.props.route.geojson.getValue();
    var featuresWithGeometry = geojson.features.filter(function(feature) {
      return feature.geometry.geometries.length;
    });
    var featuresWithoutGeometry = geojson.features.filter(function(feature) {
      return !feature.geometry.geometries.length;
    });
    var selectedConcept = this.props.route.concept.selected.getValue();
    var message;
    var closeText;
    if (selectedConcept == -1) {
      if (geojson.features && geojson.features.length) {
        var concept = geojson.features.length == 1 ? this.props.language.placeConcept : this.props.language.placeConcepts;
        var message = geojson.features.length + ' ' + concept + ' ' + this.props.language.found;
        if (featuresWithoutGeometry.length) {
          message += ' (' + featuresWithoutGeometry.length + ' ' + this.props.language.withoutGeometry + ')';
        }
        message += ':';
      } else if (this.props.error) {
        message = this.props.language.error + ': ' + this.props.error;
      } else {
        message = this.props.language.noPlaceConceptsFound;
      }
    } else {
      message = this.props.language.oneConceptSelected;
      closeText = this.props.language.backToConceptList;
    }

    var className;
    if (this.props.route.hidden.getValue()) {
      className = 'hidden';
    }

    return (
      <div className={className}>
        <Message language={this.props.language} message={message} onMessageClose={this.messageClose} closeText={closeText} />
        <ol id='concepts' className="list">
          {featuresWithGeometry.map(function(feature, index) {
            if (selectedConcept == -1 || selectedConcept == index) {
              // Compute concept key from ids/uris
              var key = feature.properties.pits
                  .map(function(pit) {return pit.id || pit.uri; })
                  .join(',')
                  .hashCode();

              return <Concept config={this.props.config} language={this.props.language} key={key} route={this.props.route}
                  feature={feature} map={this.props.map} index={index} />;
            }
          }.bind(this))}
        </ol>
      </div>
    );
  },

  messageClose: function() {
    var selectedConcept = this.props.route.concept.selected.getValue();
    if (selectedConcept == -1) {
      this.props.route.hidden.set(true);
    } else {
      this.props.route.concept.selected.set(-1);
      this.props.route.fitBounds.set(true);
    }
  }

});
