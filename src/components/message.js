var React = require('react');

module.exports = React.createClass({

  render: function() {
    var closeText = this.props && this.props.closeText || this.props.language.close

    return (
      <div id='concepts-results' className='padding results'>
        <span id='concepts-results-message'>{this.props.message}</span>
        <a id='concepts-close' className='float-right' href='#' onClick={this.closeClick}>{closeText}</a>
      </div>
    );
  },

  closeClick: function(e) {
    e.preventDefault();
    this.props.onMessageClose();
  }

});
