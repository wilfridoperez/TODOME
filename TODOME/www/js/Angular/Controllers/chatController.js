
//This controller supports the Chat room
TODOMeApp.controller('chatCtrl', function( 
                     $scope, 
                      $stateParams, 
                      $ionicPopup, 
                      $timeout, 
                      $ionicScrollDelegate,
                      $cordovaContacts,
                      $ionicPlatform,
                      commonServices,
                      DataLayerChat,
                      DataLayerUser
                     )
                     {

    var typing = false;
    var lastTypingTime;
    var TYPING_TIMER_LENGTH = 250;

    $scope.currentChatRoomId = null;
    $scope.currentChatRoom = null;
    $scope.defaultChatRoomPicture = "img/SVG/Freepik/people.svg";
    $scope.contacts = null;
    $scope.data = {};
    $scope.data.message = "";
    $scope.roomName = "Default Chat";

    var scrollBottom = function(){
        $ionicScrollDelegate.resize();
        $ionicScrollDelegate.scrollBottom(false);
        console.log("Chat Controller - scrollBottom");
    };

    function init(){
        $scope.roomName = DataLayerChat.currentChat.title;

        $scope.messages = DataLayerChat.activeChat;

        if(DataLayerChat.activeChat)
        {
            DataLayerChat.activeChat.$loaded().then(function(x) {
                scrollBottom();
            }).catch(function(error) {
                console.error("ChatController.DataLayerChat.activeChat.$loaded() - Error:", error);
            });
        }
        if(DataLayerChat.activeChatRef)
        {
            DataLayerChat.activeChatRef.on('child_added', function (snapshot) {
              //  console.log('message added');
                scrollBottom();
            });
        }

        if(!$scope.data.username){
            $scope.data.username = DataLayerUser.userName;
            $scope.data.userId = DataLayerUser.deviceId;
        }
    };

    init();

    $scope.sendMessage = function(msg){
        DataLayerChat.sendMessage($scope.data.userId, $scope.data.username, msg);

        scrollBottom();
        $scope.data.message = "";
    };

    if($stateParams.userId){
        $scope.data.message = "@" + $stateParams.userId;
        document.getElementById("msg-input").focus();
    } 

    var sendUpdateTyping = function(){
        if (!typing) {
            typing = true;
            //      Socket.emit('typing');
        }
        lastTypingTime = (new Date()).getTime();
        $timeout(function () {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                //   Socket.emit('stop typing');
                typing = false;
            }
        }, TYPING_TIMER_LENGTH);
    };

    $scope.updateTyping = function(){
        sendUpdateTyping();
    };
 
    $scope.messageIsMine = function(userId){
       // console.log("messageIsMine. owner:" + userId + " current user: " + $scope.data.userId);
        return $scope.data.userId == userId;
    };

    $scope.getBubbleClass = function(userId){
        var classname = 'from-them';
        if($scope.messageIsMine(userId)){
            classname = 'from-me';
        }
        return classname;
    };





    $scope.joinChat = function(roomName)
    {
        $scope.roomName = roomName;
    };

});


//This controller support the view that displays the list of avialable chats
navETAApp.controller('chatRoomsCtrl', function( 
                     $scope, 
                      DataLayerChat
                     )
                     {

    $scope.defaultChatRoomPicture = "img/SVG/Freepik/people.svg";

    $scope.chatRoomSelected = function(chatRoomId)
    {
        DataLayerChat.activateChat(chatRoomId);
    };

    $scope.defaultChatRooms = DataLayerChat.getChatRooms();
    
    $scope.newMessages = function(chatRoomId)
    {
        return Math.floor((Math.random() * 10) + 1);
    };
});


//**NOT IN USE** - This controller supports the list of contacts.
// current design is based on getting the list of users from the phone's contact.
// This will need to get the list of users in NAVETA (online - offline)
navETAApp.controller('chatContactsCtrl', function( 
                     $scope, 
                      $cordovaContacts,
                      $ionicPlatform
                     )
                     {


    var opts = {
        multiple: true,
        fields:  [ 'displayName', 'name' ]
    };

    if (ionic.Platform.isAndroid()) {
        opts.hasPhoneNumber = true;
    } 

    $ionicPlatform.ready(function(){
        try{
            //commonServices.toast("Loading contact list.");
            $cordovaContacts.find(opts)
                .then(function(allContacts){
                $scope.contacts = allContacts;
                console.log(JSON.stringify(allContacts));
            });
        }
        catch (e)
        {
            console.error("Error retrieving Cotacts from device - Try/Catch", e);
        }

    }, function(error)
                         {
        console.error("Error retrieving Cotacts from device - Promise/Error", error);
    }
                        );

    $scope.getAllContacts = function() {
        $cordovaContacts.find().then(function(allContacts) { 

            $scope.contacts = allContacts;
        }
                                    )};

});