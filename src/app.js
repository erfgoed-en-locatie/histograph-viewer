var React = require('react');
var Results = require('./components/results');
// var SearchOptions = require('./components/search-options');
var Map = require('./components/map');
var Graph = require('./components/graph');
var d3 = require('d3');
var Cortex = require('cortexjs');

var disableHashChange = false;

var defaultRoute = {
  geojson: {
    type: 'FeatureCollection',
    features: null
  },
  hidden: false
};

module.exports = React.createClass({

  getInitialState: function() {
    return {
      sidebarWidth: 450,
      route: new Cortex(defaultRoute, function(updatedRoute) {
        this.setState({
          route: updatedRoute
        });
      }.bind(this))
    };
  },

  render: function() {
    var logo;
    var inputStyle = {
       width: '100%'
    };

    if (this.props.config.viewer.logo) {
      logo = (<a href='http://histograph.io/'><img width='44px' src={this.props.config.viewer.logo} /></a>);
      inputStyle = {
        width: 'calc(100% - 52px)'
      }
    }

    return (
      <div>
        <div id='sidebar-container' className='box-container' ref='container'>
          <div className='box-container-padding'>
            <div id='search-box' className='box padding'>
              {logo}
              <input style={inputStyle} type='search' placeholder={this.props.language.searchPlaceholder}
                  onKeyDown={this.search} ref='searchInput' />
            </div>
            <Results config={this.props.config} language={this.props.language} route={this.state.route} ref='results' map={this.refs.map} />
          </div>
        </div>
        <Map route={this.state.route} sidebarWidth={this.state.sidebarWidth} ref='map' />
        <Graph toggleLeafs={this.toggleLeafs} showLeafs={this.state.showLeafs} route={this.state.route} ref='graph' />
      </div>
    );
  },

  toggleLeafs: function(){
    this.setState({showLeafs: !this.state.showLeafs });
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
      this.callApi(value);
      this.setHash('search=' + value);
    }
  },

  callApi: function(query) {
    if (!query) {
      this.state.route.set(defaultRoute);
      return;
    }

    d3.json(this.getApiUrl(query), function(error, geojson) {
      var errorMessage;
      if (error) {
        try {
          errorMessage = JSON.parse(error.response).error;
        } catch (e) {
          errorMessage = this.props.language.invalidResponse;
        }
      }
      // TODO: use errorMessage

      var route = {
        geojson: geojson,
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
      this.state.route.set(route);
    }.bind(this));
  },

  componentDidUpdate: function() {
    var fitBounds = this.state.route.fitBounds && this.state.route.fitBounds.getValue();
    var features = this.state.route.geojson && this.state.route.geojson.getValue().features;
    if (fitBounds && features.length) {
      this.refs.map.fitBounds(this.refs.map.getConceptLayer());
      this.state.route.fitBounds.set(false);
    }
  },

  getApiUrl: function(queryString) {
    return this.props.config.api.baseUrl + 'search?q=' + queryString;
  },

  parseHash: function (hash) {
    var params = {};
    decodeURIComponent(hash).split('&').forEach(function(param) {
      if (param.indexOf('=') > -1) {
        var kv = param.split('=');
        params[kv[0]] = kv.slice(1).join('=');
      }
    });

    return params;
  },

  handleHash: function (params){
    if (params.search) {
      d3.select('input[type=search]').property('value', params.search);
      this.search({keyCode: 13});
    }
  },

  setHash: function(hash){
    disableHashChange = true;
    location.hash = hash;
    setTimeout(function() {
      disableHashChange = false;
    }, 1000);
  }

});
