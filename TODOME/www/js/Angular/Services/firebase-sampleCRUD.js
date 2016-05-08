var myApp = angular.module('DemoApp', ['firebase']);

myApp.constant("FIREBASE_URL", "https://codepen-public.firebaseio.com/firebase1demo/codepen/" )


function DemoCtrl($scope, $firebase, FIREBASE_URL) {

    // Get Stored TODOs
    var todosRef = new Firebase(FIREBASE_URL);
    $scope.todos = $firebase(todosRef);


    // Update the "completed" status
    $scope.update   = function (id) {

        // Get the Firebase reference of the item
        var itemRef = new  Firebase(FIREBASE_URL + id);

        // Firebase : Update the item
        $firebase(itemRef).$set({
            /*JSON Object*/
            id: item.id,
            name : item.name,
            completed: !item.completed
        });

    }

    // Remove a Todo
    $scope.delete   = function (id) {

       // Avoid wrong removing
       if (id == undefined)return;

       // Firebase: Remove item from the list
       $scope.todos.$remove(id);

    }



    // Add new TODO
    $scope.add  = function () {

        // Create a unique ID
        var timestamp = new Date().valueOf()

        // Get the Firebase reference of the item
        var itemRef = new Firebase(FIREBASE_URL + timestamp);

        $firebase(itemRef).$set({
            //Json Object
            id: timestamp,
            name : $scope.todoName,
            completed: false
        });
    }
}