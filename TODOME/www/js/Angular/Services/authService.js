app.factory("Auth", function( $firebaseAuth) {
    var usersRef = new Firebase("https//todome.firebaseio.com/users");
    return $firebaseAuth(usersRef);

})