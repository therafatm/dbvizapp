app.controller('schemaController', ['$scope', '$http', '$timeout', '$routeParams', 'goService', 'projectService', function($scope, $http, $timeout, $routeParams, goService, projectService) {

    $scope.allProjects = projectService.getProjects();
    $scope.currentProject = projectService.getCurrentProject();
    $scope.schema = {};

    $scope.hiddenEntities = [];

    $scope.updateCurrentProject = function(project) {
        $scope.currentProject = project;
        projectService.setCurrentProject(project);
    }

    var projectId = $routeParams.id;

    $scope.gojs = goService.drawSchema;


    $scope.displayCurrentProject = function(){
        // Get schema information from database.
        $http.get('/api/schema/', {params: $scope.currentProject})
            .success((data) => {
                $scope.schema = data;
                // Hacky
                $scope.gojs(data);
            })
            .error((error) => {
                alert("Error - " + error);
            });
    };

    $scope.init = function() {
        if ($scope.currentProject) {
            $scope.displayCurrentProject();
        } else {
            // maybe linked here, try using project id.
            var project = projectService.getProjectById(projectId);
            if (project) {
                $scope.updateCurrentProject(project);
                $scope.displayCurrentProject();
            } else {
                alert("No such project!");
            }
        }
    }

    $scope.changeProject = function(id) {
        let project = projectService.getProjectById(id);
        if (project) {
            $scope.updateCurrentProject(project);
            $scope.displayCurrentProject();
        }
    }

    $scope.toggleAttributeVisibility = function() {

        goService.toggleAllAttributeVisibility();

    }

    goService.subscribe("hide-entity", $scope, (name,entityName) => {
        $scope.hiddenEntities.push(entityName);
        $scope.$apply();
    })

    goService.subscribe("show-entity", $scope, (name,entityName) => {
        $scope.showEntity(entityName);
    })

    $scope.showEntity = function(entityName) {
        goService.showEntity(entityName);
        $scope.hiddenEntities.forEach( (val, index, arr) => {
            if( val == entityName){
                $timeout(function() {
                    arr.splice(index,1);
                }, 0);
            }
        })
    }


}]);