var app = angular.module('dbVizApp', ['ngRoute']);

app.config(function($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: '/views/partials/main.html'
        })
        .when('/schema', {
            templateUrl: '/views/partials/schema.html'
        })
        .when('/material-main', {
            templateUrl: '/views/partials/material-main.html'
        });
});
