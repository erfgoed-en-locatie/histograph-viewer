'use strict';

var React = require('react');

var languages = {
  english: require('../language/english.json'),
  dutch: require('../language/dutch.json')
};

var language = languages.english;
//language = languages.dutch;

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
              <td className='label'>Sources</td>
              <td>
                <span className='source-list'>
                  {this.props.sources.map(function(source, index) {
                    return <span key={index}>{source}</span>;
                  })}
                </span>
              </td>
            </tr>
            <tr>
              <td colSpan='2'>
                <a className='show-details' onClick={this.props.showDetails} title={language.show_concept_details} href='javascript:void(0)'>{ language.show_details }</a>
              </td>
            </tr>
          </tbody>
        </table>
        <div className='clear' />
      </div>
    );
  }
});
