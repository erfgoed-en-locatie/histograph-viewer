// TODO: no!

defaultStyle = {
  point: {
    color: "rgba(74,187,131,1)",
    fillColor: "rgba(74,187,131,1)",
    radius: 9,
    opacity: 0.95
  },
  line: {
    color: "rgba(74,187,131,1)",
    weight: 3,
    opacity: 0.95,
    fillOpacity: 0.05
  }
};

fadedStyle = {
  point: {
    color: "rgba(74,187,131,1)",
    fillColor: "rgba(74,187,131,1)",
    radius: 7,
    opacity: 0.25
  },
  line: {
    color: "rgba(74,187,131,1)",
    weight: 2,
    opacity: 0.25,
    fillOpacity: 0
  }
};

geometryTypeOrder = [
  "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection"
];