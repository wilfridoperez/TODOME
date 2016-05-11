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
