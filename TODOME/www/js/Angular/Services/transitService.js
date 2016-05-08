//var transit = 
app.factory('transitService',  function(commonServices)
                  {

    var buses= {};
    var map= null;
    var ref= null;
    var $container= null;
    var $system= null;
    this.systemRef = null;

    return {
        init: function(map_canvas) {
            this.showTransitInfo = false;
            this.systemRef = null;
            this.buses= {};
            this.map = map_canvas;
            this.ref = new Firebase(commonServices.getFirebasePublicTransitBasedUrl());// "https://publicdata-transit.firebaseio.com/");
            this.animateBuses();
           // this.populateMap();
        },

        /**
       * animateBuses
       *
       * attach method to Google Maps Marker prototype to animate movement on data change
       */

        animateBuses: function() {
            var self = this;

            google.maps.Marker.prototype.animatedMoveTo = function (toLat, toLng) {
                var fromLat = this.getPosition().lat();
                var fromLng = this.getPosition().lng();
                var frames = [];
                var isLocationSame = (self._areFloatsAlmostEqual(fromLat, toLat) && self._areFloatsAlmostEqual(fromLng, toLng));
                var currentLat = 0.0;
                var currentLng = 0.0;

                if (isLocationSame) {
                    return;
                }

                // CREATE 200 ANIMATION FRAMES FOR BUS
                for (var percent = 0; percent < 1; percent += 0.005) {
                    currentLat = fromLat + percent * (toLat - fromLat);
                    currentLng = fromLng + percent * (toLng - fromLng);
                    frames.push(new google.maps.LatLng(currentLat, currentLng));
                }

                self.moveBus(this, frames, 0, 25);
            };
        },


        /**
       * moveBus
       *
       * display frame by frame the bus's movement on the map
       */

        moveBus: function (marker, latLngs, index, wait) {
            marker.setPosition(latLngs[index]);
            if (index !== latLngs.length - 1) {
                setTimeout(function () {
                    this.moveBus(marker, latLngs, index + 1, wait);
                }.bind(this), wait);
            }
        },


        /**
       * showTransitVehiclesOnMap
       *
       * listen for changes in UI and listen to transit firebase
       */

        showTransitVehiclesOnMap: function() {
            var self = this;
            //var systemRef;
            var systemData;
            //todo: activate transit based on current location
            this.showTransitInfo = true;
            this.systemRef = self.ref.child('ttc' + "/vehicles");//.limitToLast(200);
            this.systemRef == self.createBusListeners(this.systemRef);
        },
        
        toggleTransitVehiclesOnMap: function()
        {
            if(this.showTransitInfo)
            {
                this.hideTransitVehiclesOnMap();
            }
            else
            {
                this.showTransitVehiclesOnMap();
            }
        },


        /**
       * newBus
       *
       * create a new bus marker on Google Maps element
       * @param {Object} bus - contains information about a transit system bus
       * @param {String} busId - the bus's ID in Firebase
       */

        newBus: function(bus, busId) {
            var busLatLng = new google.maps.LatLng(bus.lat, bus.lon);

            // CAPITALIZE THE FIRST LETTER OF BUS ROUTE STRING (if applicable, e.g., for the Brooklyn "B61" bus)
            var busRouteHead = bus.routeTag.toString()[0].toUpperCase();
            var busRouteTail = bus.routeTag.toString().slice(1);
            var tag = busRouteHead + busRouteTail;
            var marker = new google.maps.Marker({
                icon: "http://chart.googleapis.com/chart?chst=d_bubble_icon_text_small&chld=bus|bbT|" + tag + "|03558e|f0eef1",
                position: busLatLng,
                map: this.map
            });

            this.buses[busId] = marker;
        },

        hideTransitVehiclesOnMap: function()
        {
            this.showTransitInfo = false;
            if (this.systemRef) {
                this.systemRef.off('child_changed');
                this.systemRef.off('child_removed');
                this.systemRef.off();
            }

            for(busMarker in this.buses){
                this.buses[busMarker].setMap(null);
                delete this.buses[busMarker];
            };
        },

        /**
       * createBusListeners
       *
       * update the map when bus data changes
       * @param {Firebase Ref} systemRef - reference to the vehicles node under a transit system Firebase
       */

        createBusListeners: function(systemRef) {
            var self = this;

            systemRef.once("value", function (snapshot) {
                snapshot.forEach(function (bus) {
                    self.newBus(bus.val(), bus.key());
                });
            });

            systemRef.on("child_changed", function (snapshot) {
                var busMarker = self.buses[snapshot.key()];

                if (busMarker) {
                    busMarker.animatedMoveTo(snapshot.val().lat, snapshot.val().lon);
                } else {
                    self.newBus(snapshot.val(), snapshot.key());
                }
            });

            systemRef.on("child_removed", function (snapshot) {
                var busMarker = self.buses[snapshot.key()];

                if (busMarker) {
                    busMarker.setMap(null);
                    delete self.buses[snapshot.key()];
                }
            });
            return systemRef;
        },


        /**
       * _areFloatsAlmostEqual
       *
       * test to see if two floats in JS are functionally equal
       * @param {Number} f1 - a number to compare
       * @param {Number} f2 - a number to compare
       * @param {Boolean} - whether the two floats are basically equal
       */

        _areFloatsAlmostEqual: function(f1, f2) {
            return (Math.abs(f1 - f2) < 0.000001);
        }
    }
});
