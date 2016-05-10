//angular.module('starter.controllers', [])

app.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
    console.log('Controller - AppCtrl - loaded');
})

app.controller('TODOListsCtrl', function( $scope, 
                                           $ionicModal, 
                                           $timeout, 
                                           DataLayerTODOList,
                                           $ionicFilterBar,
                                           $location
                                          ) 
               {
    $scope.Lists = DataLayerTODOList.getTODOLists();

    $scope.list = {};

    $scope.GetNumberOfItems = function(item)
    {
        var returnValue = 0;

        if (item.items)
        {
            returnValue = Object.keys(item.items).length;
        }
        return returnValue;
    };
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

    $scope.go = function ( path ) {
        $location.path( path );
    };
})

app.controller('TODOListCtrl', function($scope, 
                                         $stateParams, 
                                         $ionicModal, 
                                         $timeout, 
                                         DataLayerTODOList,
                                         $ionicFilterBar) {

    console.log('Controller - TODOListCtrl - loaded');

    $scope.item = {};
    $scope.listName = '';
    $scope.data = 
        {
        showDelete: false,
        showReorder: false
    };

    // 
    $scope.items = DataLayerTODOList.getTODOListItems($stateParams.playlistId);

    $scope.items.$loaded()
        .then(function(data) {
        console.log('loaded'); // true
        // $scope.items.$bindTo($scope, 'items');
    })
        .catch(function(error) {
        console.error("Error:", error);
    });

    $scope.TodoList = DataLayerTODOList.getTODOList($stateParams.playlistId);
    $scope.TodoList.$loaded()
        .then(function(data){
        console.log(data);
        $scope.listName = data.find(x=> x.$id === 'title').$value;
    })
        .catch(function(error){
        console.error("Error:", error)}
              );



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
    $scope.OpenEditor = function(item) {
        if(!item)
        {
            $scope.item = {$priority: $scope.items.length};
        }
        else
        {
            $scope.item = item;

        }
        $scope.modal.show();
    };
    // 
    $scope.SaveItem = function() {
        console.log('Saving Data', $scope.item);
        if($scope.item.$id)
        {
            $scope.items.$save($scope.item);
        }
        else{
            DataLayerTODOList.saveTodoListItem({title: $scope.item.title, 
                                                qty:   $scope.item.qty,
                                                unit:  $scope.item.unit,
                                                checked : false,
                                                $priority: $scope.item.$priority});
        }
        $timeout(function() {
            $scope.closeEditor();
        }, 200);
    };

    $scope.calculateTotal = function()
    {
        return $scope.item.qty * $scope.item.unitPrice;
    }

    $scope.moveItem = function(item, fromIndex, toIndex) {

        $scope.items[fromIndex].$priority = toIndex;
        $scope.items[toIndex].$priority = fromIndex;
        $scope.items.$save($scope.items[fromIndex]);
        $scope.items.$save($scope.items[toIndex]);
    };

    $scope.onItemDelete = function(item) {
        //$scope.items.splice($scope.items.indexOf(item), 1);
        $scope.items.$remove(item);
    };

    $scope.updateChecked = function(item)
    {
        $scope.items.$save(item);
    };

    $scope.showFilterBar = function () {
        filterBarInstance = $ionicFilterBar.show({
            items: $scope.items,
            update: function (filteredItems) {
                $scope.items = filteredItems;
            },
            filterProperties: 'title'
        });
    };

    $scope.showCancelButton = function ()
    {
        return ($scope.data.showReorder || $scope.data.showDelete);
    };

    $scope.editList = function()
    {
        $scope.data.showDelete = !$scope.data.showDelete; 
        $scope.data.showReorder = !$scope.data.showReorder;
    };

    $scope.go = function ( path ) {
        $location.path( path );
    };

    $scope.isListEmpty = function()
    {
        //$scope.items

        console.log('isListEmpty: ' + this.items.length + ' ' + (this.items.length == 0));
        return (this.items.length == 0);
    };
});
