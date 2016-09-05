var map;

var myerrorhandler = function(){
	 alert("Unable to connect to Google Maps.");
}

var markers = []; 

function initMap() {
     map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 28.9288298,
            lng: -81.2354897
        },
        zoom: 13,
        // add map style defined below
        styles: styles,
        mapTypeControl: false
    });

    var styles = [{
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [{
            color: '#ffffff'
        }, {
            weight: 6
        }]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#e85113'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
            color: '#efe9e4'
        }, {
            lightness: -40
        }]
    }, {
        featureType: 'transit.station',
        stylers: [{
            weight: 9
        }, {
            hue: '#e85113'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [{
            visibility: 'off'
        }]
    }];
    
    var locations = [{
        title: 'Stephen Home',
        location: {
            lat: 28.9288298,
            lng: -81.2354897
            isFiltered: ko.observable(true)
        }
    }, {
        title: 'RaceTrac',
        location: {
            lat: 28.9478792,
            lng: -81.2517882
           isFiltered: ko.observable(true) 
        }
    }, {
        title: 'Dunkin Donuts',
        location: {
            lat: 28.9336987,
            lng: -81.2521422
            isFiltered: ko.observable(true)
        }
    }, {
        title: 'Epic Theatre',
        location: {
            lat: 28.9336987,
            lng: -81.2521422
           isFiltered: ko.observable(true) 
        }
    }, {
        title: 'Deltona Gulf-Club',
        location: {
            lat: 28.9227577,
            lng: -81.2444269
            isFiltered: ko.observable(true)
        }
    }, {
        title: 'Deltona Library',
        location: {
            lat: 28.9277695,
            lng: -81.231004
            isFiltered: ko.observable(true)
        }
    }];

    var largeInfowindow = new google.maps.InfoWindow();

    var defaultIcon = makeMarkerIcon('0091ff');
    var highlightedIcon = makeMarkerIcon('FFFF24');

    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i,
            map: map 
        });
        markers.push(marker);
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });
    }

     filterItems: function () {
        var filter = viewModel.searchQuery().toLowerCase();

        for (var i = 0; i < model.locations.length; i++) {

            var searchedTitle = model.locations[i].title().toLowerCase();

            if (searchedTitle.indexOf(filter) > -1) {
                model.locations[i].isFiltered(true);
                model.locations[i].marker.setMap(map);
            }
            else {
                model.locations[i].isFiltered(false);
                model.locations[i].marker.setMap(null);
            }
    document.getElementById('show-listings').addEventListener('click',
        showListings);
    document.getElementById('hide-listings').addEventListener('click', function() {
        hideMarkers(markers);
    });

    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function() {
                infowindow.Setmarker = null;
            });
            var streetViewService = new google.maps.StreetViewService();
            var radius = 50;

            function getStreetView(data, status) {
                if (status == google.maps.StreetViewStatus.OK) {
                    var nearStreetViewLocation = data.location.latLng;
                    var heading = google.maps.geometry.spherical.computeHeading(
                        nearStreetViewLocation, marker.position);
                    infowindow.setContent('<div>' + marker.title +
                        '</div><div id="pano"></div>');
                    var panoramaOptions = {
                        position: nearStreetViewLocation,
                        pov: {
                            heading: heading,
                            pitch: 30
                        }
                    };
                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano'), panoramaOptions);
                } else {
                    infowindow.setContent('<div>' + marker.title + '</div>' +
                        '<div>No Street View Found</div>');
                }
            }

            streetViewService.getPanoramaByLocation(marker.position, radius,
                getStreetView);
            infowindow.open(map, marker);
        }
    }
     toggleBounce: function (location) {
        viewModel.disableMarkers();
        location.marker.setAnimation(google.maps.Animation.BOUNCE);
    }
    
    function showListings() {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    }

    function hideMarkers(markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' +
            markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

    ko.applyBindings(ViewModel); // apply bindings in init map **********************************
}


var ViewModel = function() {
    var self = this;
    self.locations = ko.observableArray(markers);
};

