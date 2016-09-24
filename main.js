// NOTE: declare global variables
var map, locations;

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 28.9288298,
            lng: -81.2354897
        },
        zoom: 13,
        mapTypeControl: false
    });

    locations = [{
        title: 'Stephen Home',
        location: {
            lat: 28.9288298,
            lng: -81.2354897
        }
    }, {
        title: 'RaceTrac',
        location: {
            lat: 28.9478792,
            lng: -81.2517882
        }
    }, {
        title: 'Dunkin Donuts',
        location: {
            lat: 28.9440047,
            lng: -81.2440784
        }
    }, {
        title: 'Epic Theatre',
        location: {
            lat: 28.9336987,
            lng: -81.2521422
        }
    }, {
        title: 'Deltona Gulf-Club',
        location: {
            lat: 28.9227577,
            lng: -81.2444269
        }
    }, {
        title: 'Deltona Library',
        location: {
            lat: 28.9277695,
            lng: -81.231004
        }
    }];
}
}

var filterText = ko.observable("");

var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=wikiCallBack&search=';

var Location = function (data, map) {
    var self = this;
    this.position = ko.observable(data.location);
    this.title = ko.observable(data.title);
    this.marker = ko.observable();
    this.searchWiki = data.search;
    this.content = '<div>' + self.title() + '</div>';

    this.marker = new google.maps.Marker({
        position: this.position(),
        map: map,
        title: this.title()
    });;
    self.marker.setAnimation(null);


    this.visible = ko.computed(function () {
        if (filterText()
            .length > 0) {
            return (self.title()
                .toLowerCase()
                .indexOf(filterText()
                    .toLowerCase()) > -1);
        } else {
            return true;
        }
    }, this);

    $.ajax({
            url: wikiURL + self.searchWiki,
            dataType: 'jsonp',
            timeout: 1000
        })
        .done(function (data) {
            self.content = '<div>' + self.title() + '</div>' + '<p>' + data[2][0] + '<a href=' + data[3][0] + ' target="blank"> Wikipedia</a></p>';
        })
        .fail(function (jqXHR, textStatus) {
            alert("failed to get wikipedia resources");
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
};

var ViewModel = function () {
    var self = this;

    this.locationList = ko.observableArray([]);
    locations.forEach(function (locationItem) {€
        self.locationList.push(new Location(locationItem, map));
    });

    this.locationList()
        .forEach(function (place) {
            google.maps.event.addListener(place.marker, 'click', function () {
                self.clickLocation(place);
            });
        });

    var infowindow = new google.maps.InfoWindow();
    this.clickLocation = function (location) {
        infowindow.setContent(location.content);
        infowindow.open(this.map, location.marker);
        location.toggleBounce();
    };

    self.filteredList = ko.computed(function () {
        var filtered = [];
        this.locationList()
            .forEach(function (location) {
                if (location.visible()) {
                    filtered.push(location);
                }
            });
        return filtered;
    }, this);

}

function start() {
    initMap();
    ko.applyBindings(new ViewModel());
}

function googleError() {
    alert("failed to get google map resources");
}
