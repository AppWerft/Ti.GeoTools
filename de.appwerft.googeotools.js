if (!('toRadians' in Number.prototype)) { Number.prototype.toDegrees = 
function() { return this * 180 / Math.PI; }; 

if (!('toRadians' in Number.prototype)) { Number.prototype.toRadians = 
function() { return this * Math.PI / 180; }; 

var Promises = require('org.favo.promise');

exports.getPositionByIP = function(_ip) {
	var ip = _ip ? _ip : Ti.Platform.getAddress();
	var promise = Promise.defer();
	var xhr = Ti.UI.createHTTPClient({
		onload : function() {
			promise.resolve(JSON.parse(this.responseText));
		},
		onerror : function(_e) {
			promise.reject(_e);
		}
	});
	xhr.open('GET', 'http://freegeoip.net/json/' + ip);
	xhr.send();
	return promise;
};

exports.getRegionOfCountry = function(_country) {
	var promise = Promise.defer();
	var country = _country || 'Deutschland';
	var xhr = Ti.UI.createHTTPClient({
		onload : function() {
			try {
				var json = JSON.parse(this.responseText);
				if (json.status == 'OK') {
					var result = json.results[0].geometry;
					var region = {
						latitude : result.location.lat,
						longitude : result.location.lng,
						latitudeDelta : Math.abs(result.viewport.northeast.lat - result.viewport.southwest.lat),
						longitudeDelta : Math.abs(result.viewport.northeast.lng - result.viewport.southwest.lng)
					};
					promise.resolve(region);
				}
			} catch (E) {
				promise.reject(E);
			}
		},
		onerror : function() {
			promise.reject(_e);
		}
	});
	xhr.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?address=' + country + '&sensor=false');
	xhr.send();
};

exports.getRoute = function() {
	var promise = Promise.defer();
	/* helperfunction to decode googles polyline:*/
	var decodeLine = function(encoded) {
		var len = encoded.length;
		var index = 0;
		var array = [];
		var lat = 0;
		var lng = 0;
		while (index < len) {
			var b;
			var shift = 0;
			var result = 0;
			do {
				b = encoded.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
			lat += dlat;

			shift = 0;
			result = 0;
			do {
				b = encoded.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
			lng += dlng;
			array.push([lat * 1e-5, lng * 1e-5]);
		}
		var points = [];
		for (var i = 0; i < array.length; i++) {
			points.push({
				"latitude" : array[i][0],
				"longitude" : array[i][1]
			});
		}
		return points;
	};
	var source = arguments[0] || {};
	var destination = arguments[0] || {};
	φ1 = Array.isArray(source) ? source[0] : source.lat || source.latitude;
	λ1 = Array.isArray(source) ? source[1] : source.lng || source.lon || source.longitude;
	φ2 = Array.isArray(destination) ? destination[0] : destination.lat || destination.latitude;
	λ2 = Array.isArray(destination) ? destination[1] : destination.lng || destination.lon || destination.longitude;
	var client = Ti.Network.createHTTPClient({
		onload : function() {
			var route = JSON.parse(this.responseText).routes[0];
			if (route)
				promise.resolve({
					steps : route.legs[0].steps,
					meta : route.legs[0].distance.text + '\n' + route.legs[0].duration.text,
					"end_address" : route.legs[0]['end_address'],
					"start_address" : route.legs[0]['start_address'],
					region : {
						latitude : (route.bounds.northeast.lat + route.bounds.southwest.lat) / 2,
						longitude : (route.bounds.northeast.lng + route.bounds.southwest.lng) / 2,
						latitudeDelta : 1.2 * Math.abs(route.bounds.northeast.lat - route.bounds.southwest.lat),
						longitudeDelta : 1.2 * Math.abs(route.bounds.northeast.lng - route.bounds.southwest.lng)
					},

					route : decodeLine(route['overview_polyline'].points)
				});
			else
				promise.reject();
		}
	});
	var url = 'https://maps.googleapis.com/maps/api/directions/json?language=' + Ti.Location.getLanguage() + '&sensor=false'//
	+ '&mode=WALKING' + // '
	+'&origin=' + φ1 + ',' + λ1//
	+ '&destination=' + φ2 + ',' + λ2;
	client.open('GET', url);
	client.send();
};

exports.getDistance = function() {
	var source = arguments[0] || {};
	var destination = arguments[0] || {};
	φ1 = Array.isArray(source) ? source[0] : source.lat || source.latitude;
	λ1 = Array.isArray(source) ? source[1] : source.lng || source.lon || source.longitude;
	φ2 = Array.isArray(destination) ? destination[0] : destination.lat || destination.latitude;
	λ2 = Array.isArray(destination) ? destination[1] : destination.lng || destination.lon || destination.longitude;
	var R = 6371000;
	// metres
	var φ1 = φ1.toRadians();
	var φ2 = φ2.toRadians();
	var Δφ = (φ2 - φ1).toRadians();
	var Δλ = (λ2 - λ1).toRadians();
	var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

exports.getBearing = function() {
	var source = arguments[0] || {};
	var destination = arguments[0] || {};
	φ1 = Array.isArray(source) ? source[0] : source.lat || source.latitude;
	λ1 = Array.isArray(source) ? source[1] : source.lng || source.lon || source.longitude;
	φ2 = Array.isArray(destination) ? destination[0] : destination.lat || destination.latitude;
	λ2 = Array.isArray(destination) ? destination[1] : destination.lng || destination.lon || destination.longitude;
	var y = Math.sin(λ2 - λ1) * Math.cos(φ2);
	var x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
	return Math.atan2(y, x).toDegrees();
};

