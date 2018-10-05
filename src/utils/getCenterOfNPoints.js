export default function(latLon) {
  	let latitude = 0;
	let longitude = 0;
	let n = latLon.length;

	for (let i = 0; i < n; i++) {
	    latitude += latLon[i].latitude;
	    longitude += latLon[i].longitude;
	}

	return {'latitude': parseFloat(latitude/n), 'longitude': parseFloat(longitude/n)};
}