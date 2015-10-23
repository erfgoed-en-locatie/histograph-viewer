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
      // TODO: Use something like React Router for hash routing?
      // TODO: add route for selection of single concept (and even PIT?)

      var value = React.findDOMNode(this.refs.searchInput).value;

      if (value) {
        var query = this.stringToQuery(value);
      } else {
        query = {};
      }

      this.callApi(this.queryToString(query));
      this.setHash('search=' + encodeURIComponent(value));
    }
  },

  queryToString: function(query) {
    var parts = [];
    Object.keys(query).forEach(function(param) {
      parts.push(param + '=' + query[param].join(','));
    });
    return parts.join('&');
  },

  stringToQuery: function(str) {
    searchTypes = [
      'q',
      'id',
      'uri',
      'name'
    ];

    var search = [];
    var params = {};
    str.match(/(?:[^\s"]+|"[^"]*")+/g)
      .map(function(part) {
        return part.trim();
      })
      .filter(function(part) {
        return part;
      })
      .forEach(function(part) {
        if (part.indexOf('=') > -1) {
          var paramValue = part.split('=');
          var param = paramValue[0].trim();
          var value = paramValue[1].trim();

          if (searchTypes.indexOf(param) > -1) {
            search.push(value);
          } else if (param) {
            if (!params[param]) {
              params[param] = [];
            }
            params[param].push(value);
          }
        } else {
          search.push(part);
        }
      });

    if (!search.length) {
      search = ['*'];
    }

    params.q = search;

    return params;
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
          selected: geojson.features.length === 1 ? 0 : -1
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
    return this.props.config.api.baseUrl + 'search?' + queryString;
  },

  parseHash: function (hash) {
    // TODO: move to/merge with queryToString function
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
      React.findDOMNode(this.refs.searchInput).value = params.search;
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
