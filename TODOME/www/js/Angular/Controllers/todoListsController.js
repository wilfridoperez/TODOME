app.controller('TODOListsCtrl', function( $scope, 
                                           $ionicModal, 
                                           $timeout, 
                                           DataLayerTODOList,
                                           $ionicFilterBar,
                                           $location,
                                           $ionicScrollDelegate,
                                           commonServices
                                          ) 
               {
    $scope.Lists = DataLayerTODOList.getTODOLists();
    $scope.inputPlaceHolder = "What is your new challenge?";
    $scope.List = {};
    $scope.data = 
        {
        showDelete: false,
        showReorder: false
    };

    $scope.toast = function (caption)
    {
        commonServices.toast(caption);
    };
    
    $scope.GetNumberOfItems = function(List)
    {
        var activeTasks = 0;
        var closedTasks = 0;
        var returnValue = 0;

        if (List.items)
        {
            returnValue = Object.keys(List.items).length;
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
   // $scope.OpenEditor = function() {
    //    $scope.modal.show();
    //};
    
    $scope.OpenEditor = function(item) {
        if(!item)
        {
            $scope.List = {$priority: $scope.Lists.length};
        }
        else
        {
            $scope.List = item;

        }
        $scope.modal.show();
    };
   
    $scope.go = function ( path ) {
        $location.path( path );
    };
    
    /**************/
    // 
    $scope.SaveList = function() {
        console.log('Saving Data', $scope.List);
        if($scope.List.$id)
        {
            $scope.Lists.$save($scope.List);
        }
        else{
            DataLayerTODOList.saveTodoList({    title: $scope.List.title, 
                                                description:   $scope.List.description,
                                                retailer:  $scope.List.retailer,
                                                $priority: $scope.List.$priority});
        }
        $timeout(function() {
            $scope.closeEditor();
        }, 200);
    };

    $scope.addList = function(title)
    {   
        DataLayerTODOList.saveTodoList({title: title, 
                                            description:   '',
                                            retailer: ''
                                            //$priority: $scope.List.$priority
                                           });
        this.smartInputTitle = '';
        $ionicScrollDelegate.scrollBottom(true);
    };


    $scope.moveList = function(List, fromIndex, toIndex) {

        $scope.Lists[fromIndex].$priority = toIndex;
        $scope.Lists[toIndex].$priority = fromIndex;
        $scope.Lists.$save($scope.Lists[fromIndex]);
        $scope.Lists.$save($scope.Lists[toIndex]);
    };

    $scope.onListDelete = function(List) {
        $scope.Lists.$remove(List);
    };

    $scope.updateChecked = function(List)
    {
        $scope.Lists.$save(List);
    };

    $scope.showFilterBar = function () {
        filterBarInstance = $ionicFilterBar.show({
            items: $scope.Lists,
            update: function (filteredLists) {
                $scope.Lists = filteredLists;
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
})
