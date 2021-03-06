// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('todome', ['ionic','ngCordova', 
    'firebase', 'jett.ionic.filter.bar','angular.filter'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
    console.log('router load - begin');
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
    .state('app.TODOLists', {
      url: '/todolists',
      views: {
        'menuContent': {
          templateUrl: 'templates/TODOLists.html',
          controller: 'TODOListsCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/TODOListTasks/:todoListId',
    views: {
      'menuContent': {
        templateUrl: 'templates/TODOListTasks.html',
        controller: 'TODOListCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
    
  $urlRouterProvider.otherwise('/app/todolists');
    console.log('router load - end');
});
