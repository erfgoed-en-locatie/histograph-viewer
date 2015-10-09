var React = require('react');

module.exports = React.createClass({

  render: function() {
    var pit = this.props.pit;
    var uriIdRow;
    var geometryRow;
    var periodRow;
    var geometrySpan;
    var nameSpan;
    var buttons;

    if (pit.uri) {
      uriIdRow = (<tr><td className='label'>URI</td><td><a className='id' href={pit.uri}>{pit.uri}</a></td></tr>);
    } else {
      uriIdRow = (<tr><td className='label'>ID</td><td className='id'>{pit.id}</td></tr>);
    }

    if (pit.validSince || pit.validUntil) {
      var period;
      if (pit.validSince && pit.validUntil) {
        period = pit.validSince[0] + ' - ' + pit.validUntil[1];
      } else if (pit.validSince) {
        period = 'from ' + pit.validSince[0];
      } else if (pit.validUntil) {
        period = 'until ' + pit.validUntil[1];
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

    if (pit.name && pit.name !== '') {
      nameSpan = (<span className='place-name'>{pit.name}</span>);
    }

    var className = 'padding pit';

    return (
      <li className={className}>
        <h6>{nameSpan}{geometrySpan}</h6>
        <div>
          <table>
            <tbody>
              <tr><td className='label'>Dataset</td><td className='id'>{pit.dataset}</td></tr>
              {uriIdRow}
              {periodRow}
            </tbody>
          </table>
          <div className='clear' />
        </div>
      </li>
    );
  }

});