navETAApp.factory('DataLayer$ENTITY',  function( 
                                               $firebaseArray, 
                                               $firebaseObject,
                                               commonServices)
                  {

    var $ENTITYRef = new Firebase(commonServices.getFirebaseNavETABasedUrl() + 'users');//"https://naveta.firebaseIO.com/users");
   
   
    function Get$ENTITY($ENTITYId)
    {
        $ENTITY = $firebaseObject($ENTITYRef.child($ENTITYId));
        return $ENTITY;
    }

    var $ENTITY =
        {
            '{field1}': '',
            ...
            {fieldn}: '',
           
        };
    return {

        $ENTITY: $ENTITY,
        get$ENTITY: function(){
            return Get$ENTITY($ENTITYId);
        },
        save: function(data){

            $ENTITY.{field1} = '';
            $ENTITY.{fieldn} = '';
            $ENTITY.lastUpdate = Firebase.ServerValue.TIMESTAMP

            $ENTITY.$save().then(function(ref) {
                console.log("Record saved. - Id: " + ref.key()); 
            }, function(error) {
                console.log("Error:", error);
            });
            return true;
        },
            delete: function ($ENTITYId)
            {
            $ENTITY.delete($ENTITYId);
            }
    }

});