'use strict';

var React = require('react');
var Pit = require('./pit');

var languages = {
  english: require('../language/english.json'),
  dutch: require('../language/dutch.json')
};

var language = languages.english;
language = languages.dutch;

var linkFormatters = {
      histograph: function(apiUrl, firstHgid){ return apiUrl },
      geothesaurus: function(apiUrl, firstHgid){ return 'http://geothesaurus.nl/hgconcept/frompit/' + firstHgid; },
      jsonld: function(apiUrl, firstHgid){ return "http://json-ld.org/playground/index.html#startTab=tab-normalized&json-ld=" + apiUrl; },
      geojson: function(apiUrl, firstHgid){ return "http://geojson.io/#data=data:text/x-url, " + encodeURIComponent(apiUrl); }
    },
    linkLabels = {
      histograph: 'API',
      geothesaurus: 'GeoThesaurus',
      jsonld: 'JSON-LD',
      geojson: 'geojson.io'
    };

function getLinks(feature, linksWanted){
  var firstHgid = feature.properties.pits[0].hgid,
      apiUrl = 'https://api.erfgeo.nl/search?hgid=' + firstHgid, // getApiURL();
      links = [];

  linksWanted.forEach(function(value){
    if(!linkFormatters[value]){
      throw(new Error('getLinks:linkFormatterNotFound:' + value));
    }

    links.push({ label: linkLabels[value], href: linkFormatters[value](apiUrl, firstHgid) });
  });

  return links;
}

function transformToAnchor(a){
  return <span><a href={a.href}>{a.label}</a></span>;
}

