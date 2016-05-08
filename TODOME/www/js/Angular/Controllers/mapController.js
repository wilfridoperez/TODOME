app.controller('MapCtrl', function( $rootScope,
                                           $scope, 
                                           $ionicLoading, 
                                           $compile, 
                                           $cordovaGeolocation, 
                                           $ionicModal,
                                           $ionicPopup, 
                                           $timeout,
                                           $ionicSlideBoxDelegate,
                                           $window,
                                           $cordovaCamera,
                                           $cordovaNetwork,
                                           $cordovaDevice,
                                           $ionDrawerVerticalDelegate,
                                           $ionicNavBarDelegate,
                                           $ionicGesture,
                                           $state,
                                           Auth,
                                           UberServices,
                                           ConnectivityMonitor,
                                           commonServices,
                                           transitService,
                                           DataLayerEvent,
                                           DataLayerUser) {
    var googleMap = null;
    var lastLatLng = null;
    var marker = null;
    var userClickLatLng = null;

    var directionsServiceLastResponse = null;

    var geocoder = null; //new google.maps.Geocoder();
    var directionsService = null; // new google.maps.DirectionsService();
    var directionsDisplay = null; //new google.maps.DirectionsRenderer();

    var watchID = null;
    var cameraOptions = {
        quality: 75,
        targetWidth: 320,
        targetHeight: 320,
        saveToPhotoAlbum: false
    };

    //-> force user to authenticate
    var isAuthenticatd = localStorage.getItem('authenticated');
    if( !isAuthenticatd || isAuthenticatd == false)
    {
        $state.go('app.signIn', { onboarding: true });
    }

    //state
    $scope.userProfile = DataLayerUser.user;

    $scope.MapOptions_Bus = false;
    $scope.MapOptions_Subway = false;
    $scope.MapOptions_Train = false
    $scope.MapOptions_Tram = false;
    $scope.RouteOptions = "BestRoute";

    $scope.selectedPlaceText = null;
    $scope.selectedRoute = null;
    $scope.selectedRouteIndex = null;
    $scope.availableRoutes = null;

    $scope.SavedSearches = commonServices.getSavedSearchLocations();
    $scope.lastKnownPlaceText = 'Calculating...';
    $scope.userClickLatLngPlaceText = 'Calculating...';
    $scope.modalEventTitle = '';
    $scope.eventCaption = '';
    $scope.imgSelectedURI = '';
    $scope.modal = null;

    $scope.UserPlaceSearchDialog = null;
    $scope.availableRoutesDialog = null;

    $scope.currentPopup = null;
    $scope.isNavigationModeON = true;
    $scope.showFooter = true;
    $scope.showHeader = true;
    $scope.showTransitInfo = false;

    //User Preferences
    $scope.publishTwitter = false;
    $scope.publishFacebook = false;
    $scope.publishGooglePluss = false;
    $scope.isAppOnline = true; 
    $scope.isUserRegistered = false;

    ionic.Platform.ready(function() {

        $scope.isAppOnline = commonServices.isOnline(); 
        initializeGoogleComponents();
        resizeUiElements();
        mapInitialization();
        if ($scope.isAppOnline)
        {
            transitService.init(googleMap);
        }
    });

    angular.element(window).on('resize', windowResizeHandler);

    function deviceOnline()
    {
        initializeGoogleComponents();
        $scope.isAppOnline = true; 
    };

    addConnectivityListeners();

    //-> Preload Modal window
    $ionicModal.fromTemplateUrl('templates/UserPlaceSearchView.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.UserPlaceSearchDialog = modal;
    });

    $ionicModal.fromTemplateUrl('templates/AvailableRoutesView.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.availableRoutesDialog = modal;
    });

    $ionicModal.fromTemplateUrl('templates/chatView.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.chatDialog = modal;
    });

    $scope.openChat = function()
    {
        $scope.chatDialog.show();
        //commonServices.toast("Chat comming soon!!!");
    }

    $scope.toggleTransitInfo = function()
    {   
        $scope.showTransitInfo = !$scope.showTransitInfo;
        transitService.toggleTransitVehiclesOnMap();
    }

    $scope.placeSelected = function(place)
    {
        console.info('Google Place - Place_Changed - Begin');

        $scope.selectedPlaceText = place;    

        console.info('Google Place - Place_Changed - Place: ' + $scope.selectedPlaceText);

        $scope.UserPlaceSearchDialog.hide();
        $scope.showPopupDirectionDialog($scope.selectedPlaceText);//showDirectionDialog();
        console.info('Google Place - Place_Changed - End');

    }

    $scope.openVerticalBlind = function(handlerName)
    {
        $ionDrawerVerticalDelegate.$getByHandle(handlerName).toggleDrawer();

    }

    $scope.publishEvent = function()
    {
        var event = DataLayerEvent.event;
        event.title = $scope.modal.eventCaption; //hack: I was not able to get the value from the doal
        event.picture = $scope.imgSelectedURI;
        event.lat = userClickLatLng.lat();
        event.lng = userClickLatLng.lng();
        event.nearTo = $scope.userClickLatLngPlaceText;

        DataLayerEvent.saveEvent(event);

        $scope.toast('Tag has been published.');
        $scope.closeModal();
    }

    $scope.showUserPlaceSearchDialog = function() 
    {
        console.log('showUserPlaceSearchDialog() begin');
        setLastKnownPlace(lastLatLng);
        $scope.UserPlaceSearchDialog.show();
        console.log('showUserPlaceSearchDialog() end');
    };

    $scope.showAvailableRoutesView = function()
    {
        $scope.availableRoutesDialog.show();
    }

    $scope.showDirectionDialog = function()
    {
        displayIonicModal('templates/directionDialog.html');
    };

    $scope.showPopupEventMenuDialog = function()
    {
        if ($scope.currentPopup)
        {
            $scope.currentPopup.close();
        }
        $scope.currentPopup = displayIonicPopup('templates/eventMenuDialog.html', 'Tag an Event');
    };

    // showpopup method code
    $scope.showPopupDirectionDialog = function(place) 
    {
        $scope.SavedSearches = commonServices.saveSearchLocation(place);

        $scope.currentPopup =  displayIonicPopup('templates/directionDialog.html', place);
    };

    $scope.directionToHereSelected = function()
    {
        $scope.currentPopup.close();
        calculateAndDisplayRoute(directionsDisplay, 
                                 $scope.selectedPlaceText, 
                                 lastLatLng);
    };

    $scope.directionFromHereSelected = function()
    {
        $scope.currentPopup.close();
        calculateAndDisplayRoute(directionsDisplay, 
                                 lastLatLng, 
                                 $scope.selectedPlaceText);
    };

    $scope.addressSelected = function(placeText)
    {
        $scope.selectedPlaceText = placeText;

        $scope.UserPlaceSearchDialog.hide();
        $scope.showPopupDirectionDialog(placeText);
        console.log(placeText);
    }

    $scope.togglevariable = function (variable, index) {
        $scope[variable + index] =! $scope[variable + index]; 
    }

    $scope.getVehicleTypeImageName = function(vehicleType)
    {
        switch (vehicleType) {
            case "BUS":
            case "INTERCITY_BUS":
            case "SHARE_TAXI":
                {
                    return "Bus.svg";
                }
            case "SUBWAY":
                {
                    return "Subway.svg";
                }
            case "HEAVY_RAIL":
            case "COMMUTER_TRAIN":
            case "HIGH_SPEED_TRAIN":
            case "RAIL":
                {
                    return "Train.svg";
                }
            case "TRAM":
            case "METRO_RAIL":
                {
                    return "Tram.svg";
                }
            case "CABLE_CAR":
            case "TROLLEYBUS":
                {
                    return "Trolleybus.svg";
                }
            case "GONDOLA_LIFT":
            case "FUNICULAR":
                {
                    return "Gondola.svg";
                }
            case "FERRY":
                {

                    return "Ferry.svg";
                }
            default: //other
                {
                    return "watch2.svg";
                }
        }
    }

    $scope.routeSelected = function(index)
    {
        console.info('Route Selected - index: ' + index)
        $scope.selectedRouteIndex = index;
        $scope.selectedRoute = $scope.availableRoutes[parseInt(index)];
        if (directionsDisplay.getDirections().routes.length == 0)
        {
            directionsDisplay.setDirections(directionsServiceLastResponse);
        }
        directionsDisplay.setRouteIndex(parseInt(index));
        $scope.availableRoutesDialog.hide();
    }

    $scope.cancelRoute = function ()
    {
        console.info('Route canceled')
        $scope.selectedRouteIndex = null;
        $scope.selectedRoute = null;
        directionsDisplay.setDirections({routes: []});
    }

    $scope.toggleResize = function(element, elementName) 
    {
        var elementToToggle = $("#" + elementName + element.accessKey)
        elementToToggle.slideToggle("fast", function () {
            if ($(elementToToggle).is(":visible")) {
                element.src = "img/SVG/Freepik/arrow-up-bold.svg";
            }
            else {
                element.src = "img/SVG/Freepik/arrow-down-bold.svg";
            }
        });
    }

    $scope.clearSearch = function()
    {
        $scope.selectedPlaceText = '';
    }

    $scope.OpenUberDeepLink = function(uberProductId)
    {
        //   directionsServiceLastResponse
        var s = directionsServiceLastResponse.routes[0].legs[0];

        var uber_native_url = UberServices.GetUberNativeLauncherURL('', '', '', uberProductId,
                                                                    s.start_location.lat(), s.start_location.lng(),
                                                                    s.start_address,
                                                                    s.end_location.lat(), s.end_location.lng(),
                                                                    s.end_address
                                                                   );

        var uber_web_url = UberServices.GetUberLauncherURL('', '', '', '', '', uberProductId,
                                                           s.start_location.lat(), s.start_location.lng(),
                                                           s.start_address,
                                                           s.end_location.lat(), s.end_location.lng(),
                                                           s.end_address
                                                          );

        $window.location.href = uber_native_url;

    }

    $scope.takePicture = function(photoSourceType) {
        if (isDeviceCameraAvailble())
        {
            if (photoSourceType == "CAMERA")
            {
                photoSourceType = Camera.PictureSourceType.CAMERA;
            }
            else
            {
                photoSourceType = Camera.PictureSourceType.PHOTOLIBRARY;
            }

            var options = { 
                quality : 75, 
                destinationType : Camera.DestinationType.DATA_URL, 
                sourceType: photoSourceType, 
                allowEdit : true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 300,
                targetHeight: 300,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false
            };
            $scope.imgSelectedURI = '';
            $cordovaCamera.getPicture(options).then(function(imageData) {
                //$scope.modal.close();
                $scope.imgSelectedURI = "data:image/jpeg;base64," + imageData;


            }, function(err) {
                // An error occured. Show a message to the user
                console.error(err);

            });
        }
        else
        {
            $scope.toast('Camera is not supported by this device.');
        }

    };

    $scope.toast = function(caption)
    {
        $ionicLoading.show({ template: caption, noBackdrop: true, duration: 2000 });
    }

    $scope.tagEvent = function (eventType)
    {  
        console.info('$scope.tagEvent = function (eventType) - begin. eventType = ' + eventType );

        if ($scope.currentPopup)
        {
            $scope.currentPopup.close();
        }
        getPlacefromLatLng(userClickLatLng, $scope.userClickLatLngPlaceText);

        $scope.modalEventTitle = 'Event Tag: ' + eventType;
        displayIonicModal('templates/tagEventView.html');

        if (eventType == 'Photo')
        {
            $scope.takePicture('CAMERA');
        }
        console.info('$scope.tagEvent = function (eventType) - end. eventType = ' + eventType );
    };

    $scope.expandText = function(){
        var element = document.getElementById('eventText');
        element.style.height =  element.scrollHeight + "px";
    }

    $scope.mapCompassClicked = function()
    {
        if (watchID == null) {
            watchID = navigator.geolocation.watchPosition(tagLatLngOnMap, positionError);
            googleMap.panTo(lastLatLng);
            $scope.isNavigationModeON = true;
        }
    }

    $scope.clearSearch = function()
    {

    }

    $scope.getLastKnownLatLng = function()
    {
        return     getLastKnownLatLng();
    }

    $scope.setLastKnownPlace  = function(location)
    {
        setLastKnownPlace(location);
    }

    function getLastKnownLatLng()
    {
        var lat = localStorage.getItem('LastLat_Location');
        var lng = localStorage.getItem('LastLng_Location');

        if(lat != null && lng != null)
        {
            return new google.maps.LatLng(lat,lng);
        }
        else
        {
            return null;
        }
    }

    function getPlacefromLatLng(latlng, scope_var) 
    {
        if ($scope.isAppOnline)
        {
            geocoder.geocode({ 'location': latlng }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {

                        $scope.userClickLatLngPlaceText = results[1].formatted_address;
                    } else {
                        $scope.userClickLatLngPlaceText = 'unknown';
                    }
                } else {
                    $scope.userClickLatLngPlaceText = 'unknown';
                }
            });
        }
        else
        {
            //TODO: Get the coordinates instead.
            $scope.userClickLatLngPlaceText = ' - Sorry, location is not avaialble.';
        }
    }

    function isDeviceCameraAvailble()
    {
        console.info('function isDeviceCameraAvailble() - begin');
        try
        {
            var camera = Camera;
            console.info('function isDeviceCameraAvailble(): Camera Avialable - end');
            return true;
        }
        catch (err)
        {
            console.error('function isDeviceCameraAvailble(): Error - end - Code: ' + err.code + ' - Message: ' + err.message);
            return  false;
        }

    }

    function addConnectivityListeners(){

        if(ionic.Platform.isWebView()){
            $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
                deviceOnline();
            });

            // Disable the map when the user goes offline
            $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
                //disableMap();
            });

        }
        else {

            //Same as above but for when we are not running on a device
            window.addEventListener("online", function(e) {
                deviceOnline();
            }, false);    

            window.addEventListener("offline", function(e) {
                // disableMap();
            }, false);  
        }
    }

    function setLastKnownPlace(location)
    {
        console.log('GetCurrentPlaceText() - begin.');
        geocoder.geocode({ 'location': location }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    console.log('GetCurrentPlaceText() - Place retrived: ' + results[1].formatted_address);
                    $scope.$apply(function(){
                        $scope.lastKnownPlaceText = results[1].formatted_address;
                    });

                } else {
                    console.log('GetCurrentPlaceText() - Result Null');
                    $scope.lastKnownPlaceText =  'unknown';
                }
            } else {
                console.log('GetCurrentPlaceText() - Error - status= ' + status );
                $scope.lastKnownPlaceText = 'unknown';
            }
        });
        console.log('GetCurrentPlaceText() - end.');
    }

    function positionError(e)
    {
        //TODO: Find a way to display errors. if we leave this toast it may become annoying to the user. 
        //$scope.toast("Error refreshing current position, please try later.");
        console.error("Position-Error", "Error refreshing current position - Code: " + e.code + " - Message: " + e.message);
    }

    function tagLatLngOnMap(position) 
    {
        var currentLatLong = commonServices.getLatLng(position);
        console.info('tagLatLngOnMap - position= ' + currentLatLong);

        if (lastLatLng == null) 
        {
            lastLatLng = currentLatLong;
        }

        if ( $scope.isNavigationModeON)
        {
            googleMap.panTo(currentLatLong);
        }

        var heading = google.maps.geometry.spherical.computeHeading(lastLatLng, currentLatLong);
        if (marker == null) {
            marker = new google.maps.Marker({
                clickable: false,
                icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    strokeColor: '#3333FF',
                    strokeWeight: 5,
                    rotation: heading,
                    scale: 2.5
                },
                shadow: null,
                zIndex: 999,
                position: currentLatLong,
                map: googleMap
            });

        }
        else {
            var locationIcon = marker.get('icon');
            locationIcon.rotation = heading;
            marker.set('icon', locationIcon);

            //googleMap.panTo(currentLatLong);

            marker.setPosition(currentLatLong);
        }
        lastLatLng = currentLatLong;


    }

    function displayIonicModal(templateUrl)
    {
        $ionicModal.fromTemplateUrl(templateUrl, {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });

        $scope.openModal = function() {
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hidden', function() {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function() {
            // Execute action
        });

    }

    function displayIonicPopup(templateUrl, title)
    {
        if ($scope.currentPopup)
        {
            $scope.currentPopup.close();
            $scope.currentPopup = null;
        }
        return $ionicPopup.show({
            templateUrl:templateUrl,
            title: title,
            subTitle: '',
            scope: $scope,
            //noBackdrop:true,   
            buttons: [
                { text: 'Cancel' }
            ]
        });
    }

    function initializeGoogleComponents()
    {
        if ($scope.isAppOnline)
        {
            geocoder = new google.maps.Geocoder();
            directionsService = new google.maps.DirectionsService();
            directionsDisplay = new google.maps.DirectionsRenderer();
        }
    }


    function windowResizeHandler( ) 
    {
        tagLatLngOnMap(lastLatLng);
        resizeUiElements();
        googleMap.panTo(commonServices.getLatLng(lastLatLng));
    }

    //TODO: VIOLATION -> Method manipulates the view. It shoud not be in the controller.
    function resizeUiElements()
    {
        var divMap = document.getElementById('map');
        //   var header = document.getElementById('viewMap-header');
        var drawerButtom = document.getElementById('viewMap-drawerButtom');

        try
        {
            console.log('div:Map - top:' + divMap.style.top + '; bottom: ' + divMap.style.bottom);
            console.log('drawerButtom:Map - top:' + drawerButtom.style.top + '; bottom: ' + drawerButtom.style.bottom);

            //   divMap.style.top = '44px';
            //    divMap.style.height = (window.screen.availHeight  - drawerButtom.clientHeight) + 'px';
            //div.style.top =    '45px';
        }
        catch (e)
        {


        }
    }


    function calculateAndDisplayRoute(directionsDisplay, fromLoc, toLoc) 
    {
        console.log("calculateAndDisplayRoute_Begin - Origin: " + fromLoc + " Destination: " + toLoc);
        $ionicLoading.show({
            template: commonServices.getWaitingMessage('Calculating route...'),
            animation: 'fade-in',
            showBackdrop: true
        });
        
        var transitOptions = "";
        var transitModes = [];
         if ($scope.MapOptions_Bus)
         {
            transitModes.push(google.maps.TransitMode.BUS);
         }
        if ($scope.MapOptions_Subway)
        {
            transitModes.push(google.maps.TransitMode.SUBWAY);
        }
        if ($scope.MapOptions_Train)
        {
            transitModes.push(google.maps.TransitMode.TRAIN);
        }
        if ($scope.MapOptions_Tram)
        {
            transitModes.push(google.maps.TransitMode.TRAM);
        }
//    $scope.RouteOptions = "BestRoute";

        
        directionsService.route({
            origin: fromLoc,
            destination: toLoc,
            provideRouteAlternatives: true,
            travelMode: google.maps.TravelMode.TRANSIT

            , transitOptions: 
            {
                //    'arrivalTime': new Date('april/23/2016'),
                //    'departureTime': new Date('april/23/2016'),
                    'modes': transitModes,
                //    'routingPreference': google.maps.TransitRoutePreferenceFEWER_TRANSFERS
            }
            //departureTime: 
            //modes: BUS, RAIL, SUBWAY, TRAIN, TRAM
            //routingPreference: FEWER_TRANSFERS || LESS_WALKING

        }, function (response, status) {
            $ionicLoading.hide();

            switch (status) {
                case google.maps.DirectionsStatus.OK:
                    {
                        directionsServiceLastResponse = response;
                        console.log("calculateAndDisplayRoute_OK - Origin: " + fromLoc + " Destination: " + toLoc);
                        directionsDisplay.setDirections(response);


                        $scope.availableRoutes = directionsServiceLastResponse.routes;

                        $scope.showAvailableRoutesView();
                        var origenLatlng = response.routes[0].overview_path[0];
                        var destinationLatlng = response.routes[0].overview_path[response.routes[0].overview_path.length - 1];

                        $scope.uberTripPriceEstimates = null;

                        UberServices.GetUberTripEstimate('12', origenLatlng.lat(), origenLatlng.lng(), destinationLatlng.lat(), destinationLatlng.lng())
                            .success(function(response) {

                            $scope.uberTripPriceEstimates = response;
                            $timeout(function() {
                                // $ionicSlideBoxDelegate.slide(0);
                                $ionicSlideBoxDelegate.update();
                                // $scope.$apply();
                            });

                        })
                            .error(function(data, status, headers, config){
                            console.log('Factory GetUberTripEstimate() error. Status: ' + status);
                        });

                        break;
                    }
                case google.maps.DirectionsStatus.NOT_FOUND:
                    {
                        console.error("calculateAndDisplayRoute_NOT_FOUND - Origin: " + fromLoc + " Destination: " + toLoc);
                        //       toast("Start point or destination is not valid - (NF)");
                        break;
                    }
                case google.maps.DirectionsStatus.ZERO_RESULTS:
                    {
                        console.error("calculateAndDisplayRoute_ZERO_RESULTS - Origin: " + fromLoc + " Destination: " + toLoc);
                        //        toast("No routes were found between the origin and destination. Please review the addresses provided and try again - (ZR)");
                        break;
                    }
                case google.maps.DirectionsStatus.INVALID_REQUEST:
                    {
                        console.error("calculateAndDisplayRoute_INVALID_REQUEST - Origin: " + fromLoc + " Destination: " + toLoc);
                        //        toast("Start point or destination is not valid - (IR)");
                        break;
                    }
                default:
                    {
                        //      toast("Start point or destination is not valid - " + status);
                        console.error("Route_Error", "Gougle Route error - " + status);
                        break;
                    }
            }
        });

    }

    function mapInitialization() 
    {

        console.info('mapInitialization() - Enter function.');

        if (!$scope.isAppOnline)
        {    
            console.info('mapInitialization() - Device is offline. Exit function.');
            return false;
        }


        //TODO: Change the return type to be a regular json object.
        lastLatLng = getLastKnownLatLng();
        if (lastLatLng == null || lastLatLng == '')
        {
            console.log('mapInitialization() - No known Lat&Lng. Waiting message displayed.');
            $ionicLoading.show({
                template: commonServices.getWaitingMessage('Loading...'),
                animation: 'fade-in',
                showBackdrop: true
            });
            //Default Location - New York
            lastLatLng = new google.maps.LatLng(40.7127, -74.0059);
        }

        var mapOptions = {
            center: lastLatLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            styles: commonServices.getDefaultMapStyle() 
        };

        var mapElement = document.getElementById("map");
        googleMap =  new google.maps.Map(mapElement, mapOptions);


        directionsDisplay.setMap(googleMap);

        //-> Create Compass
        var controlCompass = document.getElementById("imgCompass");
        googleMap.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(controlCompass);

        googleMap.addListener('click', function (event) {
            userClickLatLng = event.latLng;
            $scope.showPopupEventMenuDialog(userClickLatLng);
        });

        tagLatLngOnMap(lastLatLng);

        watchID = navigator.geolocation.watchPosition(tagLatLngOnMap, positionError);

        googleMap.addListener('dragend', function (event) {
            if (watchID != null) {
                navigator.geolocation.clearWatch(watchID);
                watchID = null;
                $scope.isNavigationModeON = false;
                $scope.$apply();
            }
        });

        //-> Initialize Google Components
        console.info('mapInitialization() - Retrieve Current Location.');

        if (!$window.navigator)
        {
            console.error('Navigator/GPS is not supported by this device.');
        }
        else {
            $window.navigator.geolocation.getCurrentPosition(
                function(position)
                {
                    console.info('mapInitialization() - Current Location obtained.');
                    var lat  = position.coords.latitude
                    var lng = position.coords.longitude

                    var currentLocation = new google.maps.LatLng(lat,lng);
                    lastLatLng = currentLocation;
                    commonServices.storeLatLngLocation(lat, lng);

                    //-> set center
                    tagLatLngOnMap(currentLocation);
                    $ionicLoading.hide();
                }, 
                function (error) {
                    $ionicLoading.hide();
                    console.error('Error - $window.navigator.geolocation.getCurrentPosition(): Error Code:' + error.code + ' - Error Message: ' + error.message);

                },
                {maximumAge:0, timeout:20000, enableHighAccuracy:true});
        }
        console.info('mapInitialization() - end.');
    };
});




