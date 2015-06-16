'use strict';

var React = require('react');

module.exports = React.createClass({

  render: function() {
    var pit = this.props.pit,
        uriRow,
        geometryRow,
        periodRow,
        geometrySpan,
        buttons;

    if (pit.uri) {
      uriRow = (<tr><td className='label'>URI</td><td><a href={pit.uri}>{pit.uri}</a></td></tr>);
    }

    if (pit.hasBeginning || pit.hasEnd) {
      var period;
      if (pit.hasBeginning && pit.hasEnd) {
        period = pit.hasBeginning + ' - ' + pit.hasEnd;
      } else if (pit.hasBeginning) {
        period = 'from ' + pit.hasBeginning;
      } else if (pit.hasEnd) {
        period = 'until ' + pit.hasEnd;
      }
      periodRow = (<tr><td className='label'>Period</td><td>{period}</td></tr>);
    }

    if (pit.geometryIndex > -1) {
      var geometryClassName = 'float-right geometry-type ';
      var geometryType = this.props.feature.geometry.geometries[pit.geometryIndex].type;

      if (geometryType === 'Point' || geometryType === 'MultiPoint') {
        geometryClassName += 'geometry-type-point';
      } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
        geometryClassName += 'geometry-type-line';
      } else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
        geometryClassName += 'geometry-type-polygon';
      }
      geometrySpan = (<span title={geometryType} className={geometryClassName}/>);
    }

    var className = 'padding pit';// + (!this.state.selected &! this.state.unfade ? ' faded' : '');

    return (
      <li className={className}>
        <h6><span className='place-name'>{pit.name}</span>{geometrySpan}</h6>
        <div>
          <table>
            <tbody>
              <tr>
                <td className='label'>ID</td>
                <td><code>{pit.hgid}</code></td>
              </tr>
              {uriRow}
              {periodRow}
            </tbody>
          </table>
          <div className='clear' />
        </div>
      </li>
    );
  }

});