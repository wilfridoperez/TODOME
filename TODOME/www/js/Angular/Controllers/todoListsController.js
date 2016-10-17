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

    //-> Subscribe to add data

    $scope.inputPlaceHolder = "What is your new challenge?";
    $scope.List = {};
    $scope.NumberOfOpenedLists = "";
    $scope.Lists.$loaded()
        .then(function(data) {
        $scope.NumberOfOpenedLists = $scope.GetNumberOfLists(data);
        console.log('Lists loaded'); 
        
    })
        .catch(function(error) {
        console.error("Error:", error);
    });
    
    $scope.data = 
        {
        showDelete: false,
        showReorder: false,
        showCompletedLists : false
    };

    $scope.toast = function (caption)
    {
        commonServices.toast(caption);
    };
 
    $scope.showCompletedLists = function(listStatus)
    {
        return ($scope.data.showCompletedLists && listStatus == 'Completed'
                ||
                listStatus != 'Completed'
                );
    }
    
    $scope.displayGroupName = function(dueDateGroup)
    {
        /*if (!dueDateGroup || dueDateGroup == 'undefined') 
        {
            return 'Today';
        }*/
        return dueDateGroup[0].dueDateGroup; //dueDateGroup;

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
    $scope.GetNumberOfLists = function(List)
    {
        var activeTasks = 0;
        var closedTasks = 0;
        var returnValue = 0;

        if (List)
        {
            returnValue = List.length;
        }
        
        if (!returnValue || returnValue == 0)
        {
            returnValue = "No Open Lists";
        }
        else
        {
            returnValue = returnValue + " available Lists";
        }
        return returnValue;
    };
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
            
            $scope.List.dueDate = commonServices.validFirebaseDatetime( $scope.List.dueDate);
            $scope.List.reminderDate = commonServices.validFirebaseDatetime($scope.List.reminderDate);
            $scope.Lists.$save($scope.List);
        }
        else{
            DataLayerTODOList.saveTodoList({    
                                            title: $scope.List.title, 
                                            description:   $scope.List.description,
                                            retailer:  $scope.List.retailer,
                                            $priority: $scope.List.$priority,
                                            status: $scope.List.status,
                                            dueDate : commonServices.validFirebaseDatetime( $scope.List.dueDate),
                                            dueTime : commonServices.validFirebaseDatetime(  $scope.List.dueTime),
                                            reminderDate : commonServices.validFirebaseDatetime(  $scope.List.reminderDate),
                                            reminderTime : commonServices.validFirebaseDatetime( $scope.List.reminderTime)
                                           });
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
