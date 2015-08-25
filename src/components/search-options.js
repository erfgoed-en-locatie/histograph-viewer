var React = require('react');

module.exports = React.createClass({
  getInitialState: function(){
    return {
      enabled: false,
      fromDate: 0,
      untilDate: +new Date().getFullYear()
    };
  },
  render: function() {
    return false;
    return (
      <div id='options-container' className='box-container'>
        <div className="box-container-padding">
          <button className="box" onClick={this.toggle}>{ this.state.enabled ? 'Disable' : 'Enable' } advanced searching</button>
          { ( this.state.enabled ?
            <div id='search-options' className='box padding'>
             <label>from year: {this.state.fromDate}</label><input type="range" min="0" max={new Date().getFullYear()} value={this.state.fromDate} onChange={this.getStateChanger.call(this, 'fromDate', 'untilDate')} />
             <label>until year: {this.state.untilDate}</label><input type="range" min="0" max={new Date().getFullYear()} value={this.state.untilDate} onChange={this.getStateChanger.call(this, 'untilDate', 'fromDate')} />
            </div>
          :
            false )}
        </div>
      </div>
    );
  },
  toggle: function(){
    this.setState({ enabled: !this.state.enabled });
  },
  getStateChanger: function(key, crossCheck){
    return function(e){
      var value = +e.target.value,
          propHolder = {};
      propHolder[key] = value;

      if(crossCheck && crossCheck in {untilDate: true, fromDate: true}){
        if(crossCheck === 'fromDate'){
          if(+this.state.fromDate > value){
            propHolder.fromDate = value;
          }
        }

        if(crossCheck === 'untilDate'){
          if(+this.state.untilDate < value){
            propHolder.untilDate = value;
          }
        }
      }

      this.setState(propHolder);
    }.bind(this);
  },
});
