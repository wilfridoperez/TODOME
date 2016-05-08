app.controller('menuCtrl', function( $scope,
                                            Auth)
                     {

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
});