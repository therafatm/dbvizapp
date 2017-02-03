var app = angular.module('dbVizApp', ['ngRoute','ui.bootstrap']);

app.config(function($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: '/views/partials/main.html'
        })
        .when('/schema/:id', {
            templateUrl: '/views/partials/schema.html'
        })
        .when('/material-main', {
            templateUrl: '/views/partials/material-main.html'
        });
});
