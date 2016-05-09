app.factory('DataLayerTODOList',  function(commonServices, $firebase, $firebaseArray, 
                   $firebaseObject)
                  {


    var todoListsRef = new Firebase(commonServices.getFirebaseBasedUrl() + 'TODOLists');// "naveta.firebaseIO.com/events");
    var todoListsFire = $firebaseArray(todoListsRef);
    
    var todoListRef = null;
    var todoListFire = null;
    
    var todoListItemsRef = null;
    var todoListItemsFire = null;

    var todoLists = {};
    var todoList = {};
    var todoListItems = {};
    var todoListItem =
        {
            'id': '',
            'createdOn': '',
            'title': '',
            'description': '',
            'notes': '',
            'isDeleted': ''
        };
    return {
        todoLists: todoLists,
        todoListItems: todoListItems,
        todoListItem: todoListItem,
        
        getTODOLists: function(userId)
        {
            todoLists = $firebaseArray(todoListsRef);
           //return list of TODOLists that this user has access to
            return todoLists;
        },
        getTODOListItems: function(todoListId){
             todoListItemsRef = new Firebase(commonServices.getFirebaseBasedUrl() + 'TODOLists' + '/' + todoListId +'/items/');// "naveta.firebaseIO.com/events");
             todoListItemsFire = $firebaseArray(todoListItemsRef);
            
            todoListItems = $firebaseObject(todoListItemsRef/*todoListsRef.child(todoListId).child('items')*/);
            return todoListItemsFire;
        },
        getTODOList: function(todoListId){
             todoListRef = new Firebase(commonServices.getFirebaseBasedUrl() + 'TODOLists' + '/' + todoListId +'/');// "naveta.firebaseIO.com/events");
             todoListFire = $firebaseArray(todoListRef);
            
            todoList = $firebaseObject(todoListRef/*todoListsRef.child(todoListId).child('items')*/);
            return todoListFire;
        },
        
        saveTodoList: function(data){

            todoListsFire.$add(
                {
                   // 'id' : commonServices.objectToValidJsonString(data.id),
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
        
        saveTodoListItem: function(data){
            todoListItemsFire.$add(
                {
                    'createdOn' : commonServices.objectToValidJsonString(Firebase.ServerValue.TIMESTAMP),
                    'title' : commonServices.objectToValidJsonString(data.title),
                    'description' : commonServices.objectToValidJsonString(data.description),
                    'notes' : commonServices.objectToValidJsonString(data.notes),
                    'isDeleted' : commonServices.objectToValidJsonString(data.isDeleted),
                    'checked' :commonServices.objectToValidJsonString(data.checked),
                    'qty' :commonServices.objectToValidJsonString(data.qty),
                    'unit' :commonServices.objectToValidJsonString(data.unit),
                    '$priority' :commonServices.objectToValidJsonString(data.$priority)
                }
            ).then(function(ref) {
                console.log("Record saved. - Id: " + ref.key()); 

            }, function(error) {
                console.log("Error:", error);
            });
            return true;

        }
        
       
    }
});
