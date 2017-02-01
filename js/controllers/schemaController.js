app.controller('schemaController', ['$scope', '$http', 'goService', 'projectService', function($scope, $http, goService, projectService) {

    $scope.allProjects = projectService.getProjects();
    $scope.currentProject = projectService.getCurrentProject();
    $scope.schema = {};

    // Get schema information from database.
    $http.get('/schema', $scope.currentProject)
        .success((data) => {
            $scope.schema = data;
        })
        .error((error) => {
            alert("Error - " + error);
    });

    $scope.gojs = goService.drawSchema;
}]);