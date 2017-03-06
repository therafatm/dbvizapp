app.controller('schemaController', ['$scope', '$http', '$routeParams', '$location', '$timeout', '$modal', 'goService',
    'projectService', 'projectApiService', 'goTemplates', 'abstractionsApiService','abstractionService', 'algorithmService',
    function($scope, $http, $routeParams, $location, $timeout, $modal, goService, projectService, projectApiService, tp,
             abstractionsApiService, abstractionService, algorithmService) {

        $scope.projectList = projectService.getProjects();
        $scope.currentProject = projectService.getCurrentProject();
        $scope.isAbstracted = false;
        $scope.currentProjectAbstractions;
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

        $scope.getTables = function() {
            var tables = [];
            for (let i = 0; i < $scope.schema.tablesAndCols.length; i++) {
                var tableName = $scope.schema.tablesAndCols[i].table_name;
                var existingTables = _.where(tables, {table_name: tableName});

                if (existingTables && existingTables.length > 0 && $scope.schema.tablesAndCols[i]) {
                    existingTables[0].cols.push({col_name: $scope.schema.tablesAndCols[i].column_name,
                        primaryKey: ($scope.schema.tablesAndCols[i].column_key == "PRI"),
                    });
                } else {
                    var newTable = {table_name: tableName, cols: [ {col_name: $scope.schema.tablesAndCols[i].column_name,
                        primaryKey: ($scope.schema.tablesAndCols[i].column_key == "PRI"),
                    }]};
                    tables.push(newTable);
                }
            }

            return tables;
        };

        $scope.clusterCurrentProject = function() {
            // Extract "tables" from schema (rowsAndCols)
            var tables = $scope.getTables();
            return algorithmService.clusterRelations(tables);
        };

        $scope.toggleProjectAbstraction = function() {
            if($scope.isAbstracted){
                $scope.isAbstracted = false;
            }
            else{
                $scope.isAbstracted = true;
            }

            $scope.displayCurrentProject();
            //use go service to draw on screen
        }

        // This is called by init() and when we switch projects.
        $scope.displayCurrentProject = function() {
            // Get schema information from database.
            getSchemaInfo().then( (schemaInfo) => {
                if($scope.isAbstracted){
                    // Fake Data is loaded for testing purposes
                    var abstractions = $scope.getCurrentAbstraction();
                    schemaInfo.abstractEntities = abstractions.entities;
                    schemaInfo.abstractRelationships = abstractions.relationships;
                    // schemaInfo.abstractEntities = tp().fakeData.fakeAbstractEntityGraph.abstractEntities;
                    // schemaInfo.abstractRelationships = tp().fakeData.fakeAbstractEntityGraph.abstractRelationships;
                    goService.drawSchema(schemaInfo, goService.diagramTypes.ABSTRACT);
                }
                else{
                    goService.drawSchema(schemaInfo, goService.diagramTypes.CONCRETE);
                }
            })
        };

        $scope.getCurrentAbstraction = function(){
            //call clustering algorithm on current schema
            //make DB call to get all abstractions for a project
            let currentProjectId = $scope.currentProject.id;

            //// check abstractionServiceCache (implement later if time permits)
            //// $scope.currentProjectAbstractions = abstractionService.getProjectAbstraction(currentProjectId);
            //// if cache hit
            //// if($scope.currentProjectAbstractions.length > 0){
            ////     var abstractionToShow = $scope.currentProjectAbstractions[0];
            //// }
            //// if(abstractionToShow){
            ////     $scope.displayCurrentAbstraction(abstractionToShow);
            ////    return;
            //// }

            //if cache miss, check DB
            // $scope.currentProjectAbstractions = abstractionsApiService.getAllProjectAbstractions(currentProjectId);
            // if($scope.currentProjectAbstractions.length > 0){ //need to test this line
            //     var abstractionToShow = $scope.currentProjectAbstractions[0];
            //     return abstractionToShow;
            // }
            // else{
            //     //call magic algorithm
            //     var abstractionToShow = abstractionService.computeProjectAbstractions();
            //     abstractionsApiService.addProjectAbstraction(currentProjectId, abstractionToShow);
            //         .then(
            //             function(projects){
            //                 alert("Abstraction has been saved succesfully!");                   
            //             }, function(error){
            //                 alert(error.error);
            //             }
            //         );   
                                 
            //     return abstractionToShow;
            // }

            // TODO: need to handle saving abstractions when they are renamed.
            // TODO: need to handle drill down
            
            //sending mock for now
            return $scope.clusterCurrentProject();
            //return [ tp().fakeData.fakeAbstractEntityGraph.abstractEntities, tp().fakeData.fakeAbstractEntityGraph.abstractRelationships]
        }

        function getSchemaInfo(){
            return new Promise((resolve,reject) => {
                if(!!$scope.schema){
                    return resolve($scope.schema);
                }

                $http.get('/api/schema/', {
                        params: $scope.currentProject
                    })
                    .success((schemaInfo) => {
                        $scope.schema = schemaInfo;
                        // Hacky
                        return resolve($scope.schema);
                    })
                    .error((error) => {
                        alert("Error - " + error.message);
                        return reject();
                    });
            }) 
        }

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

        var ModalInstanceCtrl = function($scope, $modalInstance) {
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

        $scope.$on('drill-in-clicked', (event,abstractObjectName) => {
            getSchemaInfo().then( (info) => {
                //TODO
                // get the current abstraction using the cache
                var currentAbstraction = $scope.clusterCurrentProject();

                // create an array of all possible entity objects
                var possibleEntities = currentAbstraction.entities.concat(currentAbstraction.relationships);

                // find the correct entity object
                var targetEntities = possibleEntities.filter( (object) => object.name == abstractObjectName);
                
                // extract the tables from the entity object
                var tables = [];
                _.each(targetEntities, function(entity) {
                   tables.concat(entity.table_names);
                });

                // get the reduced table schema of the tables in that entity object
                var filteredSchema = abstractionService.extractTablesFromObject(tables, info);

                // display the reduced schema
                goService.drawSchema(filteredSchema, goService.diagramTypes.CONCRETE);
            })
        })

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

        $scope.goHome = function(id) {
          $location.path("/");
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
