'use strict';

var React = require('react');
var Results = require('./components/results');
var SearchOptions = require('./components/search-options');
var Map = require('./components/map');
var Graph = require('./components/graph');
var d3 = require('d3');
var Cortex = require('cortexjs');

var disableHashChange = false;

module.exports = React.createClass({

  getInitialState: function() {
    return {
      sidebarWidth: 450,
      geojson: null,
      route: new Cortex({
        hidden: false
      }, function(updatedRoute) {
        this.setState({
          route: updatedRoute
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

            <Results geojson={this.state.geojson} route={this.state.route} ref='results' map={this.refs.map} />
          </div>
        </div>
        <SearchOptions />
        <Map route={this.state.route} sidebarWidth={this.state.sidebarWidth} ref='map' />
        <Graph geojson={this.state.geojson} route={this.state.route} ref='graph' />
      </div>
    );
  },

  componentDidMount: function() {
    React.findDOMNode(this.refs.searchInput).focus();

    window.onhashchange = window.onhashchange || function() {
      if (!disableHashChange) {
        this.handleHash(this.parseHash(location.hash.substring(1)));
      }
    }.bind(this);

    if (location.hash) {
      this.handleHash(this.parseHash(location.hash.substring(1)));
    }

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

      this.setHash('search=' + value);
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
      // TODO: use errorMessage

      var route = {
        error: errorMessage,
        fitBounds: true,
        search: query,
        hidden: false,
        graph: false,
        concept: {
          highlighted: -1,
          selected: -1
        },
        pit: {
          highlighted: -1
        }
      };

      this.state.geojson = geojson;
      this.state.route.set(route);
    }.bind(this));
  },

  componentDidUpdate: function() {
    if (this.state.route.fitBounds && this.state.route.fitBounds.getValue() &&
        this.state.geojson && this.state.geojson.features.length > 0) {
      this.refs.map.fitBounds(this.refs.map.getConceptLayer());
      this.state.route.fitBounds.set(false);
    }
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
  },

  parseHash: function (hash) {
    var params = {};
    decodeURIComponent(hash).split("&").forEach(function(param) {
      if (param.indexOf("=") > -1) {
        var kv = param.split("=");
        params[kv[0]] = kv.slice(1).join("=");
      }
    });

    return params;
  },

  handleHash: function (params){
    if (params.search) {
      d3.select("input[type=search]").property('value', params.search);
      this.search({keyCode: 13});
    }
  },

  setHash: function(hash){
    disableHashChange = true;
    location.hash = hash;
    setTimeout(function(){
      disableHashChange = false;
    }, 1000);
  }

});
