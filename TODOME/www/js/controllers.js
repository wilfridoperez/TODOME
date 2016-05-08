//angular.module('starter.controllers', [])

app.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
    console.log('Controller - AppCtrl - loaded');
})

app.controller('TODOListsCtrl', function( $scope, 
                                           $ionicModal, 
                                           $timeout, 
                                           DataLayerTODOList
                                          ) 
               {
    $scope.Lists = DataLayerTODOList.getTODOLists();/*[
        { title: 'Wallmart - Saturday', id: 1 },
        { title: 'Homedepot', id: 2 },
        { title: 'Car', id: 3 },
        { title: 'TODO - Sunday', id: 4 },
    ];*/
    $scope.list = {};
    console.log('Controller - TODOListsCtrl - loaded');
    // 
    $ionicModal.fromTemplateUrl('templates/TODOListAddEdit.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // 
    $scope.closeEditor = function() {
        $scope.modal.hide();
    };

    // 
    $scope.OpenEditor = function() {
        $scope.modal.show();
    };
    // 
    $scope.SaveItem = function() {
        console.log('Saving Data', $scope.item);
        DataLayerTODOList.saveTodoList({title: $scope.list.Title});
        //$scope.Lists.push( {title: $scope.list.Title});
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            $scope.closeEditor();
        }, 200);
    };
})

app.controller('TODOListCtrl', function($scope, $stateParams, $ionicModal, $timeout, DataLayerTODOList) {

    console.log('Controller - TODOListCtrl - loaded');
    // 
    $scope.items = DataLayerTODOList.getTODOListItems($stateParams.playlistId);/*[
        { title: 'Chicken', id: 1 , 'checked' : false, 'Unit': 'Whole', 'Qty': 1},
        { title: 'Onion',   id: 2 , 'checked' : true,  'Unit': 'Lb', 'Qty': 1},
        { title: 'Apple',   id: 3 , 'checked' : false, 'Unit': 'Unit', 'Qty': 6},
        { title: 'Beef',    id: 4 , 'checked' : false, 'Unit': 'Lb', 'Qty':  2}
    ];*/
    $scope.items.$loaded()
        .then(function(data) {
        console.log('loaded'); // true
        $scope.items.$bindTo($scope, 'items');
    })
        .catch(function(error) {
        console.error("Error:", error);
    });

    $scope.TodoList = DataLayerTODOList.getTODOList($stateParams.playlistId);

    $scope.TodoList.$loaded()
        .then(function(data)
              {
        console.log(data);
        $scope.listName = data.title;
    })
        .catch(function(error)
               {
    console.error("Error:", error)});

    $scope.item = {};

    // 
    $ionicModal.fromTemplateUrl('templates/ItemAddEdit.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });

    // 
    $scope.closeEditor = function() {
        $scope.modal.hide();
    };

    // 
    $scope.OpenEditor = function(itemId) {
        if(!itemId)
        {
            $scope.item = {};
        }
        else
        {
           //TODO: Find object
           
        }
        $scope.modal.show();
    };
    // 
    $scope.SaveItem = function() {
        console.log('Saving Data', $scope.item);

        DataLayerTODOList.saveTodoListItem({title: $scope.item.Title, 
                                            Qty:   $scope.item.Qty,
                                            unit:  $scope.item.Unit,
                                            checked : false});
        /*
        $scope.items.push( {title: $scope.item.Title, 
                            Qty:   $scope.item.Qty,
                            unit:  $scope.item.Unit,
                            checked : false});*/
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            $scope.closeEditor();
        }, 200);
    };

    $scope.calculateTotal = function()
    {
        return $scope.item.Qty * $scope.item.UnitPrice;
    }
});
