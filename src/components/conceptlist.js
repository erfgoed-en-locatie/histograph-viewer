'use strict';

var React = require('react');
var L = require('leaflet');
var Concept = require('./concept');
var Message = require('./message');

var languages = {
  english: require('../language/english.json'),
  dutch: require('../language/dutch.json')
};

var language = languages.english;
language = languages.dutch;

module.exports = React.createClass({

  render: function() {
    var selectedConcept = this.props.route.concept.selected.getValue();
    var geojson = this.props.geojson;
    var message;
    var closeText;
    if (selectedConcept == -1) {
      if (geojson.features && geojson.features.length) {
        var concept = geojson.features.length == 1 ? language.place_concept : language.place_concepts,
            message = geojson.features.length + " " + concept + " " + language.found + ":";
      } else if (this.props.error) {
        // TODO: error
        message = language.error + ": " + "FOUT";
      } else {
        message = language.no_place_concepts_found;
      }
    } else {
      message = language.one_concept_selected;
      closeText = language.back_to_concept_list;
    }

    var className;
    if (this.props.route.hidden.getValue()) {
      className = 'hidden';
    }

    return (
      <div className={className}>
        <Message message={message} onMessageClose={this.messageClose} closeText={closeText} />
        <ol id="concepts" className="list">
          {geojson.features.map(function(feature, index) {
            if (selectedConcept == -1 || selectedConcept == index) {
              // Compute subgraph key from hgids
              var key = feature.properties.pits
                  .map(function(pit) {return pit.hgid; })
                  .join(",")
                  .hashCode();

              return <Concept key={key} route={this.props.route}
                  feature={this.props.geojson.features[index]} map={this.props.map} index={index} />;

              // <ConceptsBoxList features={this.props.geojson.features} featureGroups={this.state.featureGroups}
              //   pitLayers={this.state.pitLayers} onSelect={this.handleSelect}/>


              // var boundSelect = this.handleSelect.bind(this, index),
              //     boundUpdateOtherConcepts = this.updateOtherConcepts.bind(this, index);

              // return <ConceptsBoxListItem key={key} feature={feature} index={index}
              //     featureGroups={this.props.featureGroups} pitLayers={this.props.pitLayers}
              //     onSelect={boundSelect} ref={'item' + index}
              //     updateOtherConcepts={boundUpdateOtherConcepts}/>;
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




















// var ResultsBox = React.createClass({
//

// });
//
// /**
//  * Components for list of concepts
//  */
//

//
// var ConceptsBoxList = React.createClass({
//
//   handleSelect: function(index) {
//     this.props.onSelect(index)
//   },
//
//   updateOtherConcepts: function(callingIndex, state) {
//     for (var ref in this.refs) {
//       var item = this.refs[ref];
//       if (callingIndex != item.props.index) {
//         item.setState(state);
//       }
//     }
//   },
//
//   render: function() {
//     return (
//       <ol id="concepts" className="list">
//         {this.props.features.map(function(feature, index) {
//           // Compute subgraph key from hgids
//           var key = feature.properties.pits
//               .map(function(pit) {return pit.hgid; })
//               .join(",")
//               .hashCode();
//
//           var boundSelect = this.handleSelect.bind(this, index),
//               boundUpdateOtherConcepts = this.updateOtherConcepts.bind(this, index);
//
//           return <ConceptsBoxListItem key={key} feature={feature} index={index}
//               featureGroups={this.props.featureGroups} pitLayers={this.props.pitLayers}
//               onSelect={boundSelect} ref={'item' + index}
//               updateOtherConcepts={boundUpdateOtherConcepts}/>;
//         }.bind(this))}
//       </ol>
//     );
//   },
//
//   componentDidMount: function() {
//     fitBounds(this.props.featureGroups.getBounds());
//   },
//
//   componentDidUpdate: function() {
//     fitBounds(this.props.featureGroups.getBounds());
//   }
// });

