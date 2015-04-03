// var ConceptBoxResults = React.createClass({
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
//
// var Pit = React.createClass({
//   getInitialState: function() {
//     return {
//       selected: false,
//       unfade: true
//     };
//   },
//
//   render: function() {
//     var pit = this.props.pit,
//         uriRow,
//         geometryRow,
//         periodRow,
//         geometrySpan,
//         buttons;
//
//     if (pit.uri) {
//       uriRow = (<tr><td className="label">URI</td><td><a href={pit.uri}>{pit.uri}</a></td></tr>);
//     }
//
//     if (pit.geometryIndex > -1) {
//       geometryRow = (<tr><td className="label">Geometry</td><td>Jaatjes</td></tr>);
//     }
//
//     if (pit.hasBeginning || pit.hasEnd) {
//       var period;
//       if (pit.hasBeginning && pit.hasEnd) {
//         period = pit.hasBeginning + " - " + pit.hasEnd;
//       } else if (pit.hasBeginning) {
//         period = "from " + pit.hasBeginning;
//       } else if (pit.hasEnd) {
//         period = "until " + pit.hasEnd;
//       }
//       periodRow = (<tr><td className="label">Period</td><td>{period}</td></tr>);
//     }
//
//     if (pit.geometryIndex > -1) {
//       var className = "float-right geometry-type ",
//           geometryType = this.props.feature.geometry.geometries[pit.geometryIndex].type;
//
//       if (geometryType === "Point" || geometryType === "MultiPoint") {
//         className += "geometry-type-point";
//       } else if (geometryType === "LineString" || geometryType === "MultiLineString") {
//         className += "geometry-type-line";
//       } else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
//         className += "geometry-type-polygon";
//       }
//       geometrySpan = (<span className={className}/>);
//
//       buttons = (
//         <div className="buttons">
//           <button className="zoom" onClick={this.zoom} title="Zoom and pan map to place name">Zoom</button>
//           <button className="select" onClick={this.select} title="Select place name (and fade others)">Select</button>
//         </div>
//       );
//     }
//
//     var className = "padding pit" + (!this.state.selected &! this.state.unfade ? " faded" : "");
//
//     return (
//       <li className={className}>
//         <h6>{pit.name}{geometrySpan}</h6>
//         <div>
//           <table>
//             <tbody>
//               <tr>
//                 <td className="label">ID</td>
//                 <td><code>{pit.hgid}</code></td>
//               </tr>
//               {uriRow}
//               {periodRow}
//             </tbody>
//           </table>
//           {buttons}
//           <div className="clear" />
//         </div>
//       </li>
//     );
//   },
//
//   zoom: function(params) {
//     if (!params.noFitBounds) {
//       fitBounds(this.props.pitLayers[this.props.pit.hgid].layer.getBounds());
//     } else {
//       //TODO: fix -60 hack!
//       document.getElementById("concepts-box").scrollTop = React.findDOMNode(this).offsetTop - 60;
//     }
//
//     this.props.updateOtherPits({selected: false, unfade: false});
//     this.setState({selected: true, unfade: false});
//   },
//
//   select: function(params) {
//     this.props.updateOtherPits({selected: false, unfade: false});
//     this.setState({selected: true, unfade: false});
//   },
//
//   setLayerStyle: function(style) {
//     if (this.props.pit.geometryIndex > -1) {
//       var pitLayer = this.props.pitLayers[this.props.pit.hgid],
//           layer = pitLayer ? pitLayer.layer : undefined;
//
//       if (layer) {
//         if (style.point && style.line) {
//           if (layer.options.geometryType == "Point") {
//             layer.setStyle(style.point);
//           } else {
//             layer.setStyle(style.line);
//           }
//         } else {
//           layer.setStyle(style);
//         }
//
//       }
//     }
//   },
//
//   componentDidUpdate: function() {
//     this.setLayerStyle(!this.state.selected &! this.state.unfade ? fadedStyle : defaultStyle);
//   },
//
//   componentWillMount: function() {
//     this.setLayerStyle({
//       fill: true,
//       stroke: true
//     });
//   },
//
//   componentWillUnmount: function() {
//     this.setLayerStyle({
//       fill: false,
//       stroke: false
//     });
//   }
//
// });