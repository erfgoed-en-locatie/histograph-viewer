var React = require('react');
var Pit = require('./pit');

module.exports = React.createClass({

  getInitialState: function() {
    var firstPit = this.props.feature.properties.pits[0];
    var firstId = firstPit.id || firstPit.uri;
    var sortFields = [
      '# relations',
      'name',
      'period',
      'dataset'
    ];

    var datasets = this.props.datasets
      .reduce(function(o, v) {
        o[v] = true;
        return o;
      }, {});

    var apiUrl = this.props.config.api.baseUrl + 'search?q=' + firstId;

    return {
      links: this.getLinks(apiUrl, firstId).map(this.transformToAnchor),
      loop: {
        index: 0,
        timer: null,
        delay: 800
      },
      filters: {
        datasets: datasets,
        name: /.*/,
        geometryTypes: {
          none: true,
          points: true,
          lines: true,
          polygons: true
        }
      },
      sortField: sortFields[0],
      sortFields: sortFields
    };
  },

  componentDidMount: function() {
    document.getElementById('concepts-box').scrollTop = 0;
  },

  render: function() {
    var language = this.props.language;
    var pitCount = this.props.feature.properties.pits.length;
    var message = " " + pitCount + " " + language.place + " "
        + ((pitCount == 1) ? language.name : language.names);

    // NU HET
    // pits
    // relations
    // geometries

    var filteredPits = this.props.feature.properties.pits
        .filter(function(pit) {
          var filterGeometryType = 'none';
          if (pit.geometryIndex > -1) {
            var geometryType = this.props.feature.geometry.geometries[pit.geometryIndex].type;
            if (geometryType === "Point" || geometryType === "MultiPoint") {
              filterGeometryType = "points";
            } else if (geometryType === "LineString" || geometryType === "MultiLineString") {
              filterGeometryType = "lines";
            } else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
              filterGeometryType = "polygons";
            }
          }

          return this.state.filters.geometryTypes[filterGeometryType]
              && this.state.filters.name.test(pit.name ? pit.name.toLowerCase() : '')
              && this.state.filters.datasets[pit.dataset];
        }.bind(this));

    if (this.state.sortField != this.state.sortFields[0]) {
      filteredPits.sort(function(a, b) {
        if (this.state.sortField == 'name') {
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        } else if (this.state.sortField == 'period') {
          var dateA = a.hasBeginning || a.hasEnd,
              dateB = b.hasBeginning || b.hasEnd;

          // http://stackoverflow.com/questions/11526504/minimum-and-maximum-date
          if (!dateA) dateA = 8640000000000000;
          if (!dateB) dateB = 8640000000000000;

          return (new Date(dateA)) - (new Date(dateB));
        } else if (this.state.sortField == 'dataset') {
          return a.source.localeCompare(b.dataset);
        }
      }.bind(this));
    }

    var pits = filteredPits.map(function(pit, index) {
      return <Pit key={pit.uri || pit.id} pit={pit} feature={this.props.feature} index={index}
          ref={'item' + index} />;
    }.bind(this));

    var geometryCount = filteredPits.filter(function(pit) {
      return pit.geometryIndex > -1;
    }).length;

    var filterMessage;

    var pitsCount = this.props.feature.properties.pits.length,
        relationsCount = 0;
    this.props.feature.properties.pits.forEach(function(pit) {
      if(!pit.relations) return;

      var keys = Object.keys(pit.relations);

      if(keys.length > 1){
        keys.forEach(function(key){
          if(key !== '@id'){
            relationsCount += pit.relations[key].length;
          }
        });
      }
    });

    // {message}  <a id="show-graph" className="float-right" href="#" onClick={this.showGraph}>Show graph</a>


    return (
      <div>
        <div className='side-padding'>
          <table>
            <tbody>
              <tr>
                <td className='label'>{language.data}</td>
                <td className='links'>
                  {this.state.links}
                </td>
              </tr>

              <tr>
                <td className='label'>{language.concept}</td>
                <td>
                  {pitsCount} {language.placeNames}, {relationsCount} {language.relations} (<a href='javascript:void(0)' onClick={this.showGraph}>{ this.state.graphHidden ? language.hide : language.show } { language.graph }</a>)
                </td>
              </tr>

              <tr style={{display: 'none'}}>
                <td className='label'>{ language.filters }</td>
                <td>
                  <a href='javascript:void(0)'>{ language.filterPlaceNames }</a>
                </td>
              </tr>

            </tbody>
          </table>
          <p>
            {filterMessage}
          </p>
        </div>

        <ol id="pits" className="list">
          {pits}
        </ol>

      </div>
    );
  },

  getLinks: function(apiUrl, id) {
    return this.props.linkFormatters.map(function(linkFormatter, index) {
      return {
        title: linkFormatter.title,
        href: linkFormatter.format(apiUrl, id)
      };
    });
  },

  transformToAnchor: function(a, i) {
    return <span key={i}><a href={a.href}>{a.title}</a></span>;
  },

  sort: function(field, event) {
    this.state.sortField = field;
    this.forceUpdate();
    event.preventDefault();
  },

  toggleLoop: function() {
    if (!this.state.loop.timer) {
      this.state.loop.timer = setTimeout(this.loopStep, this.state.loop.delay);
    } else {
      clearTimeout(this.state.loop.timer);
      this.state.loop.index = -1;
      this.state.loop.timer = undefined;
    }
    this.forceUpdate();
  },

  loopStep: function() {
    var refKeys = Object.keys(this.refs);
    for (var i = 0; i < refKeys.length; i++) {
      var newIndex = (i + this.state.loop.index + 1) % refKeys.length;
      if (this.refs[refKeys[newIndex]].props.pit.geometryIndex > -1) {
        this.state.loop.index = newIndex;
        break;
      }
    }

    for (var ref in this.refs) {
      var item = this.refs[ref];
      if (this.state.loop.index == item.props.index) {
        item.state.selected = true;
        item.state.unfade = false;
      } else {
        item.state.selected = false;
        item.state.unfade = false;
      }
    }

    this.state.loop.timer = setTimeout(this.loopStep, this.state.loop.delay);
    this.forceUpdate();
  },

  filterName: function(event) {
    var value = document.getElementById("pit-name-filter").value.toLowerCase();
    this.state.filters.name = new RegExp(".*" + value + ".*");
    this.forceUpdate();
  },

  filterGeometryType: function(geometryType, event) {
    this.state.filters.geometryTypes[geometryType] = !this.state.filters.geometryTypes[geometryType];
    event.preventDefault();
    this.forceUpdate();
  },

  filterDataset: function(dataset, event) {
    if (event.shiftKey) {
      var current = this.state.filters.datasets[dataset];

      var count = 0;
      for (s in this.state.filters.datasets) {
        count += this.state.filters.datasets[s] ? 1 : 0;
      }

      var length = Object.keys(this.state.filters.datasets).length;
      if (length == count) {
        current = !current;
      }

      for (s in this.state.filters.datasets) {
        this.state.filters.datasets[s] = current;
      }
      this.state.filters.datasets[dataset] = !current;
    } else {
      this.state.filters.datasets[dataset] = !this.state.filters.datasets[dataset];
    }

    event.preventDefault();
    this.forceUpdate();
  },

  showGraph: function(){
    this.setState({graphHidden: !this.state.graphHidden});

    this.props.route.graph.set(!this.props.route.graph.getValue());
  }

});
