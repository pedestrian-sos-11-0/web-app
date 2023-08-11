import Map from './ol/Map.js';
import View from './ol/View.js';
import OSM from './ol/source/OSM.js';
import TileLayer from './ol/layer/Tile.js';
import { transform } from './ol/proj.js';
// import {defaults as defaultControls, FullScreen} from './ol/control.js';

var map = new Map({
  // controls: defaultControls().extend([new FullScreen()]),
  layers: [
    new TileLayer({source: new OSM()}),
  ],
  view: new View({
    center: [0, 0],
    zoom: 0,
  }),
  target: 'map',
});
/*map.on("singleclick", function(e){
    var coordinates = transform(e.coordinate, "EPSG:3857", "EPSG:4326").reverse();
    // console.log(coordinates);
    coordinatesSpan.innerText = coordinates;
    
});*/
// map.on("moveend", function(){
map.getView().on("change:center", function(){
    var coordinates = map.getView().getCenter();
    coordinates = transform(coordinates, "EPSG:3857", "EPSG:4326").reverse();
    // parent.postMessage(coordinates, "http://localhost:8080");
    parent.postMessage(coordinates, location.origin);
});