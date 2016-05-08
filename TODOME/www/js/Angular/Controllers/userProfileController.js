
app.controller('userProfileCtrl', function( $scope,
                                                  $ionicHistory,
                                                   $ionicSideMenuDelegate,
                                                  Auth,
                                                  DataLayerUser)
                     {
    DataLayerUser.getUser().$loaded().then(function(data) {
        $scope.user = data;
        console.log("UserProfile Loaded:", data);
    })
        .catch(function(error) {
        console.log("Error:", error);
    });;

    $scope.goBack = function()
    {
        $ionicHistory.goBack();
    }
    
    $scope.unAuthorizeClient = function()
    {
        localStorage.setItem('authenticated', '');
        Auth.$unauth();
    }

    $scope.IsAuthenticated = function()
    {
        if (Auth.$getAuth() == null)
            return false;
        else
            return true;
    }

    $scope.getProfileName = function()
    {
        if (Auth.$getAuth() != null)
        {
            var provider = Auth.$getAuth().provider;
            return Auth.$getAuth()[provider].displayName;
        }
        else
        {
            return null;
        }
    }

    $scope.getProfilePicture = function()
    {
        if (Auth.$getAuth() != null)
        {
            var provider = Auth.$getAuth().provider;
            return Auth.$getAuth()[provider].profileImageURL;
        }
        else
        {
            return null;
        }
    }

    $scope.saveUserProfile = function()
    {
        DataLayerUser.save($scope.user);
        $ionicSideMenuDelegate.toggleLeft();
    }
});