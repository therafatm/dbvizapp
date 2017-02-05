app.controller('schemaController', ['$scope', '$http', '$routeParams', 'goService', 'projectService', function($scope, $http, $routeParams, goService, projectService) {

    $scope.allProjects = projectService.getProjects();
    $scope.currentProject = projectService.getCurrentProject();
    $scope.schema = {};

    $scope.hiddenEntities = ['aksjdhaskjd'];

    $scope.updateCurrentProject = function(project) {
        $scope.currentProject = project;
        projectService.setCurrentProject(project);
    }

    var projectId = $routeParams.id;

    $scope.gojs = goService.drawSchema;

    goService.subscribe("hide-entity", $scope, (name,entityName) => {
        $scope.hiddenEntities.push(entityName);
        $scope.$apply();
    })

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

        var diagram = goService.diagram;
        if (diagram === null) return;
        if (diagram.isReadOnly) return;

        diagram.startTransaction("Collapse/Expand all panels");

        var isExpanded = false;
        diagram.nodes.each( (node) => {
            var list = node.findObject("ATTRIBUTES");
            if( list !== null && list.visible == true) isExpanded = true;
        })

        if( isExpanded ){
            diagram.nodes.each( (node) => {
                var list = node.findObject("ATTRIBUTES");
                if( list !== null) list.visible = false;
            })
        } else {
            diagram.nodes.each( (node) => {
                var list = node.findObject("ATTRIBUTES");
                if( list !== null) list.visible = true;
            })
        }

        diagram.commitTransaction("Collapse/Expand all panels");
    }


}]);