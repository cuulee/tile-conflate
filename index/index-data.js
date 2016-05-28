// PREPARE A SET OF TILES WITH A VALUE AGGREGATED FROM A GEOJSON DATASET
// USAGE: node index.js <filename> <valuename>

var cover = require('tile-cover');
var tilebelt = require('tilebelt');
var turf = require('turf');
var fs = require('fs');

var indexFile = process.argv[2];
var indexVal = process.argv[3];

var slopemin = JSON.parse(fs.readFileSync(indexFile));

// set zoom level for tiles
var coveropts = {min_zoom: 16, max_zoom: 16};
var tiles = {};

// calculate minimum slope for each tile
slopemin.features.forEach(function(soilPoly){
  var soilPolyTiles = cover.tiles(soilPoly.geometry, coveropts);
  soilPolyTiles.forEach(function(tile){
    if(!tiles[id(tile)]){
      tiles[id(tile)] = {
        slopemin: 0
      };
    }
    if (tiles[id(tile)].slopemin < soilPoly.properties[indexVal]) {
      //handle the nodota value
      if (soilPoly.properties[indexVal] == 999) {
        tiles[id(tile)].slopemin = 0;
      } 
      else {
        tiles[id(tile)].slopemin = soilPoly.properties[indexVal];
      }
    }
  });
});

var fc = turf.featurecollection([]);
Object.keys(tiles).forEach(function(tile){
  var poly = turf.polygon(tilebelt.tileToGeoJSON(tile.split('/').map(parseFloat)).coordinates);
  poly.properties = tiles[tile];
  fc.features.push(poly);
});

// write out the prepared tiles w/ values
fs.writeFileSync(__dirname+'../data/tiles.geojson', JSON.stringify(fc));
fs.writeFileSync(__dirname+'../data/tiles.json', JSON.stringify(tiles));

function id (tile){
  return tile[0] + '/' + tile[1] + '/' + tile[2];
}