var React = require('react');
var ReactDOM = require('react-dom');

module.exports = React.createClass({

  render: function() {
    var pit = this.props.pit;
    var uriIdRow;
    var geometryRow;
    var periodRow;
    var dataRow;
    var geometrySpan;
    var nameSpan;
    var buttons;

    if (pit.uri) {
      uriIdRow = (<tr><td className='label'>URI</td><td><a className='id' href={pit.uri}>{pit.uri}</a></td></tr>);
    } else {
      uriIdRow = (<tr><td className='label'>ID</td><td className='id'>{pit.id}</td></tr>);
    }

    if (pit.validSince || pit.validUntil) {
      var formatDate = function(date) {
        return date.replace('-01-01', '').replace('-12-31', '');
      };

      var period;
      if (pit.validSince && pit.validUntil) {
        period = formatDate(pit.validSince[0]) + ' - ' + formatDate(pit.validUntil[1]);
      } else if (pit.validSince) {
        period = 'from ' + formatDate(pit.validSince[0]);
      } else if (pit.validUntil) {
        period = 'until ' + formatDate(pit.validUntil[1]);
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

    if (pit.data) {
      dataRow = (
        <tr>
          <td className='label'>Data</td>
          <td>
            <pre><code ref='data' className='json'>{JSON.stringify(pit.data, null, 2)}</code></pre>
          </td>
        </tr>
      );
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
              {dataRow}
            </tbody>
          </table>
          <div className='clear' />
        </div>
      </li>
    );
  },

  componentDidMount: function() {
    if (this.refs.data) {
      var node = ReactDOM.findDOMNode(this.refs.data);
      hljs.highlightBlock(node);
    }
  }

});
