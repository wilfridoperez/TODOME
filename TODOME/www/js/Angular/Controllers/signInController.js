app.controller('SignInCtrl', function( $rootScope,
                                              $scope,
                                              $firebaseAuth,
                                              $location,
                                              DataLayerUser,
                                              Auth,
                                              commonServices)
                     {

    function oAuth2LoginSocialNetwork(socialNetwork)
    {
        Auth.$authWithOAuthRedirect(socialNetwork).then(function(authData) {
            // User successfully logged in
            console.info(authData);
        }).catch(function(error) {
            console.error(error);
            if (error.code === "TRANSPORT_UNAVAILABLE") {
                Auth.$authWithOAuthPopup(socialNetwork).then(function(authData) {
                    // User successfully logged in. We can log to the console
                    // since we’re using a popup here
                    console.info(authData);
                });

            } else {
                // Another error occurred
                console.error(error);
            }
        });
    }


    $scope.loginFacebook = function() 
    {
        oAuth2LoginSocialNetwork('facebook');
    };

    $scope.loginTwitter = function() 
    {
        oAuth2LoginSocialNetwork("twitter");
    };

    $scope.loginGooglePlus = function() 
    {
        oAuth2LoginSocialNetwork("google");
    };

    Auth.$onAuth(function(authData) {
        if (authData === null) {
            localStorage.setItem('authenticated', false);
            console.log("Not logged in yet");
            $rootScope.authData = null;
        } else {
            localStorage.setItem('authenticated', true);
            console.log("Logged in as", authData.uid);
            //-> Update User Record in Database
            var user = DataLayerUser.getUser();
            try
            {
                if (authData.provider == "facebook")
                {
                    user.nickName = authData.facebook.displayName;
                    user.profilePictureUrl = authData.facebook.profileImageURL;
                }
                else if (authData.provider == "twitter")
                {
                    user.nickName = authData.twitter.displayName;
                    user.profilePictureUrl = authData.twitter.profileImageURL;
                } 
                else if (authData.provider == "google")
                {
                    user.nickName = authData.google.displayName;
                    user.profilePictureUrl = authData.google.profileImageURL;
                } 
            }

            catch (e)
            {
                console.error("Error storing user profile" + e);
            }

            DataLayerUser.save(user);

            commonServices.toast('Logged successfully with ' + authData.provider);
            $location.url('/map');
        }
        $rootScope.authData = authData; // This will display the user's name in our view
    });

    $scope.isOnboarding = function()
    {
        return $stateParams.onboarding;
    };

});
