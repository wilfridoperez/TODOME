app.factory('commonServices',  function( 
                                                $rootScope, 
                                                $cordovaNetwork, 
                                                $ionicLoading)
                  {
    var reservedWords =   ["Current Location", "Home", "Work"];

    function getSavedSearchLocations()
    {
        var jsonObject = [];
        for(var i = 0; i < 5 ;i++ )
        {
            if (localStorage.getItem("Search" + i) != null && 
                localStorage.getItem("Search" + i) != "null")
            {
                jsonObject.push({ "Search": localStorage.getItem("Search" +i) });
            }
        }
        return jsonObject;
    }

    function generateGUID()
    {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }


    return {
        getFirebaseNavETABasedUrl: function(env)
        {
            switch(env)
            {
                case 'DIT':
                case 'SIT':
                case 'UAT':
                case 'PTE':
                case 'PROD':
                default:
                    {
                        return 'http://TODOMeDIT.firebaseIO.com/'; 
                    }
            }

        },

        getFirebasePublicTransitBasedUrl: function(env)
        {
            switch(env)
            {
                case 'DIT':
                case 'SIT':
                case 'UAT':
                case 'PTE':
                case 'PROD':
                default:
                    {
                        return 'http://publicdata-transit.firebaseio.com/'; 
                    }
            }

        },

        getWaitingMessage: function(caption)
        {
            return '<p><ion-spinner icon="dots"></ion-spinner></p><p>' + caption + '</p>';
        },

        getSavedSearchLocations: function ()
        {

            return getSavedSearchLocations();
        },

        getReserveLocations: function ()
        {
            return  ["Current Location", "Home", "Work"];
        },

        saveSearchLocation: function (location)
        {
            var reservedLocations = reservedWords;
            if (reservedLocations.indexOf(location) >= 0)
            {
                return -1;
            }
            var max = 5;
            //-> Check if element exists in array;
            for (var i = 0; i < max ; i++) {
                if (localStorage.getItem("Search" + i) == location) {
                    return -1;
                }
            }
            for (var i = 0; i < max ; i++) {
                if (localStorage.getItem("Search" + i) == "null") {
                    localStorage.setItem("Search" + i, location);
                    return getSavedSearchLocations();
                }
            }
            //-> It could not find location
            for (var i = max-1; i > 0 ; i--) {
                e = i-1;
                localStorage.setItem("Search" + i, localStorage.getItem("Search" + e));
            }
            localStorage.setItem("Search0", location);
            return getSavedSearchLocations();
        },

        getDeviceUUID: function()
        {
            if (localStorage.deviceGUID == null) 
            {  
                try {
                    if (window.device == null)
                    {
                        localStorage.deviceGUID = generateGUID();
                    }
                    else
                    {
                        localStorage.deviceGUID = window.device.uuid;
                    }
                }
                catch (e)
                {
                    console.error("Error retrieving Device UUID - error: "  + e);
                    localStorage.deviceGUID = generateGUID();
                }
            }
            return localStorage.deviceGUID;
        },

        generateGUID: function () 
        {
            return generateGUID();
        },

        getLatLng: function (position)
        {
            var latLong = "";
            if (position.coords == null) {
                latLong = new google.maps.LatLng(position.lat(), position.lng());
            }
            else {
                latLong = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            }
            return latLong;
        },

        getDefaultMapStyle: function () 
        {
            return [{ "featureType": "landscape", "elementType": "geometry.fill", "stylers": [{ "lightness": "-19" }, { "hue": "#ffb600" }, { "saturation": "49" }] }, { "featureType": "poi", "elementType": "labels", "stylers": [{ "visibility": "on" }] }, { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#000000" }, { "weight": 5.04 }] }, { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [{ "visibility": "off" }] }];
        },

        storeLatLngLocation: function (lat, lng)
        {
            localStorage.setItem('LastLat_Location', lat);
            localStorage.setItem('LastLng_Location', lng);
        },

        toast: function(caption)
        {
            $ionicLoading.show({ template: caption, noBackdrop: true, duration: 2000 });
        },
        
        objectToValidJsonBool: function (value, defaultValue)
        {
         var returnValue = value;
            if (returnValue == undefined || returnValue == '' || returnValue == null)
            {
                    returnValue = defaultValue;
            }
            return returnValue;
        },
        objectToValidJsonString: function (str, defaultValue)
        {
            var returnValue = str;
            if (returnValue == undefined /*|| !returnValue*/ || returnValue == null)
            {
                if (defaultValue)
                    returnValue = defaultValue;
                else
                    returnValue = '';
            }
            return returnValue;
        },

        isOnline: function(){

            if(ionic.Platform.isWebView()){
                return $cordovaNetwork.isOnline();    
            } else {
                return navigator.onLine;
            }

        },
        
        ifOffline: function(){

            if(ionic.Platform.isWebView()){
                return !$cordovaNetwork.isOnline();    
            } else {
                return !navigator.onLine;
            }

        }

    }
});

