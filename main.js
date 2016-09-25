var map;
var map;
var infowindow;
var mapBounds;
var myViewModel;
var markers = [];
var styles;
var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=wikiCallBack&search=';

//main code data for location
var locations = [ {
	title: 'Stephen Home',
	pos: {
		lat: 28.9288298,
		lng: -81.2354897
	}
}, {
	title: 'RaceTrac',
	pos: {
		lat: 28.9478792,
		lng: -81.2517882
	}
}, {
	title: 'Dunkin Donuts',
	pos: {
		lat: 28.9440047,
		lng: -81.2440784
	}
}, {
	title: 'Epic Theatre',
	pos: {
		lat: 28.9336987,
		lng:-81.2521422
	}
}, {
	title: 'Deltona Gulf Club',
	pos: {
		lat: 28.9227577,
		lng: -81.2444269
	}
}, {
	title: 'Deltona Libaray',
	pos: {
		lat: 28.9277695,
		lng: -81.231004
	}
}];

//main callback function for google map API 
function initmap() {

	var style = [
		{
			"featureType": "administrative",
			"elementType": "labels.text.fill",
			"styles": [
			{
				"color": "#444444"
			}]
		},
		{
			"featureType": "landscape",
			"elementType": "all",
			"styles": [
			{
				"color": "#f2f2f2"
			}]
		},
		{
			"featureType": "poi",
			"elementType": "all",
			"styles": [
			{
				"visibility": "off"
			}]
		},
		{
			"featureType": "road.highway",
			"elementType": "all",
			"styles": [
			{
				"visibility": "simplified"
			}]
		},
		{
			"featureType": "road.arterial",
			"elementType": "labels.icon",
			"styles": [
			{
				"visibility": "off"
			}]
		}
	];

 	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 28.9288298,
			lng: -81.2354897
		},
		zoom: 13,
		styles: styles,
		mapTypeControl: null,
	});

	myViewModel = new ViewModel();

    ko.applyBindings(myViewModel);
};

// Location constructor function
var Location = function (data, map, markers, infowindow) {
	var self = this;
	var myLatLong = data.pos;
	this.locations = ko.observableArray([]);
	this.title = data.title;
	this.content = '<div>' + self.title + '</div>';

	this.marker = new google.maps. Marker({
		map: map,
		draggable: true,
		animation: google.maps.Animation.DROP,
		position: myLatLong,
		title: this.title
	});
		
	this.addMarker = function(location) {
		this.markers.push(marker);
	}

	this.toggleBounce = function() {
		if(self.marker.getAnimation() !== null)
		{
			self.marker.setAnimation(null);
		} else {	
			self.marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function() {
				self.marker.setAnimation(null);
				}, 2000);
		}
    };

    this.marker.addListener('click', this.toggleBounce);
};
	

var ViewModel = function() {
	var self = this;
	this.Location = ko.observableArray([]);
	locations.forEach(function(locationItem) {
		self.Location.push(new Location(locationItem, map));
	});

	this.Location().forEach(function(place){
        google.maps.event.addListener(place.marker, 'click', function () {
            self.clickLocation(place);
        });
    });

    var infowindow = new google.maps.InfoWindow();
    this.clickLocation = function(location){
        infowindow.setContent(location.content);
        infowindow.open(this.map, location.marker);
        location.toggleBounce();
    };

    self.filteredList = ko.computed(function(){
        var filtered = [];
        this.Location().forEach(function(Location){
            if (location.visible === true) {
                filtered.push(location);
            }
        });
        return filtered;
    }, this);
};

	this.remove = function () {
		this.locations.removeEach(this.selectItem());
		this.selectItem([]);
	};
