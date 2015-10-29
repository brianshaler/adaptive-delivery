var cities = {
  berlin: {
    lng: 13.4,
    lat: 52.4
  },
  london: {
    lng: -0.1,
    lat: 51.5
  },
  paris: {
    lng: 2.35,
    lat: 48.86
  },
  madrid: {
    lng: -3.7,
    lat: 40.4
  },
  dublin: {
    lng: -6.3,
    lat: 53.3
  }
};

var cityNames = Object.keys(cities);
for (var name in cities) {
  cities[name].pattern = new RegExp(name, 'i');
}
var center = cities[Object.keys(cities)[0]];

L.mapbox.accessToken = 'pk.eyJ1IjoiYnJpYW5zaGFsZXIiLCJhIjoiY2lnYml5OWZlMG1pa3U1bHlxbGFrZXB3MCJ9.j-aTJBjdHQMV4wa0RXuV3Q';
// Replace 'mapbox.streets' with your map id.
var mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/brianshaler.cigbiy7n10kurtwj69oc15wdq/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken);

var map = L.map('map')
    .addLayer(mapboxTiles)
    .setView([center.lat, center.lng], 4);

var currentMarkers = [];

var setMarkers = function (items) {
  var bounds = [
    [Infinity, Infinity],
    [-Infinity, -Infinity]
  ];

  for (var i = 0; i < currentMarkers.length; i++) {
    map.removeLayer(currentMarkers[i]);
  }
  currentMarkers = [];

  for (var i = 0; i < items.length; i++) {
    var city = items[i];
    if (city.lat < bounds[0][0]) {
      bounds[0][0] = city.lat;
    }
    if (city.lat > bounds[1][0]) {
      bounds[1][0] = city.lat;
    }
    if (city.lng < bounds[0][1]) {
      bounds[0][1] = city.lng;
    }
    if (city.lng > bounds[1][1]) {
      bounds[1][1] = city.lng;
    }
    var marker = L.marker(new L.LatLng(city.lat, city.lng), {
      icon: L.icon({
        iconUrl: './location-icon-map-Map_pin3.png',
        iconSize: [23, 37],
        iconAnchor: [12, 37]
      })
    });
    currentMarkers.push(marker);
    marker.addTo(map);
  }

  bounds[0][0] -= 1;
  bounds[1][0] += 1;
  bounds[0][1] -= 1;
  bounds[1][1] += 1;

  map.fitBounds(bounds);
}

var polyline = null;
drawLine = function (city1, city2) {
  if (polyline) {
    map.removeLayer(polyline);
  }

  line_points = [
    [city1.lat, city1.lng],
    [city2.lat, city2.lng]
  ];

  // Define polyline options
  // http://leafletjs.com/reference.html#polyline
  var polyline_options = {
      color: '#c81721'
  };

  // Defining a polygon here instead of a polyline will connect the
  // endpoints and fill the path.
  // http://leafletjs.com/reference.html#polygon
  polyline = L.polyline(line_points, polyline_options).addTo(map)
}

findCity = function (keyword) {
  var city = null;
  for (var name in cities) {
    if (cities[name].pattern.test(keyword)) {
      return cities[name];
    }
  }
}

// renderLabels();

// setMarkers([cities.berlin]);

//marker.addTo(map);

var form = document.getElementById('location-form');
form.addEventListener('submit', function (e) {
  e.preventDefault();
  var input1 = document.getElementById('pickup-location');
  var input2 = document.getElementById('dropoff-location');
  var city1 = findCity(input1.value);
  var city2 = findCity(input2.value);
  var markers = [];
  if (city1) {
    markers.push(city1);
  }
  if (city2) {
    markers.push(city2);
  }
  console.log('process form!', markers);
  setMarkers(markers);
  if (city1 && city2) {
    drawLine(city1, city2);
  }
  return false;
});

var initSlider = function (name) {
  var slider = {
    el: document.getElementById(name + '-slider'),
    label: document.getElementById(name + '-label')
  };

  slider.el.min = 0;
  slider.el.max = 1;
  slider.el.step = 0.01;
  slider.el.value = 0.7;
  return slider;
}

var costSlider = initSlider('cost');
var timeSlider = initSlider('time');

renderLabels = function () {
  var holder = document.getElementById('settings');
  var width = holder.clientWidth;

  var days = parseInt(1 + timeSlider.el.value * 14);
  timeSlider.label.innerHTML = days + ' day' + (days == 1 ? '' : 's');
  var cost = parseInt(500 + parseInt(14500 * costSlider.el.value));
  costSlider.label.innerHTML = '$' + cost;
  var timeLabelWidth = timeSlider.label.clientWidth;
  var costLabelWidth = costSlider.label.clientWidth;
  timeSlider.label.style.marginLeft = 20 + timeSlider.el.value * (width - 20 - timeLabelWidth) - timeLabelWidth / 2 + 'px';
  costSlider.label.style.marginLeft = 20 + costSlider.el.value * (width - 20 - costLabelWidth) - costLabelWidth / 2 + 'px';
}

costSlider.el.addEventListener('change', function (e) {
  timeSlider.el.value = 1 - parseFloat(costSlider.el.value);
  renderLabels();
});

timeSlider.el.addEventListener('change', function (e) {
  costSlider.el.value = 1 - parseFloat(timeSlider.el.value);
  renderLabels();
});

costSlider.el.value = 1 - parseFloat(timeSlider.el.value);

renderLabels();
