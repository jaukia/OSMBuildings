
# OSM Buildings

<img src="http://osmbuildings.org/logo.svg" width="100" height="88"/>

OSM Buildings is a JavaScript library for visualizing OpenStreetMap building geometry on 2D and 3D maps.

**Reminder: we are a very small team with few time for the project and limited profit.
You could push us a lot forward with spreading the word, donations, code contributions and testing.**

The library version in this repository is a WebGL only variant of OSM Buildings.
At some point it will fully integrate the classic 2.5D version.

Example: http://osmbuildings.org/gl/?lat=40.70614&lon=-74.01039&zoom=17.00&rotation=0&tilt=40

For latest information about the project follow on Twitter https://twitter.com/osmbuildings, read our blog http://blog.osmbuildings.org, or just mail us: mail@osmbuildings.org. 

Not sure which version to use?

## Classic 2.5D

Source: https://github.com/kekscom/osmbuildings

Best for:
- great device compatibility
- good performance on older hardware
- shadow simulation
- full integration with Leaflet or OpenLayers 2

## Modern 3D

Source: you are here

Best for:
- great performance on modern graphics hardware
- huge amounts of objects
- mixing various data sources

This version uses GLMap for any events and layers logic.


## Documentation

All geo coordinates are in EPSG:4326.

### Quick integration

Link all required libraries in your HTML head section. Files are provided in folder `/dist`.

~~~ html
<head>
  <link rel="stylesheet" href="GLMap/GLMap.css">
  <script src="GLMap/GLMap.js"></script>
  <script src="OSMBuildings/OSMBuildings-GLMap.js"></script>
</head>

<body>
  <div id="map"></div>
~~~

In a script section initialize the map and add a map tile layer.

~~~ javascript
  var map = new GLMap('map', {
    position: { latitude:52.52000, longitude:13.41000 },
    zoom: 16
  });

  new GLMap.TileLayer('http://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png').addTo(map);
~~~

Add OSM Buildings to the map and let it load data tiles.