module.exports = React.createClass({

  getInitialState: function() {
    var sortFields = [
      "# relations",
      "name",
      "period",
      "source"
    ];

    var sources = this.props.sources
        .reduce(function(o, v) {
          o[v] = true;
          return o;
        }, {});

    var firstHgid = this.props.feature.properties.pits[0].hgid;
    // TODO: use getApiURL function
    var apiUrl = 'https://api.erfgeo.nl/search?hgid=' + firstHgid;



    return {
      links: getLinks(this.props.feature, ['histograph', 'geothesaurus', 'jsonld', 'geojson']).map(transformToAnchor),
      loop: {
        index: 0,
        timer: null,
        delay: 800
      },
      hgids: {

      },
      filters: {
        sources: sources,
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
    var pitCount = this.props.feature.properties.pits.length;
    var message = language.Concept_contains + " " + pitCount + " " + language.place + " "
        + ((pitCount == 1) ? language.name : language.names);

    var filteredPits = this.props.feature.properties.pits
        .filter(function(pit) {
          var filterGeometryType = "none";
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
              && this.state.filters.name.test(pit.name.toLowerCase())
              && this.state.filters.sources[pit.source];
        }.bind(this));

    if (this.state.sortField != this.state.sortFields[0]) {
      filteredPits.sort(function(a, b) {
        if (this.state.sortField == "name") {
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        } else if (this.state.sortField == "period") {
          var dateA = a.hasBeginning || a.hasEnd,
              dateB = b.hasBeginning || b.hasEnd;

          // http://stackoverflow.com/questions/11526504/minimum-and-maximum-date
          if (!dateA) dateA = 8640000000000000;
          if (!dateB) dateB = 8640000000000000;

          return (new Date(dateA)) - (new Date(dateB));
        } else if (this.state.sortField == "source") {
          return a.source.localeCompare(b.source);
        }
      }.bind(this));
    }

    var pits = filteredPits.map(function(pit, index) {
      return <Pit key={pit.hgid} pit={pit} feature={this.props.feature} index={index}
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
                <td className="label">{ language.Data }</td>
                <td className="links">
                  {this.state.links}
                </td>
              </tr>

              <tr>
                <td className="label">{ console.log(this) || language.Concept }</td>
                <td>
                  { pitsCount } { language.place } {language.names}, { relationsCount } {language.relations} (<a href='#' onClick={this.showGraph}>{ this.state.graphHidden ? language.hide : language.show } { language.graph }</a>)
                </td>
              </tr>

              <tr style={{display: 'none'}}>
                <td className="label">{ language.Filters }</td>
                <td>
                  <a href='javascript:void(0)'>{ language.filter_place_names }</a>
                </td>
              </tr>

            </tbody>
            <tbody className="hidden indent">
              <tr>
                <td className="label">{ language.Names }</td>
                <td>
                  <input type="search" placeholder={ language.filter_names } id="pit-name-filter" onChange={this.filterName}/>
                </td>
              </tr>
              <tr>
                <td className="label">{ language.Sources }</td>
                <td>
                  <span className="source-list">
                    {this.props.sources.map(function(source, index) {
                      var boundFilterSource = this.filterSource.bind(this, source),
                          className = this.state.filters.sources[source] ? "" : "filtered";
                      return <span key={source}><a className={className} href="#"
                                onClick={boundFilterSource}><code>{source}</code></a> </span>;
                    }.bind(this))}
                  </span>
                </td>
              </tr>

              <tr>
                <td className="label">{ language.Geom }</td>
                <td>
                  <span className="geometry-type-list">
                    {Object.keys(this.state.filters.geometryTypes).map(function(geometryType, index) {
                      var boundFilterGeometryType = this.filterGeometryType.bind(this, geometryType),
                          //geometry-type
                          className = this.state.filters.geometryTypes[geometryType] ? "" : "filtered";
                      return <span key={geometryType}><a className={className} href="#"
                                onClick={boundFilterGeometryType}>{geometryType}</a></span>;
                    }.bind(this))}
                  </span>
                </td>
              </tr>

              <tr>
                <td className="label">{ language.Sort }</td>
                <td className="sort-fields">
                  {this.state.sortFields.map(function(field, index) {
                    var boundSort = this.sort.bind(this, field),
                        className = this.state.sortField === field ? "selected" : "";
                    return <span key={field}><a className={className} href="#" onClick={boundSort}>{field}</a></span>;
                  }.bind(this))}
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

  filterSource: function(source, event) {
    if (event.shiftKey) {
      var current = this.state.filters.sources[source];

      var count = 0;
      for (s in this.state.filters.sources) {
        count += this.state.filters.sources[s] ? 1 : 0;
      }

      var length = Object.keys(this.state.filters.sources).length;
      if (length == count) {
        current = !current;
      }

      for (s in this.state.filters.sources) {
        this.state.filters.sources[s] = current;
      }
      this.state.filters.sources[source] = !current;
    } else {
      this.state.filters.sources[source] = !this.state.filters.sources[source];
    }

    event.preventDefault();
    this.forceUpdate();
  },

  showGraph: function(){
    this.setState({graphHidden: !this.state.graphHidden});

    this.props.route.graph.set(!this.props.route.graph.getValue());
  }



});

//
//
// 'use strict';
//
// var React = require('react');
//
// module.exports = React.createClass({
//   render: function() {
//     var feature = this.props.feature;
//     var sortedNames = sortNames(feature.properties.pits),
//         selectedName = sortedNames[0].name;
//         pitCount = feature.properties.pits.length,
//         message = "Concept contains " + pitCount + " place "
//             + ((pitCount == 1) ? "name" : "names");
//
//     return (
//       <div>
//         <div id="pits-results" className="padding results">
//           1 concept selected:
//           <a id="pits-close" className="float-right" href="#" onClick={this.props.back}>Back to concept list</a>
//         </div>
//         <div id="pits-header" className="padding">
//           <h5>{selectedName}<code>{this.props.feature.properties.type.replace("hg:", "")}</code></h5>
//           <div className="cell-padding">
//             {message}
//             <a id="show-graph" className="float-right" href="#" onClick={this.showGraph}>{this.props.graphHidden ? "Show graph" : "Hide graph"}</a>
//           </div>
//         </div>
//       </div>
//     );
//   },
//
//   showGraph: function(event) {
//     this.props.showGraph();
//     event.preventDefault();
//   }
// });
//
// var ConceptBoxList = React.createClass({
//   getInitialState: function() {
//     var sortFields = [
//           "# relations",
//           "name",
//           "period",
//           "source"
//         ],
//         sources = this.props.feature.properties.pits
//           .map(function(pit) { return pit.source; })
//           .unique()
//           .reduce(function(o, v) {
//             o[v] = true;
//             return o;
//           }, {});
//
//     return {
//       loop: {
//         index: 0,
//         timer: null,
//         delay: 800
//       },
//       hgids: {
//
//       },
//       filters: {
//         sources: sources,
//         name: /.*/,
//         geometryTypes: {
//           none: true,
//           points: true,
//           lines: true,
//           polygons: true
//         }
//       },
//       sortField: sortFields[0],
//       sortFields: sortFields
//     };
//   },
//
//   render: function() {
//     var sources = this.props.feature.properties.pits
//             .map(function(pit) { return pit.source; })
//             .unique()
//         filteredPits = this.props.feature.properties.pits
//             .filter(function(pit) {
//               filterGeometryType = "none";
//               if (pit.geometryIndex > -1) {
//                 var geometryType = this.props.feature.geometry.geometries[pit.geometryIndex].type;
//                 if (geometryType === "Point" || geometryType === "MultiPoint") {
//                   filterGeometryType = "points";
//                 } else if (geometryType === "LineString" || geometryType === "MultiLineString") {
//                   filterGeometryType = "lines";
//                 } else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
//                   filterGeometryType = "polygons";
//                 }
//               }
//
//               return this.state.filters.geometryTypes[filterGeometryType]
//                   && this.state.filters.name.test(pit.name.toLowerCase())
//                   && this.state.filters.sources[pit.source];
//             }.bind(this));
//
//     if (this.state.sortField != this.state.sortFields[0]) {
//       filteredPits.sort(function(a, b) {
//         if (this.state.sortField == "name") {
//           return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
//         } else if (this.state.sortField == "period") {
//           var dateA = a.hasBeginning || a.hasEnd,
//               dateB = b.hasBeginning || b.hasEnd;
//
//           // http://stackoverflow.com/questions/11526504/minimum-and-maximum-date
//           if (!dateA) dateA = 8640000000000000;
//           if (!dateB) dateB = 8640000000000000;
//
//           return (new Date(dateA)) - (new Date(dateB));
//         } else if (this.state.sortField == "source") {
//           return a.source.localeCompare(b.source);
//         }
//       }.bind(this));
//     }
//
//     // // Set hgids, filtered hgids and disabled hgids (that did not pass filter) in state
//     // var allHgids = this.props.feature.properties.pits.map(function(pit) { return pit.hgid; }),
//     //     filteredHgids = filteredPits.map(function(pit) { return pit.hgid; });
//     //
//     // this.state.hgids = {
//     //   all: allHgids
//     //   filtered: filteredHgids
//     //   disabled: allHgids.filter(function(hgid) { return filteredHgids.indexOf(hgid) < 0 });
//     // };
//
//     var geometryCount = filteredPits.filter(function(pit) {
//       return pit.geometryIndex > -1;
//     }).length;
//
//     var pitComponents = filteredPits.map(function(pit, index) {
//       var boundUpdateOtherPits = this.updateOtherPits.bind(this, index);
//       return <Pit key={pit.hgid} pit={pit} feature={this.props.feature} index={index}
//           featureGroups={this.props.featureGroups} pitLayers={this.props.pitLayers}
//           ref={'item' + index} updateOtherPits={boundUpdateOtherPits}/>;
//     }.bind(this));
//
//     var filterMessage;
//     if (filteredPits.length > 0) {
//       var loopMessage = this.state.loop.timer ? "Stop " : "Timelapse ";
//       filterMessage = <span>
//           Showing {filteredPits.length} place {filteredPits.length == 1 ? "name" : "names"} ({geometryCount} on map):
//           <a title="Start timelapse - loop selected place names" id="loop-pits" className="float-right" href="#" onClick={this.toggleLoop}>
//             {loopMessage}
//           <img src="images/rocket.png" height="18px"/></a>
//           </span>;
//     } else {
//       filterMessage = <span>No place names matching your filter</span>;
//     }
//
//     var firstHgid = this.props.feature.properties.pits[0].hgid,
//         apiUrl = getApiUrl(firstHgid),
//         links = {
//           histograph: apiUrl,
//           jsonld: "http://json-ld.org/playground/index.html#startTab=tab-normalized&json-ld=" + apiUrl,
//           geojson: "http://geojson.io/#data=data:text/x-url, " + encodeURIComponent(apiUrl)
//         };
//
//     return (
//       <div>
//         <div className="padding">
//           <table className="indent">
//             <tbody>
//               <tr>
//                 <td className="label">Data</td>
//                 <td>
//                   <a href={links['histograph']}>API</a>, <a href={links['jsonld']}>JSON-LD Playground</a>, <a href={links['geojson']}>geojson.io</a>
//                 </td>
//               </tr>
//               <tr>
//                 <td className="label">Names</td>
//                 <td>
//                   <input type="search" placeholder="Filter names" id="pit-name-filter" onChange={this.filterName}/>
//                 </td>
//               </tr>
//               <tr>
//                 <td className="label">Sources</td>
//                 <td>
//                   <span className="source-list">
//                     {sources.map(function(source, index) {
//                       var boundFilterSource = this.filterSource.bind(this, source),
//                           className = this.state.filters.sources[source] ? "" : "filtered";
//                       return <span key={source}><a className={className} href="#"
//                                 onClick={boundFilterSource}><code>{source}</code></a> </span>;
//                     }.bind(this))}
//                   </span>
//                 </td>
//               </tr>
//
//               <tr>
//                 <td className="label">Geom</td>
//                 <td>
//                   <span className="geometry-type-list">
//                     {Object.keys(this.state.filters.geometryTypes).map(function(geometryType, index) {
//                       var boundFilterGeometryType = this.filterGeometryType.bind(this, geometryType),
//                           //geometry-type
//                           className = this.state.filters.geometryTypes[geometryType] ? "" : "filtered";
//                       return <span key={geometryType}><a className={className} href="#"
//                                 onClick={boundFilterGeometryType}>{geometryType}</a></span>;
//                     }.bind(this))}
//                   </span>
//                 </td>
//               </tr>
//
//               <tr>
//                 <td className="label">Sort</td>
//                 <td className="sort-fields">
//                   {this.state.sortFields.map(function(field, index) {
//                     var boundSort = this.sort.bind(this, field),
//                         className = this.state.sortField === field ? "selected" : "";
//                     return <span key={field}><a className={className} href="#" onClick={boundSort}>{field}</a></span>;
//                   }.bind(this))}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//           <p>
//             {filterMessage}
//           </p>
//         </div>
//         <ol id="pits" className="list">
//           {pitComponents}
//         </ol>
//       </div>
//     );
//   },
//
//   updateOtherPits: function(callingIndex, state) {
//     for (var ref in this.refs) {
//       var item = this.refs[ref];
//       if (callingIndex != item.props.index) {
//         // TODO: setstate? or item.state = ?
//         item.setState(state);
//       }
//     }
//   },
//
//   sort: function(field, event) {
//     this.state.sortField = field;
//     this.forceUpdate();
//     event.preventDefault();
//   },
//
//   toggleLoop: function() {
//     if (!this.state.loop.timer) {
//       this.state.loop.timer = setTimeout(this.loopStep, this.state.loop.delay);
//     } else {
//       clearTimeout(this.state.loop.timer);
//       this.state.loop.index = -1;
//       this.state.loop.timer = undefined;
//     }
//     this.forceUpdate();
//   },
//
//   loopStep: function() {
//     var refKeys = Object.keys(this.refs);
//     for (var i = 0; i < refKeys.length; i++) {
//       var newIndex = (i + this.state.loop.index + 1) % refKeys.length;
//       if (this.refs[refKeys[newIndex]].props.pit.geometryIndex > -1) {
//         this.state.loop.index = newIndex;
//         break;
//       }
//     }
//
//     for (var ref in this.refs) {
//       var item = this.refs[ref];
//       if (this.state.loop.index == item.props.index) {
//         item.state.selected = true;
//         item.state.unfade = false;
//       } else {
//         item.state.selected = false;
//         item.state.unfade = false;
//       }
//     }
//
//     this.state.loop.timer = setTimeout(this.loopStep, this.state.loop.delay);
//     this.forceUpdate();
//   },
//
//   filterName: function(event) {
//     var value = document.getElementById("pit-name-filter").value.toLowerCase();
//     this.state.filters.name = new RegExp(".*" + value + ".*");
//     this.forceUpdate();
//   },
//
//   filterGeometryType: function(geometryType, event) {
//     this.state.filters.geometryTypes[geometryType] = !this.state.filters.geometryTypes[geometryType];
//     event.preventDefault();
//     this.forceUpdate();
//   },
//
//   filterSource: function(source, event) {
//     if (event.shiftKey) {
//       var current = this.state.filters.sources[source];
//
//       var count = 0;
//       for (s in this.state.filters.sources) {
//         count += this.state.filters.sources[s] ? 1 : 0;
//       }
//
//       var length = Object.keys(this.state.filters.sources).length;
//       if (length == count) {
//         current = !current;
//       }
//
//       for (s in this.state.filters.sources) {
//         this.state.filters.sources[s] = current;
//       }
//       this.state.filters.sources[source] = !current;
//     } else {
//       this.state.filters.sources[source] = !this.state.filters.sources[source];
//     }
//
//     event.preventDefault();
//     this.forceUpdate();
//   }
//
// });
