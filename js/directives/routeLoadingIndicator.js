(function(app) {

    var routeLoadingIndicator = function($rootScope) {
        return {
            restrict: 'E',
            templateUrl: '/views/partials/loader.html',
            link: function(scope, elem, attrs) {
                scope.isRouteLoading = false;

                $rootScope.$on('$routeChangeStart', function() {
                    scope.isRouteLoading = true;
                });

                $rootScope.$on('$routeChangeSuccess', function() {
                    scope.isRouteLoading = false;
                });
            }
        };
    };
    routeLoadingIndicator.$inject = ['$rootScope'];

    app.directive('routeLoadingIndicator', routeLoadingIndicator);

}(angular.module('dbVizApp')));