~~~ javascript
  var osmb = new OSMBuildings().addTo(map);
  osmb.addGeoJSONTiles('http://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
~~~

### GLMap Options

This is just a brief overview. For more information see <a href="https://github.com/OSMBuildings/GLMap">https://github.com/OSMBuildings/GLMap</a>

option | value | description
--- | --- | ---
position | object | geo position of map center
zoom | float | map zoom
rotation | float | map rotation
tilt | float | map tilt
disabled | boolean | disables user input, default false
minZoom | float | minimum allowed zoom
maxZoom | float | maximum allowed zoom
attribution | string | attribution, optional
state | boolean | stores map position/rotation in url, default false

### GLMap methods

method | parameters | description
--- | --- | ---
on | type, function | add an event listener, types are: change, resize, pointerdown, pointermove, pointerup 
off | type, fn | remove event listener
setDisabled | boolean | disables any user input
isDisabled | | check wheether user input is disabled
project | latitude, longitude, worldSize | transforms geo coordinates to world pixel coordinates (tile size << zoom)
unproject | x, y, worldSize | transforms world (tile size << zoom) pixel coordinates to geo coordinates (EPSG:4326)
transform | latitude, longitude, elevation | transforms a geo coordinate + elevation to screen position
getBounds | | returns geocordinates of current map view, respects tilt and rotation but ignores perspective
setZoom | float | sets current zoom
getZoom | | gets current zoom
setPosition | object | sets current geo position of map center
getPosition | | gets current geo position of map center
setSize | object | {width,height} sets current map size in pixels
getSize |  | gets current map size in pixels
setRotation | float | sets current rotation
getRotation | | gets current rotation
setTilt | float | sets current tilt
getTilt | | gets current tilt

### OSM Buildings options

option | value | description
--- | --- | ---
minZoom | float | minimum allowed zoom
maxZoom | float | maximum allowed zoom
attribution | string | attribution, optional
showBackfaces | boolean | render front and backsides of polygons. false increases performance, true might be needed for bad geometries, default false

### OSM Buildings methods

method | parameters | description
--- | --- | ---
addTo | map | adds it as a layer to an GLMap instance
addOBJ | url, position, options | adds an OBJ file, specify a geo position and options {scale, rotation, elevation, id, color}
addGeoJSON | url, options | add a GeoJSON file or object and specify options {scale, rotation, elevation, id, color}
addGeoJSONTiles | url, options | add a GeoJSON tile set and specify options {scale, rotation, elevation, id, color}
getTarget | x, y | get a building id at position
highlight | id, color | highlight a given building by id, this can only be one, set color = null in order to un-highlight

### OSM Buildings server

There is also documentation of OSM Buildings Server side. See https://github.com/OSMBuildings/OSMBuildings/blob/master/docs/server.md


## Examples

### Moving label

This label moves virtually in space.

~~~ html
<div id="label" style="width:10px;height:10px;position:absolute;z-Index:10;border:3px solid red;"></div>
~~~

~~~ javascript
var label = document.getElementById('label');
map.on('change', function() {
  var pos = map.transform(52.52, 13.37, 50);
  label.style.left = Math.round(pos.x) + 'px';
  label.stye.top = Math.round(pos.y) + 'px';
});
~~~

### Highlight buildings

~~~ javascript
map.on('pointermove', function(e) {
  var id = osmb.getTarget(e.x, e.y);
  if (id) {
    osmb.highlight(id, '#f08000');
  } else {
    osmb.highlight(null);
  }
});
~~~

### Map control buttons

~~~ html
<div class="control tilt">
  <button class="dec">&#8601;</button>
  <button class="inc">&#8599;</button>
</div>

<div class="control rotation">
  <button class="inc">&#8630;</button>
  <button class="dec">&#8631;</button>
</div>

<div class="control zoom">
  <button class="dec">-</button>
  <button class="inc">+</button>
</div>
~~~

~~~ javascript
var controlButtons = document.querySelectorAll('.control button');

for (var i = 0; i < controlButtons.length; i++) {
  controlButtons[i].addEventListener('click', function(e) {
    var button = this;
    var parentClassList = button.parentNode.classList;
    var direction = button.classList.contains('inc') ? 1 : -1;
    var increment;
    var property;

    if (parentClassList.contains('tilt')) {
      property = 'Tilt';
      increment = direction*10;
    }
    if (parentClassList.contains('rotation')) {
      property = 'Rotation';
      increment = direction*10;
    }
    if (parentClassList.contains('zoom')) {
      property = 'Zoom';
      increment = direction*1;
    }
    if (property) {
      map['set'+ property](map['get'+ property]()+increment);
    }
  });
}
~~~

### Add GeoJSON

~~~ javascript
var geojson = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {
      color: '#ff0000',
      roofColor: '#cc0000',
      height: 50,
      minHeight: 0
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [13.37000, 52.52000],
          [13.37010, 52.52000],
          [13.37010, 52.52010],
          [13.37000, 52.52010],
          [13.37000, 52.52000]
        ]
      ]
    }
  }]
};
osmb.addGeoJSON(geojson);
~~~

### Position a map object

~~~javascript
var obj = osmb.addGeoJSON(geojson);

/*
 * ## Key codes for object positioning ##
 * Cursor keys: move
 * +/- : scale
 * w/s : elevate
 * a/d : rotate
 *
 * Pressing Alt the same time accelerates
 */
document.addEventListener('keydown', function(e) {
  var transInc = e.altKey ? 0.0002 : 0.00002;
  var scaleInc = e.altKey ? 0.1 : 0.01;
  var rotaInc = e.altKey ? 10 : 1;
  var eleInc = e.altKey ? 10 : 1;

  switch (e.which) {
    case 37: obj.position.longitude -= transInc; break;
    case 39: obj.position.longitude += transInc; break;
    case 38: obj.position.latitude += transInc; break;
    case 40: obj.position.latitude -= transInc; break;
    case 187: obj.scale += scaleInc; break;
    case 189: obj.scale -= scaleInc; break;
    case 65: obj.rotation += rotaInc; break;
    case 68: obj.rotation -= rotaInc; break;
    case 87: obj.elevation += eleInc; break;
    case 83: obj.elevation -= eleInc; break;
    default: return;
  }
  console.log(JSON.stringify({
    position:{
      latitude:parseFloat(obj.position.latitude.toFixed(5)),
      longitude:parseFloat(obj.position.longitude.toFixed(5))
    },
    elevation:parseFloat(obj.elevation.toFixed(2)),
    scale:parseFloat(obj.scale.toFixed(2)),
    rotation:parseInt(obj.rotation, 10)
  }));
});
~~~
