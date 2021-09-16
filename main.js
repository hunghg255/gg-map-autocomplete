var autocompleteService, placesService, results, map;

// Get place predictions
function getPlacePredictions(search) {
  autocompleteService.getPlacePredictions(
    {
      input: search,
      types: ['establishment', 'geocode'],
    },
    callback
  );
}

// Get place details
function getPlaceDetails(placeId) {
  var request = {
    placeId: placeId,
  };

  placesService.getDetails(request, function (place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      var center = place.geometry.location;
      var marker = new google.maps.Marker({
        position: center,
        map: map,
      });

      map.setCenter(center);

      // Hide autocomplete results
      results.style.display = 'none';
    }
  });
}

// Place search callback
function callback(predictions, status) {
  // Empty results container
  results.innerHTML = '';
  console.log(predictions);
  // Place service status error
  if (status != google.maps.places.PlacesServiceStatus.OK) {
    results.innerHTML =
      '<div class="pac-item pac-item-error">Your search returned no result. Status: ' +
      status +
      '</div>';
    return;
  }

  // Build output for each prediction
  for (var i = 0, prediction; (prediction = predictions[i]); i++) {
    // Insert output in results container
    results.innerHTML +=
      '<div class="pac-item" data-placeid="' +
      prediction.place_id +
      '" data-name="' +
      prediction.terms[0].value +
      '"><span class="pac-icon pac-icon-marker"></span>' +
      prediction.description +
      '</div>';
  }

  var items = document.getElementsByClassName('pac-item');

  // Results items click
  for (var i = 0, item; (item = items[i]); i++) {
    item.onclick = function () {
      if (this.dataset.placeid) {
        getPlaceDetails(this.dataset.placeid);
      }
    };
  }
}

function initialize() {
  results = document.getElementById('results');

  var mapOptions = {
    zoom: 5,
    center: new google.maps.LatLng(50, 50),
  };

  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  // Bind listener for address search
  google.maps.event.addDomListener(
    document.getElementById('address'),
    'input',
    function () {
      results.style.display = 'block';
      getPlacePredictions(document.getElementById('address').value);
    }
  );

  // Show results when address field is focused (if not empty)
  google.maps.event.addDomListener(
    document.getElementById('address'),
    'focus',
    function () {
      if (document.getElementById('address').value !== '') {
        results.style.display = 'block';
        getPlacePredictions(document.getElementById('address').value);
      }
    }
  );

  // Hide results when click occurs out of the results and inputs
  google.maps.event.addDomListener(document, 'click', function (e) {
    if (
      e.target.parentElement.className !== 'pac-container' &&
      e.target.parentElement.className !== 'pac-item' &&
      e.target.tagName !== 'INPUT'
    ) {
      results.style.display = 'none';
    }
  });

  autocompleteService = new google.maps.places.AutocompleteService();
  placesService = new google.maps.places.PlacesService(map);
}

google.maps.event.addDomListener(window, 'load', initialize);
