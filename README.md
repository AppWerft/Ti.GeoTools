GooGeoTools
===========

A useful collection of Geotools.

Usage:
-----
###Using FreegeoIP to get users geolocation without device functionality:###

```javascript

var GooGeoTools = require('de.appwerft.googeotools');

GooGeoTools.getPositionByIP(null).then(function(_res){
    console.log(_res);
});

```

###Retreiving region (for Ti.Map) by country:###

```javascript

var GooGeoTools = require('de.appwerft.googeotools');

GooGeoTools.getRegionByCountry('Poland').then(function(_res){
    console.log(_res);
});
```

###Retreiving route from source to destination, gives you list af legs and polyline for Ti.Map###

```javascript

var GooGeoTools = require('de.appwerft.googeotools');

GooGeoTools.getRoute({lat:53.5,lon:10},{lat:55,lon:8}).then(function(_res){
    console.log(_res);
});
```
