app.controller('schemaController', ['$scope', '$http', '$routeParams', '$location', '$timeout', '$modal', 'goService', 'goTemplates', 'projectService', 'projectApiService',
    function($scope, $http, $routeParams, $location, $timeout, $modal, goService, tp, projectService, projectApiService) {

        $scope.projectList = projectService.getProjects();
        $scope.currentProject = projectService.getCurrentProject();

        $scope.hiddenEntities = [];

        $scope.LAYOUTS = tp().LAYOUTS;

        $scope.currentLayout = tp().LAYOUTS.DIGRAPH;



        $scope.updateCurrentProject = function(project) {
            $scope.currentProject = project;
            projectService.setCurrentProject(project);
        };

        $scope.updateProjectList = function(projects) {
            $scope.projectList = projects;
            projectService.setProjects(projects);
        };

        $scope.updateLayout = function(layout) {
            goService.updateLayout(layout);
        };

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
                    alert("Error - " + error.message);
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
        };

        $scope.changeProject = function(id) {
            let project = projectService.getProjectById(id);
            if (project) {
                projectService.setCurrentProject(project);
                $location.path('/schema/' + id);
            }
        };

        $scope.toggleAttributeVisibility = function() {

            goService.toggleAllAttributeVisibility();

        };

        $scope.generateImagePreviews = function() {
            $scope.diagramCurrentView = goService.getDiagramCurrentView();
            $scope.diagramFullView = goService.getFullDiagram();
        };

        $scope.openImageModal = function() {
            $modal.open({
                templateUrl: '/views/partials/imagePreviewModal.html',
                controller: ModalInstanceCtrl,
                scope: $scope
            });
        };

        var ModalInstanceCtrl = function($scope) {
            $scope.cancelImageRequest = function() {
                $modalInstance.dismiss("cancel");
            };
        };

        goService.subscribe("hide-entity", $scope, (name, entityName) => {
            $scope.hiddenEntities.push(entityName);
            $scope.$apply();
        });

        goService.subscribe("show-entity", $scope, (name, entityName) => {
            $scope.showEntity(entityName);
        });

        $scope.showEntity = function(entityName) {
            goService.showEntity(entityName);
            $scope.hiddenEntities.forEach((val, index, arr) => {
                if (val == entityName) {
                    $timeout(function() {
                        arr.splice(index, 1);
                    }, 0);
                }
            });
        };

        $scope.layoutGrid;
        $scope.layoutForced;
        $scope.layoutCircular;
        $scope.layoutLayered;

        $scope.toggleLayoutButton = function(toggle) {
            $scope.layoutGrid = false;
            $scope.layoutForced = false;
            $scope.layoutCircular = false;
            $scope.layoutLayered = false;

            if (toggle == 1) {
                $scope.layoutGrid = true;
            } else if (toggle == 2) {
                $scope.layoutForced = true;
            } else if (toggle == 3) {
                $scope.layoutCircular = true;
            } else {
                $scope.layoutLayered = true;
            }
        };

    }
]);
