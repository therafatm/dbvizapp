app.controller('schemaController', ['$scope', '$http', '$routeParams', '$location', '$timeout', 'goService', 'projectService', 'projectApiService',
    function($scope, $http, $routeParams, $location, $timeout, goService, projectService, projectApiService) {

        $scope.projectList = projectService.getProjects();
        $scope.currentProject = projectService.getCurrentProject();

        $scope.hiddenEntities = [];

        $scope.updateCurrentProject = function(project) {
            $scope.currentProject = project;
            projectService.setCurrentProject(project);
        }

        $scope.updateProjectList = function(projects) {
            $scope.projectList = projects;
            projectService.setProjects(projects);
        }

        var projectId = parseInt($routeParams.id);

        // This is called by init() and when we switch projects.
        $scope.displayCurrentProject = function() {
            // Get schema information from database.
            $http.get('/api/schema/', {
                    params: $scope.currentProject
                })
                .success((schemaInfo) => {
                    $scope.schema = schemaInfo;
                    // Hacky
                    goService.drawSchema(schemaInfo);
                })
                .error((error) => {
                    alert("Error - " + error.data);
                });
        };

        // Called when we first navigate to /schema/:id
        $scope.init = function() {
            if ($scope.currentProject && $scope.currentProject.id == projectId) {
                $scope.displayCurrentProject();
            } else {
                // Maybe linked here, try using project id (from url).
                let currentProject = projectService.getProjectById(projectId);
                if (currentProject) {
                    $scope.updateCurrentProject(currentProject);
                    $scope.displayCurrentProject();
                } else {
                    // Not found, update projects.
                    projectApiService.getAllProjects()
                        .then(
                            function(projects) {
                                $scope.updateProjectList(projects);
                                var currentProject = projectService.getProjectById(projectId);
                                if (currentProject) {
                                    $scope.updateCurrentProject(currentProject);
                                    $scope.displayCurrentProject();
                                } else {
                                    alert("No such project!");
                                    $location.path('/');
                                }
                            },
                            function(error) {
                                alert(error.error);
                            }
                        );
                }
            }
        }

        $scope.changeProject = function(id) {
            let project = projectService.getProjectById(id);
            if (project) {
                projectService.setCurrentProject(project);
                $location.path('/schema/' + id)
            }
        }

        $scope.toggleAttributeVisibility = function() {

            goService.toggleAllAttributeVisibility();

        }

        $scope.getDiagramImage = function() {
            let img = goService.getImageBase64();
            // Change leading data:image/png to data:application/octet
            // window.location.href = img;
            $scope.diagramImage = img;
        }

        goService.subscribe("hide-entity", $scope, (name, entityName) => {
            $scope.hiddenEntities.push(entityName);
            $scope.$apply();
        })

        goService.subscribe("show-entity", $scope, (name, entityName) => {
            $scope.showEntity(entityName);
        })

        $scope.showEntity = function(entityName) {
            goService.showEntity(entityName);
            $scope.hiddenEntities.forEach((val, index, arr) => {
                if (val == entityName) {
                    $timeout(function() {
                        arr.splice(index, 1);
                    }, 0);
                }
            })
        }
    }
]);
