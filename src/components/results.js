'use strict';

var React = require('react');
var ConceptList = require('./conceptlist');
var Message = require('./message');

module.exports = React.createClass({
  getInitialState: function() {
    return {
      // graphHidden: true,
      // featureGroups: L.featureGroup().addTo(map),
      // pitLayers: {}
    };
  },

  render: function() {
    var geojson = this.props.geojson;
    if (geojson && geojson.features) {
      if (geojson.features.length > 0) {
        return (
          <ConceptList geojson={this.props.geojson} map={this.props.map} route={this.props.route} />
        );
      } else {
        var message = 'No concepts found';
        return (
          <div className="box list-box"><Message message={message} error={true} /></div>
        );
      }
    } else {
      // if needed, welcome/introduction message could be returned here
      return null;
    }





    // var conceptBox = null,
    //     hideConceptList = false;
    //
    // if (!this.props.geojson) {
    //   return null;
    // }

    // if (this.props.selected != -1) {
    //   var feature = this.props.geojson.features[this.props.selected],
    //       hideConceptList = true
    //   var conceptBox = (
    //     <div>
    //       <ConceptBoxResults feature={feature} back={this.handleBack} showGraph={this.showGraph} graphHidden={this.state.graphHidden}/>
    //       <ConceptBoxList feature={feature} featureGroups={this.state.featureGroups}
    //           pitLayers={this.state.pitLayers}/>
    //       <Graph feature={feature} graphHidden={this.state.graphHidden}/>
    //     </div>
    //   );
    // }
    //
    // if (this.props.geojson && this.props.geojson.features && this.props.geojson.features.length > 0) {
    //   var className = (hideConceptList || this.props.hidden) ? "hidden" : "";
    //
    //   return (
    //     <div>
    //       <div className={className}>
    //         <ConceptsBoxResults features={this.props.geojson.features} hide={this.handleHide}/>
    //         <ConceptsBoxList features={this.props.geojson.features} featureGroups={this.state.featureGroups}
    //             pitLayers={this.state.pitLayers} onSelect={this.handleSelect}/>
    //       </div>
    //       {conceptBox}
    //     </div>
    //   );
    // } else {
    //   return (
    //     <div className={className}>
    //       <ConceptsBoxResults error={this.props.error} hide={this.handleHide}/>
    //     </div>
    //   );
    // }
  },

  showGraph: function() {
    // this.setState({graphHidden: !this.state.graphHidden});
  },

  handleBack: function(event) {
    // this.setState({graphHidden: true});
    //
    // this.setProps({
    //   selected: -1
    // });
    event.preventDefault();
  },

  handleHide: function(event) {
    // this.setProps({
    //   hidden: true
    // });

    event.preventDefault();
  },

  handleSelect: function(index) {
    // this.setProps({
    //   selected: index
    // });
  }
});

//

//
// /**
//  * Components for single concept
//  */
//

//
// // TODO: map element as props, svg element as props
// var resultsBox = React.render(
//   <ResultsBox />,
//   document.getElementById('concepts-box')
// );