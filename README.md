GeoTools
========

A useful collection of Geotools. The module uses in most cases promises.

Usage:
-----
####Using FreegeoIP to get users geolocation without device functionality:####

```javascript

var geotools = require('de.appwerft.geotools');

geotools.getPositionByIP(null).then(function(_res){
    console.log(_res);
});

```

####Retreiving region (for Ti.Map) by country:###

```javascript

var geotools = require('de.appwerft.geotools');

geotools.getRegionByCountry('Poland').then(function(_res){
    console.log(_res);
});
```

####Retreiving elevation by position:###

```javascript

var geotools = require('de.appwerft.geotools');

geotools.getElevationByPosition({lat:53.5,lon:10}).then(function(_res){
    console.log(_res);
});
```



####Retreiving route from source to destination, gives you list af legs and polyline for Ti.Map####

```javascript

var geotools = require('de.appwerft.geotools');

geotools.getRoute({lat:53.5,lon:10},{lat:55,lon:8}).then(function(_res){
    console.log(_res);
});
```

####Calculating distance between two points on earth####

```javascript

var geotools = require('de.appwerft.geotools');

var res = geotools.getDistance({lat:53.5,lon:10},{lat:55,lon:8});
console.log(res);

```

####Calculating bearing between two points on earth####

```javascript

var geotools = require('de.appwerft.geotools');

var res = geotools.getBearing({lat:53.5,lon:10},{lat:55,lon:8});
console.log(res);

```
####Parsing remote KML####

```javascript

var geotools = require('de.appwerft.geotools');

var res = geotools.loadKML('http://maps.google.com/maps/ms?ie=UTF&msa=0&msid=217110902183005084784.00049d962454fabcabdc2&output=kml').then(function(_res){
    console.log(_res);
});

```


