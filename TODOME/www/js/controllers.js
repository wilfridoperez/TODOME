//angular.module('starter.controllers', [])

app.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
    console.log('Controller - AppCtrl - loaded');
})

app.controller('TODOListsCtrl', function($scope, $ionicModal, $timeout) {
    $scope.Lists = [
        { title: 'Wallmart - Saturday', id: 1 },
        { title: 'Homedepot', id: 2 },
        { title: 'Car', id: 3 },
        { title: 'TODO - Sunday', id: 4 },
    ];
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

        $scope.Lists.push( {title: $scope.list.Title});
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function() {
            $scope.closeEditor();
        }, 200);
    };
})

app.controller('TODOListCtrl', function($scope, $stateParams, $ionicModal, $timeout) {
    $scope.listName = "Walmart";
    console.log('Controller - TODOListCtrl - loaded');
    // 
    $scope.items = [
        { title: 'Chicken', id: 1 , 'checked' : false, 'Unit': 'Whole', 'Qty': 1},
        { title: 'Onion',   id: 2 , 'checked' : true,  'Unit': 'Lb', 'Qty': 1},
        { title: 'Apple',   id: 3 , 'checked' : false, 'Unit': 'Unit', 'Qty': 6},
        { title: 'Beef',    id: 4 , 'checked' : false, 'Unit': 'Lb', 'Qty':  2}
    ];


    // 
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
    $scope.OpenEditor = function() {
        $scope.modal.show();
    };
    // 
    $scope.SaveItem = function() {
        console.log('Saving Data', $scope.item);

        $scope.items.push( {title: $scope.item.Title, 
                            Qty:   $scope.item.Qty,
                            unit:  $scope.item.Unit,
                            checked : false});
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
