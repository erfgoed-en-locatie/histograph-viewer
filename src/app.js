'use strict';

var React = require('react');
var Results = require('./components/results');
var Map = require('./components/map');
var d3 = require('d3');
var Cortex = require('cortexjs');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      sidebarWidth: 450,
      geojson: new Cortex({}, function(updatedCortex) {
        this.setState({
          geojson: updatedCortex
        });
      }.bind(this))
    };
  },

  render: function() {
    return (
      <div>
        <div id='sidebar-container' className='box-container' ref='container'>
          <div className='box-container-padding'>

            <div id='search-box' className='box padding'>
              <a href='http://histograph.io/'><img src='images/histograph.svg' /></a>
              <input type='search' placeholder='Search by name, Histograph ID, or URI'
                  onKeyDown={this.search} ref='searchInput' />
            </div>

            <Results geojson={this.state.geojson} ref='results' map={this.refs.map} />
          </div>
        </div>
        <Map geojson={this.state.geojson} sidebarWidth={this.state.sidebarWidth} ref='map' />
      </div>
    );
  },

  componentDidMount: function() {
    React.findDOMNode(this.refs.searchInput).focus();
    this.setState({
      sidebarWidth: React.findDOMNode(this.refs.container).offsetWidth
    });
  },

  search: function(event) {
    if (event.keyCode == 13) {
      var value = React.findDOMNode(this.refs.searchInput).value;
      // TODO: hash! react router?
      //setHash('search=' + value);
      this.callApi(value);
    }
  },

  callApi: function(query) {
    d3.json(this.getApiUrl(query), function(error, geojson) {
      var errorMessage = null;
      if (error) {
        try {
          errorMessage = JSON.parse(error.response).error;
        } catch (e) {
          errorMessage = 'Invalid reponse from Histograph API';
        }
      }

      this.state.geojson.set(geojson);

      // document.getElementById('concepts-box').scrollTop = 0;


    }.bind(this));
  },

  getApiUrl: function(queryString) {
    var url = this.props.apiUrl + 'search?';
    var matches = queryString.match(/(\S*)=(\S*)/g);
    var params = [];

    if (matches) {
      matches.forEach(function(match) {
        queryString = queryString.replace(match, '');
        params.push(match);
      });
    }

    if (queryString.indexOf('http') > -1) {
      params.push('uri=' + queryString.trim());
    } else if (queryString.indexOf('/') > -1) {
      params.push('hgid=' + queryString.trim());
    } else {
      params.push('name=' + queryString.trim());
    }

    return url + params.join('&');
  }

});
