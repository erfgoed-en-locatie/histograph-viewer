---
---

Array.prototype.unique = function() {
	var n = {},
      r=[];
	for(var i = 0; i < this.length; i++) 	{
		if (!n[this[i]]) {
			n[this[i]] = true;
			r.push(this[i]);
		}
	}
	return r;
}

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function sortNames(pits) {
  var names = pits.map(function(pit) { return pit.name; }),
      counts = {};

  for (var k = 0, j = names.length; k < j; k++) {
    counts[names[k]] = (counts[names[k]] || 0) + 1;
  }

  return Object.keys(counts).map(function(name) {
    return {
      name: name,
      count: counts[name]
    };
  }).sort(function(a, b) {
    return b.count - a.count;
  });
}

function getApiUrl(queryString) {
  var url = "{{ site.data.api.host }}search?",
      matches = queryString.match(/(\S*)=(\S*)/g)
      params = [];

  if (matches) {
    matches.forEach(function(match) {
      queryString = queryString.replace(match, "");
      params.push(match);
    });
  }

  if (queryString.indexOf("http") > -1) {
    params.push("uri=" + queryString.trim());
  } else if (queryString.indexOf("/") > -1) {
    params.push("hgid=" + queryString.trim());
  } else {
    params.push("name=" + queryString.trim());
  }

  return url + params.join("&");

}