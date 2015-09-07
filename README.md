GeoTools ![](https://camo.githubusercontent.com/0708b17f8cc6b5aa19d0cf5ef38e978c3cfc38e4/687474703a2f2f696d672e736869656c64732e696f2f62616467652f67697474696f2d312e302e302d3030423443432e737667)
========

A useful collection of Geotools. The module uses in most cases promises.

Usage:
-----
####Using FreegeoIP to get users geolocation without device functionality:####

```javascript

var geotools = require('de.appwerft.geotools');

geotools.getPositionByIP(null).then(function(_res){
    console.log(_res);
//{"ip":"192.168.2.21","country_code":"","country_name":"","region_code":"","region_name":"","city":"","zip_code":"","time_zone":"","latitude":0,"longitude":0,"metro_code":0}
//{"ip":"134.100.17.2","country_code":"DE","country_name":"Germany","region_code":"HH","region_name":"Hamburg","city":"Hamburg","zip_code":"20099","time_zone":"Europe/Berlin","latitude":53.55,"longitude":10,"metro_code":0}
    

});

```

####Retreiving region (for Ti.Map) by country:###

```javascript

var geotools = require('de.appwerft.geotools');

geotools.getRegionByCountry('Poland').then(function(_res){
    console.log(_res);
// {"latitude":51.919438,"longitude":19.145136,"latitudeDelta":5.833758799999998,"longitudeDelta":10.023029}
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

####Converting GaussKrüger to Geo (WGS84 Web Mercator)####

```javascript

var geotools = require('de.appwerft.geotools');

var res = geotools.GaussKrueger2Geo({
    rw : 3461404, 
    hw : 5483498
});
console.log(res);
```

####Converting UTM to Geo (WGS84 Web Mercator)####

```javascript

var geotools = require('de.appwerft.geotools');

var res = geotools.UTM2Geo({
    zone:'32U',
    ew : 565781.334,
    nw : 5934297.972
});
console.log(res);
```


####Parsing remote KML####

```javascript

var geotools = require('de.appwerft.geotools');

var res = geotools.loadKML('http://maps.google.com/maps/ms?ie=UTF&msa=0&msid=217110902183005084784.00049d962454fabcabdc2&output=kml').then(function(_res){
    console.log(_res);
});

```


