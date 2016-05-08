app.factory('DataLayerUser',  function( 
                  $firebaseArray, 
                   $firebaseObject,
                   commonServices,
                   Auth)
                  {
    var deviceUUID = commonServices.getDeviceUUID();

    var usersRef = new Firebase(commonServices.getFirebaseNavETABasedUrl() + 'users');
    var userProfile = []; 
    var userId = null;

    function GetUserProfile(deviceUUID)
    {
        userProfile = $firebaseObject(usersRef.child(deviceUUID));
        userProfile.$loaded().then(function() {
            console.log("User loaded record:", userProfile.$id, userProfile.someOtherKeyInData);
            this.userProfile = userProfile;
        });
        //userProfile.$save();
        return userProfile;
    }

    function getAuthProvider()
    {
        try
        {
            return Auth.$getAuth().provider;
        }
        catch (e)
        {
            console.error("Service/DataLayerService.getAuthProvider()", e);
            return null;
        }
    }

    var user =
        {
            'deviceUUID': deviceUUID,
            'name': '',
            'nickName': '',
            'language': '',
            'emailAddress': '',
            'homeAddress': '',
            'workAddress': '',
            'profilePicture': '',
            // 'isRegistered': getAuthProvider(),
            'lastLogin': '',
            'MapOptions_Bus': false,
            'MapOptions_Subway': false,
            'MapOptions_Train': false,
            'MapOptions_Tram': false,
            'RouteOptions_BestRoute': true,
            'RouteOptions_FewerTransfers': false,
            'RouteOptions_LessWalking': false,
            'Unit': 'Metric',
            'TimeFormat' : 'HH:mmT',
            'DateFormat' : 'yyyy/MM/dd'
        };

    return {

        user: userProfile,
        userName: "unknown",
        deviceId: commonServices.getDeviceUUID(),
        getUser: function(){
            return GetUserProfile(commonServices.getDeviceUUID());
        },
        getUserByDeviceUUID: function(deviceUUID){
            return GetUserProfile(deviceUUID);
        },
        save: function(data){
            
            userProfile.deviceUUID = deviceUUID;
            userProfile.$priority = 0;
            userProfile.name = commonServices.objectToValidJsonString(data.name);
            userProfile.nickName = commonServices.objectToValidJsonString(data.nickName);
            userProfile.language = commonServices.objectToValidJsonString(data.language);
            userProfile.emailAddress = commonServices.objectToValidJsonString(data.emailAddress);
            userProfile.homeAddress = commonServices.objectToValidJsonString(data.homeAddress);
            userProfile.workAddress = commonServices.objectToValidJsonString(data.workAddress);
            userProfile.profilePicture = commonServices.objectToValidJsonString(data.profilePicture);
            userProfile.lastLogin = Firebase.ServerValue.TIMESTAMP
            userProfile.profilePictureUrl = commonServices.objectToValidJsonString(data.profilePictureUrl);
            
            userProfile.MapOptions_Bus = commonServices.objectToValidJsonBool(data.MapOptionsBus, false);
            userProfile.MapOptions_Subway = commonServices.objectToValidJsonBool(data.MapOptionsSubway, false);
            userProfile.MapOptions_Train = commonServices.objectToValidJsonBool(data.MapOptionsTrain, false);
            userProfile.MapOptions_Tram = commonServices.objectToValidJsonBool(data.MapOptionsTram, false);

            userProfile.RouteOptions_BestRoute = commonServices.objectToValidJsonBool(data.RouteOptions_BestRoute, false);
            userProfile.RouteOptions_FewerTransfers = commonServices.objectToValidJsonBool(data.RouteOptions_FewerTransfers, false);
            userProfile.RouteOptions_LessWalking = commonServices.objectToValidJsonBool(data.RouteOptions_LessWalking, false);
            
            this.userName = userProfile.nickName;

            userProfile.$save().then(function(ref) {
                console.log("Record saved. - Id: " + ref.key()); 
            }, function(error) {
                console.log("Error:", error);
            });
            return true;
        }
    }
});


