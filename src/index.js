var MAP;
var glx;

var OSMBuildings = function(options) {
  options = options || {};

  if (options.style) {
    this.setStyle(options.style);
  }

  this.fogColor = options.fogColor ? Color.parse(options.fogColor).toRGBA(true) : FOG_COLOR;
  this.showBackfaces = options.showBackfaces;
  this.attribution = options.attribution || OSMBuildings.ATTRIBUTION;
};

OSMBuildings.VERSION = '1.0.1';
OSMBuildings.ATTRIBUTION = '© OSM Buildings <a href="http://osmbuildings.org">http://osmbuildings.org</a>';

OSMBuildings.prototype = {

  addTo: function(map) {
    MAP = map;
    glx = GLX.use(MAP.getContext());

    MAP.addLayer(this);

    Interaction.initShader();
    Buildings.initShader({ showBackfaces: this.showBackfaces, fogColor: this.fogColor });

    return this;
  },

  remove: function() {
    MAP.removeLayer(this);
    MAP = null;
  },

  render: function(vpMatrix) {
    var gl = glx.context;

    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    Buildings.render(vpMatrix);
  },

  setStyle: function(style) {
    var color = style.color || style.wallColor;
    if (color) {
      DEFAULT_COLOR = Color.parse(color).toRGBA(true);
    }
    return this;
  },

  addOBJ: function(url, position, options) {
    return new mesh.OBJ(url, position, options);
  },

  addGeoJSON: function(url, options) {
    return new mesh.GeoJSON(url, options);
  },

  // TODO: what to return? allow multiple layers?
  addGeoJSONTiles: function(url, options) {
    this.dataGrid = new DataGrid(url, options);
  },

  highlight: function(id, color) {
    Buildings.highlightColor = color ? id && Color.parse(color).toRGBA(true) : null;
    Buildings.highlightID = id ? Interaction.idToColor(id) : null;
  },

  getTarget: function(x, y) {
    return Interaction.getTarget(x, y);
  },

  destroy: function() {
    Interaction.destroy();
    Buildings.destroy();
    this.dataGrid.destroy();
  }
};

//*****************************************************************************

if (typeof global.define === 'function') {
  global.define([], OSMBuildings);
} else if (typeof global.exports === 'object') {
  global.module.exports = OSMBuildings;
} else {
  global.OSMBuildings = OSMBuildings;
}
