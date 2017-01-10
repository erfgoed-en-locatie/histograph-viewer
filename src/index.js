window.React = require('react');
window.ReactDOM = require('react-dom');

var util = require('util');
var App = require('./app');
var config = require('./../config.json');

var languages = {
  en: require('./language/en.json'),
  nl: require('./language/nl.json')
};

var el = document.getElementById('app');

var colorSelectors = {
  'h5': 'border-bottom-color',
  'h6': 'border-bottom-color',
  '.graph-pit.has-geometry': 'fill',
  'td.links a:hover': 'color',
  'input[type="search"]:focus': 'border-color'
};

var sheet = document.createElement('style');
var css = '';
Object.keys(colorSelectors).forEach(function(selector) {
  css += selector + ' {' + colorSelectors[selector] + ': ' + config.viewer.color + ';}\n';
});
sheet.innerHTML = css;
document.body.appendChild(sheet);

ReactDOM.render(<App config={config} language={languages[config.viewer.language]} />, el);

Array.prototype.unique = function() {
	var n = {};
  var r = [];
	for(var i = 0; i < this.length; i++) 	{
		if (!n[this[i]]) {
			n[this[i]] = true;
			r.push(this[i]);
		}
	}
	return r;
}

String.prototype.hashCode = function() {
  var hash = 0;
  var i;
  var chr;
  var len;

  if (this.length == 0) {
    return hash;
  }

  for (i = 0, len = this.length; i < len; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    // Convert to 32 bit integer
    hash |= 0;
  }
  return hash;
};
