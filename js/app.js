var app = angular.module('dbVizApp', ['ngRoute', 'ui.bootstrap']);

app.config(function($routeProvider, $compileProvider) {

    // Allows image download link (data).
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);

    $routeProvider
      //   .when('/', {
      //      templateUrl: '/views/partials/main.html'
      //  })
        .when('/schema/:id', {
            templateUrl: '/views/partials/schema.html',
            controller: "schemaController" 
        })
        .when('/', {
            templateUrl: '/views/partials/material-main.html'
        });
});