app.factory('DataLayerTODOList',  function(commonServices,$firebase,$firebaseArray)
                  {


    var todoListRef = new Firebase(commonServices.getFirebaseNavETABasedUrl() + 'TODOLists');// "naveta.firebaseIO.com/events");
    var todoListFire = $firebaseArray(eventsRef);

    var todoList =
        {
            'id': '',
            'createdOn': '',
            'title': '',
            'description': '',
            'notes': '',
            'isDeleted': ''
        };
    return {
        todoList: todoList,
        getTODOList: function(todoListId){
            todoList = $firebaseObject(todoListRef.child(todoListId));
            return todoList;
        },
        saveTodoList: function(data){

            eventFire.$add(
                {
                    'id' : commonServices.objectToValidJsonString(data.id),
                    'createdOn' : commonServices.objectToValidJsonString(Firebase.ServerValue.TIMESTAMP),
                    'title' : commonServices.objectToValidJsonString(data.title),
                    'description' : commonServices.objectToValidJsonString(data.description),
                    'notes' : commonServices.objectToValidJsonString(data.notes),
                    'isDeleted' : commonServices.objectToValidJsonString(data.isDeleted)
                }
            ).then(function(ref) {
                console.log("Record saved. - Id: " + ref.key()); 

            }, function(error) {
                console.log("Error:", error);
            });
            return true;

        },
        getTODOLits: function(userId, latitud, longitud, radiusKm)
        {
           //return list of TODOLists that this user has access to
            return true;
        }
    }
});

app.factory('DataLayerActivity',  function(commonServices)
                  {
    var activitiesRef = new Firebase(commonServices.getFirebaseNavETABasedUrl() + 'activities');// "naveta.firebaseIO.com/activities");
    return {
        getActivity: function(activityId){

            var activity = {};
            return activity;

        },
        saveActivity: function(activity){

            return true;

        },
        getActivitiesByUserID: function(userID, maxRecords)
        {
            return true;
        }
    }
});

app.factory('DataLayerNotifications',  function(commonServices)
                  {
    var notificationsRef = new Firebase(commonServices.getFirebaseNavETABasedUrl() + 'notifications'); //"naveta.firebaseIO.com/notifications");

    return {
        getNotification: function(notificationId){

            var notification = {};
            return notification;

        },
        saveNotification: function(notification){

            return true;

        },
        getSavedNotificationsByUserID: function(userID, maxRecords)
        {
            return true;
        }
    }
});

app.factory('DataLayerChat',  
                  function(commonServices, 
                            $firebase, 
                            $firebaseArray,
                            $firebaseObject,
                            $ionicScrollDelegate
                           )
                  {


    var chatRoomsRef = new Firebase(commonServices.getFirebaseNavETABasedUrl() + 'chats');// "naveta.firebaseIO.com/events");
    var activeChatRef = null;
    //  var activeChat = null;
    var chatRooms = $firebaseArray(chatRoomsRef);   
    var _chat =
        {
            "title" : "",
            "createdOn" : '',
            "isInappropriate" : false,
            "latitud" : 0,
            "longitud" : 0,
            "nearTo" : "",
            "privacy" : "",
            "title" : "",
            "userId" : "",
            "visible" : ""
        };
    var _message =
        {
            "message" : "",
            "createdOn" : '',
            "isInappropriate" : false,
            "latitud" : 0,
            "longitud" : 0,
            "nearTo" : "",
            "privacy" : "",
            "userId" : "",
            "visible" : "",
            "userName" : ""
        };

    return {
        activeChat: null,
        currentChat : _chat,
        message : _message,
        activeChatRef: this.activechatRef,
        activateChat: function(chatId){
            this.currentChat = chatRooms[chatId]
            this.activeChatRef = new Firebase(commonServices.getFirebaseNavETABasedUrl() + 'chats/' + this.currentChat.$id + '/messages/');

            this.activeChat = $firebaseArray(this.activeChatRef);   
            return  this.currentChat; 
        },
        sendMessage: function(userId, userName, message){

            this.message.message = message;
            this.message.createdOn = Firebase.ServerValue.TIMESTAMP;
            this.message.userId = userId;
            this.message.userName = userName;

            this.activeChat.$add(this.message)
                .then(function() {
                    console.log("Message Sent");
                }, function(error) {
                    console.log("Error: " + error);
                });
            
            return true;

        },
        getChatRooms: function(userId, latitud, longitud, radius)
        {   
            return chatRooms;
        },
        saveMessage: function(chatId, userId, userName, latitud, longitud, message)
        {   
            //save message
            message.message = message;
            message.createdOn = Firebase.ServerValue.TIMESTAMP;
            message.userId = userId;
        }
    }
});
