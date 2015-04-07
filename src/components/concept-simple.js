'use strict';

var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <td className='label'>Names</td>
              <td>
                <span>
                  {this.props.names.selected.map(function(name, index) {
                    return <span key={index} className='concept-alt-name'>{name}</span>;
                  })}
                </span>
                <span>{this.props.names.suffix}</span>
              </td>
            </tr>
            <tr>
              <td className='label'>Sources</td>
              <td>
                <span className='source-list'>
                  {this.props.sources.map(function(source, index) {
                    return <span key={index}><code>{source}</code></span>;
                  })}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className='buttons'>
          <button className='details' onClick={this.props.showDetails} title='Show concept details'>Details...</button>
        </div>
        <div className='clear' />
      </div>
    );
  }
});
