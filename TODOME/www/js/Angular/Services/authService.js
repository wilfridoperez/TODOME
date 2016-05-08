app.factory("Auth", function( $firebaseAuth) {
    var usersRef = new Firebase("https//naveta.firebaseio.com/users");
    return $firebaseAuth(usersRef);

})