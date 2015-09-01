            //
// <tbody className='indent hidden'>
//   <tr>
//     <td className='label'>{ language.names }</td>
//     <td>
//       <input type='search' placeholder={ language.filterNames } id="pit-name-filter" onChange={this.filterName}/>
//     </td>
//   </tr>
//   <tr>
//     <td className='label'>{ language.datasets }</td>
//     <td>
//       <span className='dataset-list'>
//         {this.props.datasets.map(function(dataset, index) {
//           var boundFilterDataset = this.filterDataset.bind(this, dataset),
//               className = this.state.filters.datasets[dataset] ? '' : 'filtered';
//           return <span key={dataset}><a className={className} href='#'
//                     onClick={boundFilterDataset}><code>{dataset}</code></a> </span>;
//         }.bind(this))}
//       </span>
//     </td>
//   </tr>
//
//   <tr>
//     <td className="label">{ language.geometry }</td>
//     <td>
//       <span className="geometry-type-list">
//         {Object.keys(this.state.filters.geometryTypes).map(function(geometryType, index) {
//           var boundFilterGeometryType = this.filterGeometryType.bind(this, geometryType),
//               //geometry-type
//               className = this.state.filters.geometryTypes[geometryType] ? '' : 'filtered';
//           return <span key={geometryType}><a className={className} href='#'
//                     onClick={boundFilterGeometryType}>{geometryType}</a></span>;
//         }.bind(this))}
//       </span>
//     </td>
//   </tr>
//
//   <tr>
//     <td className="label">{ language.sort }</td>
//     <td className="sort-fields">
//       {this.state.sortFields.map(function(field, index) {
//         var boundSort = this.sort.bind(this, field),
//             className = this.state.sortField === field ? "selected" : "";
//         return <span key={field}><a className={className} href="#" onClick={boundSort}>{field}</a></span>;
//       }.bind(this))}
//     </td>
//   </tr>
// </tbody>