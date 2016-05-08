
app.factory('GetUberLauncherURL', function (first_name, last_name, email,
                                                   mobile_country_code, mobile_phone, product_id,
                                                   pickup_latitude, pickup_longitude, pickup_address,
                                                   dropoff_latitude, dropoff_longitude, dropoff_address)
                  {
    return  'https://m.uber.com/sign-up?client_id=' + uberAppId +
        getQueryStringTouple('first_name', first_name) +
        getQueryStringTouple('last_name', last_name) +
        getQueryStringTouple('email', email) +
        getQueryStringTouple('mobile_country_code',  mobile_country_code) +
        getQueryStringTouple('mobile_phone', mobile_phone) +
        getQueryStringTouple('product_id', product_id) +
        getQueryStringTouple('pickup_latitude', pickup_latitude) +
        getQueryStringTouple('pickup_longitude', pickup_longitude) +
        getQueryStringTouple('pickup_address', window.encodeURIComponent(pickup_address)) +
        getQueryStringTouple('dropoff_latitude', dropoff_latitude) +
        getQueryStringTouple('dropoff_longitude', dropoff_longitude) +
        getQueryStringTouple('dropoff_address', window.encodeURIComponent(dropoff_address));
});


app.factory('GetRoutesAsync', function(userId, lat, lng, radius, callbackFunction) {
    if (localStorage.deviceGUID == null) {
        localStorage.deviceGUID = generateUUID();
    }
    var serviceURL = GetRoutesEndPoint(userId, lat, lng, radius);
    $.getJSON(serviceURL, function (result) {
        callbackFunction(result);
    });
});

app.factory('GetUberEstimateTimeAsync', function(userId, lat, lng, callbackFunction)
                  {
    var serviceURL = GetUberTimeEstimateEndPoint(userId, lat, lng);
    $.getJSON(serviceURL, function (result) {
        callbackFunction(result);
    });
});

app.factory('UberServices', function($http)
                  {
    var uberServices = {};
    uberServices.GetUberTripEstimate = function(userId, sLat, sLng, eLat, eLng)
    {
        var serviceURL = GetUberTripEstimateUrl(userId, sLat, sLng, eLat, eLng);

        return $http.jsonp(serviceURL);



    };    
    uberServices.GetUberLauncherURL = function(first_name, last_name, email,
                                                mobile_country_code, mobile_phone, product_id,
                                                pickup_latitude, pickup_longitude, pickup_address,
                                                dropoff_latitude, dropoff_longitude, dropoff_address)
    {
        return  'https://m.uber.com/sign-up?client_id=' + uberAppId +
            GetQueryStringTouple('first_name', first_name) +
            GetQueryStringTouple('last_name', last_name) +
            GetQueryStringTouple('email', email) +
            GetQueryStringTouple('mobile_country_code',  mobile_country_code) +
            GetQueryStringTouple('mobile_phone', mobile_phone) +
            GetQueryStringTouple('product_id', product_id) +
            GetQueryStringTouple('pickup_latitude', pickup_latitude) +
            GetQueryStringTouple('pickup_longitude', pickup_longitude) +
            GetQueryStringTouple('pickup_address', window.encodeURIComponent(pickup_address)) +
            GetQueryStringTouple('dropoff_latitude', dropoff_latitude) +
            GetQueryStringTouple('dropoff_longitude', dropoff_longitude) +
            GetQueryStringTouple('dropoff_address', window.encodeURIComponent(dropoff_address));
    };

    uberServices.GetUberNativeLauncherURL = function(first_name, last_name, email,
                                                      product_id,
                                                      pickup_latitude, pickup_longitude, pickup_address,
                                                      dropoff_latitude, dropoff_longitude, dropoff_address) {

        return 'uber://?client_id=' + uberAppId +
            '&action=setPickup' +
            GetQueryStringTouple('pickup[latitude]',  pickup_latitude) +
            GetQueryStringTouple('pickup[longitude]', pickup_longitude) +
            GetQueryStringTouple('pickup[formatted_address]', window.encodeURIComponent(pickup_address)) +
            GetQueryStringTouple('dropoff[latitude]', dropoff_latitude) +
            GetQueryStringTouple('dropoff[longitude]', dropoff_longitude) +
            GetQueryStringTouple('dropoff[formatted_address]', window.encodeURIComponent(dropoff_address)) +
            GetQueryStringTouple('product_id', product_id);
    };

    return uberServices;

});

app.factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork){

    return {
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

var baseWebService_URL = 'http://navetaws.azurewebsites.net/NavEta_Services.svc/'
var uberAppId = 'cYIhFfG8eL53HxXH2QBVzzx-O7KTZiSH';

//Functions
function getQueryStringTouple(variableName, variableValue)
{
    if (variableValue != null && variableValue != "")
    {
        return '&' + variableName + '=' + variableValue ;
    }
}

function GetUserHistoryEndPoint(userId) {
    return baseWebService_URL + 'User/History/' + userId + '?callback=?';
}

function GetUserPreferencesEndPoint(userId) {
    return baseWebService_URL + 'User/Preferences/' + userId + '?callback=?';
}

function GetRoutesEndPoint(userId, lat, lng, radius) {
    return baseWebService_URL + 'Routes/'+ userId + '/?lat=' + lat + '&long=' + lng + '&rad=' + radius + '&callback=?';
}

//Social/Uber/TimeEstimate/{userId}/?lat={latitude}&long={longitude}"
function GetUberTimeEstimateEndPoint(userId, lat, lng, radius) {
    return baseWebService_URL + 'Social/Uber/TimeEstimate/' + userId + '/?lat=' + lat + '&long=' + lng + '&callback=?';
}

function GetUberTripEstimateUrl(userId, sLat, sLng, eLat, eLng) {
    //Social/Uber/PriceEstimate/{userId}/?sLat={startLatitude}&sLong={startLongitude}&eLat={endLatitude}&eLong={endLongitude}
    return baseWebService_URL + 'Social/Uber/PriceEstimate/' + userId + '/?sLat=' + sLat + '&sLong=' + sLng + '&eLat=' + eLat + '&eLong=' + eLng + '&callback=JSON_CALLBACK';
}

function GetQueryStringTouple(variableName, variableValue)
{
    if (variableValue != null && variableValue != "")
    {
        return '&' + variableName + '=' + variableValue ;
    }
}