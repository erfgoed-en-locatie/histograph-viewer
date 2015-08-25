var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <div className='side-padding'>
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
              <td className='label'>{this.props.language.datasets}</td>
              <td>
                <span className='dataset-list'>
                  {this.props.datasets.map(function(dataset, index) {
                    return <span key={index}>{dataset}</span>;
                  })}
                </span>
              </td>
            </tr>
            <tr>
              <td colSpan='2'>
                <a className='show-details' onClick={this.props.showDetails} title={this.props.language.showConceptDetails} href='javascript:void(0)'>{ this.props.language.showDetails}</a>
              </td>
            </tr>
          </tbody>
        </table>
        <div className='clear' />
      </div>
    );
  }
});
