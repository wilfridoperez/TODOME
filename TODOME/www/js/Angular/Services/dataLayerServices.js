app.factory('DataLayerTODOList',  function(commonServices, $firebase, $firebaseArray, 
                                            $firebaseObject)
            {


    var todoListsRef = new Firebase(commonServices.getFirebaseBasedUrl() + 'TODOLists').orderByChild('dueDateGroupOrder');// "naveta.firebaseIO.com/events");
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

    function isThisWeek(dueDate)
    {
        dueDate = new Date(dueDate);
        var curr = new Date();
        var now = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate());

        day = now.getDay();
        firstday = new Date(now.getTime() - 60*60*24* day*1000); // will return firstday (i.e. Sunday) of the week
        lastday = new Date(now.getTime() + 60 * 60 *24 * 6 * 1000); // adding (60*60*6*24*1000) means adding six days to the firstday which results in lastday (Saturday) of the week

        var returnValue =  (dueDate.getTime() >= firstday && dueDate.getTime() <= lastday);
        return returnValue;

    }

    function isThisMonth(dueDate)
    {
        dueDate = new Date(dueDate);
        var curr = new Date();
        var now = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate());

        day = now.getDay();
        firstday = new Date(now.getTime() - 60*60*24* day*1000); // will return firstday (i.e. Sunday) of the week
        lastday = new Date(now.getTime() + 60 * 60 *24 * 6 * 1000); // adding (60*60*6*24*1000) means adding six days to the firstday which results in lastday (Saturday) of the week

        var returnValue =  now.getMonth() == dueDate.getMonth();

        return returnValue;
    }

    function isToday(dueDate)
    {
        dueDate = new Date(dueDate);
        var curr = new Date();
        var today = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate());
        var dueDateTemp = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        var returnValue =  today.getTime() == dueDateTemp.getTime();

        return returnValue;
    }

    function isPastDue(dueDate)
    {
        dueDate = new Date(dueDate);
        var curr = new Date();
        var today = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate());
        var dueDateTemp = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        var returnValue =  today.getTime() > dueDateTemp.getTime();

        return returnValue;
    }

    function isTomorrow(dueDate)
    {
        dueDate = new Date(dueDate);
        var curr = new Date();
        var today = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate());
        var dueDateTemp = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

        var days = 1;
        var newDate = new Date(today.getTime() + days * 24*60*60*1000);

        var returnValue =  newDate.getTime() == dueDateTemp.getTime();

        return returnValue;
    }

    return {
        todoLists: todoLists,
        todoListItems: todoListItems,
        todoListItem: todoListItem,

        getTODOLists: function(userId)
        {
            todoLists = $firebaseArray(todoListsRef);
            //return list of TODOLists that this user has access to
            todoLists.$loaded()
                .then(function(data) {

                for (i=0; i< data.length; i++)
                {
                    var list = data[i];
                    if (!list.dueDate )
                    {
                        list.dueDateGroup = "No Due Date";
                        list.dueDateGroupOrder = 1000;
                    }
                    else 
                    {
                        list.dueDate = new Date(list.dueDate);
                        if (isPastDue(list.dueDate))
                        {
                            list.dueDateGroup = "Past Due";
                            list.dueDateGroupOrder = 2000;
                        }
                        else if (isToday(list.dueDate))
                        {
                            list.dueDateGroup = "Today";
                            list.dueDateGroupOrder = 3000;
                        }
                        else if (isTomorrow(list.dueDate))
                        {
                            list.dueDateGroup = 'Tomorrow';
                            list.dueDateGroupOrder = 4000;
                        } 
                        else if (isThisWeek(list.dueDate) )
                        {
                            list.dueDateGroup = "This week";
                            list.dueDateGroupOrder = 5000;
                        }
                        else if (isThisMonth(list.dueDate))
                        {
                            list.dueDateGroup = "This Month";
                            list.dueDateGroupOrder = 6000;
                        }   
                        else
                        {
                            list.dueDateGroup = 'Future';
                            list.dueDateGroupOrder = 7000;
                        }

                    }
                    if (list.reminderDate)
                    {
                        list.reminderDate = new Date(list.reminderDate);
                    }
                    if(list.status == "Completed")
                    {
                        list.dueDateGroup = "Completed";
                        list.dueDateGroupOrder = 8000;
                    }
                    console.log(list.dueDateGroup);
                }
                console.log('Data Layer - loaded'); 
                todoLists = todoLists.reverse();
            })
            return todoLists;
        },
        getTODOListItems: function(todoListId){
            todoListItemsRef = new Firebase(commonServices.getFirebaseBasedUrl() + 
                                            'TODOLists' + '/' + todoListId +'/items/');
            //.orderByPriority();
            todoListItemsFire = $firebaseArray(todoListItemsRef);

            todoListItems = $firebaseObject(todoListItemsRef);
            return todoListItemsFire;
        },
        getTODOList: function(todoListId){
            todoListRef = new Firebase(commonServices.getFirebaseBasedUrl() + 'TODOLists' + '/' + todoListId +'/');
            todoListFire = $firebaseArray(todoListRef);

            todoList = todoListFire;
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
                    'isDeleted' : commonServices.objectToValidJsonString(data.isDeleted),
                    'status' : commonServices.objectToValidJsonString(data.status),
                    'dueDate' : commonServices.objectToValidJsonString(data.dueDate),
                    'dueTime' : commonServices.objectToValidJsonString(data.dueTime),
                    'reminderDate' : commonServices.objectToValidJsonString(data.reminderDate),
                    'reminderTime' : commonServices.objectToValidJsonString(data.reminderTime)
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
                    'category' :commonServices.objectToValidJsonString(data.category),
                    'priority' :commonServices.objectToValidJsonString(data.priority),
                    'unitprice' :commonServices.objectToValidJsonString(data.unitprice),
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


app.factory('DataLayerLists',  function(commonServices, $firebase, $firebaseArray, 
                                         $firebaseObject)
            {
    // Firebase.enableLogging(true);
    var lists = [];
    return {
        getList: function(listName)
        {
            var list = $firebaseArray(
                new Firebase(commonServices.getFirebaseBasedUrl() + 
                             'Lists/' +
                             listName).orderByChild('Title'));
            return list;
        }
    }
});
