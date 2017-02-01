app.directive('schemaManager', function() {
    return {
        restrict: 'E',
        scope: "=",
        link: function(scope){
        },
        templateUrl: '/views/partials/schema.html'
    };
});