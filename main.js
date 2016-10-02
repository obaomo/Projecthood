var map;
var infowindow;
var mapBounds;
var markers = [];
var styles;
var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=wikiCallBack&search=';

//main code data for location
var myPlaces = [{
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
        lng: -81.2521422
    }
}, {
    title: 'Deltona Gulf Club',
    pos: {
    	lat: 28.9227577,
    	lng: -81.2444269
    }
}, {
    title: 'Deltona Library',
    pos: {
        lat: 28.9277695,
        lng: -81.231004
    }
}];

//(function(){
//
//})();

//main callback function for google map API 
function initmap() {

    var style = [{
        "featureType": "administrative"
        , "elementType": "labels.text.fill"
        , "styles": [{
            "color": "#444444"
        }]
    }, {
        "featureType": "landscape"
        , "elementType": "all"
        , "styles": [{
            "color": "#f2f2f2"
        }]
    }, {
        "featureType": "poi"
        , "elementType": "all"
        , "styles": [{
            "visibility": "off"
        }]
    }, {
        "featureType": "road.highway"
        , "elementType": "all"
        , "styles": [{
            "visibility": "simplified"
        }]
    }, {
        "featureType": "road.arterial"
        , "elementType": "labels.icon"
        , "styles": [{
            "visibility": "off"
        }]
    }];

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 28.9288298
            , lng: -81.2354897
        }
        , zoom: 13
        , styles: styles
        , mapTypeControl: null
    , });


    myViewModel = new ViewModel();

    ko.applyBindings(myViewModel);
};

var filterText = ko.observable("");

// Location constructor function
var Place = function (data, map, marker, infowindow) {
    var self = this;
    var myLatLong = data.pos;
    var wikiQuery = data.title;
    this.wikiArtcle = '';
    this.marker = marker;
    this.locations = ko.observableArray([]);
    this.title = ko.observable(data.title);
    this.content = '<div>' + self.title + '</div>';

    this.marker = new google.maps.Marker({
        map: map
        , draggable: true
        , animation: google.maps.Animation.DROP
        , position: myLatLong
        , title: this.title()
    });

    this.visible = ko.computed(function () {
        if (filterText().length > 0) {
            return (self.title().toLowerCase().indexOf(filterText().toLowerCase()) > -1);
        } else {
            return true;
        }
    });

    this.toggleMarker = ko.computed(function(){
    	//console.log(self.visible());
    	self.marker.setVisible(self.visible());
    });

   //use wikipedia to get info on place
   $.ajax({
        url: wikiURL + wikiQuery,
        dataType: 'jsonp',
        timeout: 1000
    }).done(function (data) {
    	//console.log(data);
    	var description = data[2][0],
    		url = data[3][0];
    		wikiEntryUrl = 'https://en.wikipedia.org/wiki/Wikipedia:Your_first_article';

    		if (description) {
    			self.content = '<div class="info-window"><div>' + self.title() + '</div>' + '<p>' + description + '<a href=' + url + ' target="blank"> Wikipedia</a></p></div';
    		} else {
    			self.content = '<div class="info-window"><div>' + self.title() + '</div>' + '<p> No Wikipedia Entry found. Be the first one to add it:<br><br><a href=' + wikiEntryUrl + ' target="blank">Click here to add a Wikipedia Article</a></p></div>';
    		}

    }).fail(function (jqXHR, textStatus) {
        alert.log("failed to get wikipedia resources");
    });

    this.toggleBounce = function () {
        if (self.marker.getAnimation() !== null) {
            self.marker.setAnimation(null);
        } else {
            self.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                self.marker.setAnimation(null);
            }, 2000);
        }
    };

    this.marker.addListener('click', this.toggleBounce);
}; // end Place constructor

//list of used identify for my view
var ViewModel = function () {
    var self = this;
    this.map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 28.9288298
            , lng: -81.2354897
        }
        , zoom: 13
    });

    this.placesList = ko.observableArray([]);
      myPlaces.forEach(function (placeItem) {
      self.placesList.push(new Place(placeItem, self.map));
    });

    this.placesList().forEach(function (place) {
        google.maps.event.addListener(place.marker, 'click', function () {
            self.clickPlace(place);
        });
    });

    var infowindow = new google.maps.InfoWindow();
    this.clickPlace = function (place) {
        infowindow.setContent(place.content);
        infowindow.open(this.map, place.marker);
        place.toggleBounce();
    };

    self.filteredItems = ko.computed(function () {
        var filtered = [];
        self.placesList().forEach(function (place) {
            if (place.visible()) {
                filtered.push(place);
            }
        });
        return filtered;
    });
};

function googleError() {
    // error handling here
    alert("failed to get google map resources");
}
