app.controller('TODOListCtrl', function($scope, 
                                         $stateParams, 
                                         $ionicModal, 
                                         $timeout, 
                                         DataLayerTODOList,
                                         $ionicFilterBar,
                                         DataLayerLists,
                                         $ionicScrollDelegate) {

    console.log('Controller - TODOListCtrl - loaded');
 
    $scope.item = {};
    $scope.lists = {};
    $scope.Categories = {};
    $scope.Units = {};
    $scope.inputPlaceHolder = "Add your new task";
    $scope.listName = '';
    $scope.data = 
        {
        showDelete: false,
        showReorder: false
    };

    // 
    $scope.items = DataLayerTODOList.getTODOListItems($stateParams.todoListId);

    $scope.Categories = DataLayerLists.getList("Categories");
    $scope.Units = DataLayerLists.getList("Units");

    $scope.items.$loaded()
        .then(function(data) {
        console.log('loaded'); 
    })
        .catch(function(error) {
        console.error("Error:", error);
    });

    $scope.TodoList = DataLayerTODOList.getTODOList($stateParams.todoListId);

    $scope.TodoList.$loaded()
        .then(function(data){
        console.log(data);
        $scope.listName = data.find(findElement).$value;
    })
        .catch(function(error){
        console.error("Error:", error)}
              );

    function findElement(obj)
    {
        return obj.$id === 'title';
    }
    
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
                                                locationInStore: $scope.item.locationInStore,
                                                checked : false,
                                                retailer: $scope.item.retailer,
                                                notes: $scope.item.notes,
                                                category: $scope.item.category,
                                                $priority: $scope.item.length});
        }
        $timeout(function() {
            $scope.closeEditor();
        }, 200);
    };

    $scope.addListItem = function(title)
    {   //\su\d*\s|\su\d*|u\d*
        //-> priority  -> p#
        var priority  = getValueRegExp(/\sp\d\s|\sp\d/g, title, 1);
        //-> units     -> u#
        var units     = getValueRegExp(/\su\d+\s|\su\d+/g, title, 1);
        //-> quantity  -> q#
        var quantity  = getValueRegExp(/\sq\d+\s|\sq\d+/g, title, 1);
        //-> unitPrice -> up#
        var unitPrice = getValueRegExp(/\sup\d+\s|\sup\d+/g, title, 2);
        //-> category  -> c#
        var category  = getValueRegExp(/\sc\d+\s|\sc\d+/g, title, 1);

        //Clean title
        title = title.replace(/\sp\d\s|\sp\d/g, " ");
        title = title.replace(/\su\d+\s|\su\d+/g, " ");
        title = title.replace(/\sq\d+\s|\sq\d+/g, " ");
        title = title.replace(/\sup\d+\s|\sup\d+/g, " ");
        title = title.replace(/\sc\d+\s|\sc\d+/g, " ");
        title = title.trim();
        //priority -> high / medium / low / unimportant
        if(priority)
        {
            priority = parseInt(priority);
            if (priority <0 && priority >3)
            {
                priority = null;
            }
        }

        if(quantity)
        {
            quantity = parseInt(quantity);
            if (quantity < 0 )
            {
                quantity = null;
            }
        }


        if(unitPrice)
        {
            unitPrice = parseInt(unitPrice);
            if (unitPrice < 0)
            {
                unitPrice = null;
            }
        }

        if(units)
        {
            units = parseInt(units);
            if (units < 0 && units >= $scope.Units.lenght)
            {
                units = null;
            }
            else
            {
                units =  $scope.Units[parseInt(units)].Title;
            }
        }

        DataLayerTODOList.saveTodoListItem({title: title, 
                                            qty:   quantity,
                                            unit: units,
                                            unitprice: unitPrice,
                                            checked : false,
                                            category: category,
                                            priority: priority,
                                            $priority: $scope.item.length
                                           });
        this.smartInputTitle = '';
        $ionicScrollDelegate.scrollBottom(true);
    };

    $scope.calculateTotal = function()
    {
        return $scope.item.qty * $scope.item.unitprice;
    }

    $scope.moveItem = function(item, fromIndex, toIndex) {

        $scope.items[fromIndex].$priority = toIndex;
        $scope.items[toIndex].$priority = fromIndex;
        $scope.items.$save($scope.items[fromIndex]);
        $scope.items.$save($scope.items[toIndex]);
    };

    $scope.onItemDelete = function(item) {
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
        //console.log('isListEmpty: ' + this.items.length + ' ' + (this.items.length == 0));
        if ($scope && $scope.items)
            return ($scope.items.length == 0);
        else 
            return true;
    };

    $scope.completedTasks = function()
    {
        if ($scope && $scope.items && $scope.items.length > 0)
        {
            var itemsCount = $scope.items.length;
            var itemsCompletedCount = 0;
            for (i = 0; i < itemsCount; i++)
            {
                if ($scope.items[i].checked)
                {
                    itemsCompletedCount++;
                }
            }
            return itemsCompletedCount;
        }
        else
            return 0;
    }

    $scope.totalTasks = function()
    {
        if ($scope && $scope.items && $scope.items.length > 0)
        {
            var itemsCount = $scope.items.length;
            return itemsCount;
        }
        else
            return 0;
    }
    

    $scope.activeTasks = function()
    {
        if ($scope && $scope.items && $scope.items.length > 0)
        {
            var itemsCount = $scope.items.length;
            var itemsActivedCount = 0;
            for (i = 0; i < itemsCount; i++)
            {
                if (!$scope.items[i].checked)
                {
                    itemsActivedCount++;
                }
            }
            return itemsActivedCount;
        }
        else
            return 0;
    }

    function execRegExp(re, str)
    {
        var m;

        while ((m = re.exec(str)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            return m;
        }
    };

    function getValueRegExp (regExp, str, pre_fix_count)
    {
        var valueExtracted  = execRegExp(regExp, str);
        if (valueExtracted)
        {
            return valueExtracted.toString().trim().substring(pre_fix_count);
        }
    }

});
