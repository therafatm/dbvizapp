app.controller('schemaController', ['$scope', '$rootScope', '$http', '$routeParams', '$location', '$timeout', '$modal', 'goService',
    'projectService', 'projectApiService', 'goTemplates', 'abstractionsApiService', 'algorithmService', '$q',
    function($scope, $rootScope, $http, $routeParams, $location, $timeout, $modal, goService, projectService, projectApiService, tp,
             abstractionsApiService, algorithmService, $q) {

        this.scope = $scope;
        $scope.projectList = projectService.getProjects();
        $scope.currentProject = projectService.getCurrentProject();
        $scope.isAbstracted = false;
        $scope.currentProjectAbstractions = [];
        $scope.hiddenEntities = [];

        $scope.LAYOUTS = tp().LAYOUTS;

        $scope.currentLayout = tp().LAYOUTS.DIGRAPH;

        $window.onbeforeunload = function(){
            var scope = this;
            if(scope.isAbstracted){
                scope.saveLastDrilledScreen();
            }
        }.bind($scope);

        $scope.saveLastDrilledScreen = function(){
            //whenever I close, update latest
            var currentModelId = goService.currentModelId;
            var currentModel = $scope.currentProjectAbstractions.filter((model)=>{return model.modelid === 'latest'});
            if(currentModel.length > 0 || currentModelId == 'abstract'){
                //update old latest in DB
                var body = {modelid: 'latest', model: goService.currentDiagramJSON}; 
                abstractionsApiService.updateProjectAbstraction($scope.currentProject.id, 'latest', body)
                    .then(
                        function(projects){
                            alert("New latest abstraction has been updated succesfully!");
                        }, function(error){
                            alert(error.error);
                        }
                    ); 
            } 
            else{
                //add new latest abstraction
                var body = {modelid: 'latest', model:  goService.currentDiagramJSON} 
                abstractionsApiService.addProjectAbstraction($scope.currentProject.id, body)
                    .then(
                        function(projects){
                            alert("New latest abstraction has been saved succesfully!");
                            return;
                        }, function(error){
                            alert(error.error);
                        }
                    ); 
            }
        }

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

        $scope.saveRootAbstraction = function(abstractionWrapper){
            var body = {modelid: "abstract", model:  goService.currentDiagramJSON} 
            abstractionsApiService.addProjectAbstraction($scope.currentProject.id, body)
                .then(
                    function(projects){
                        alert("Abstraction has been saved succesfully!");
                        $scope.currentProjectAbstractions.push(body);

                    }, function(error){
                        alert(error.error);
                    }
                ); 
        }

        // This is called by init() and when we switch projects.
        $scope.displayCurrentProject = function() {
            // Get schema information from database.
            getSchemaInfo().then( (schemaInfo) => {
                if($scope.isAbstracted){
                    // Check DB for base abstraction
                    var abstractionWrapper = $scope.getCurrentAbstraction()
                        .then( 
                            function(abstractionWrapper){
                                //If I have a schema in the DB
                                if(!abstractionWrapper.toSave){
                                    goService.drawAbstractSchemaFromModel(abstractionWrapper.abstraction, abstractionWrapper.modelid);
                                    return;
                                }

                                var abstractions = abstractionWrapper.abstraction;
                                schemaInfo.abstractEntities = abstractions.entities;
                                schemaInfo.abstractRelationships = abstractions.relationships;
                                goService.buildAndDrawSchema(schemaInfo, goService.diagramTypes.ABSTRACT, 'abstract');
                                if(abstractionWrapper.toSave){
                                    $scope.saveRootAbstraction(abstractionWrapper);
                                }
                            },
                            function(error){
                                return;
                            }
                        )    
                }
                else{
                    goService.buildAndDrawSchema(schemaInfo, goService.diagramTypes.CONCRETE);
                }
            })
        };

        $scope.getCurrentAbstraction = function(){
            //call clustering algorithm on current schema
            //make DB call to get all abstractions for a project
            let currentProjectId = $scope.currentProject.id;
            var toReturn = abstractionsApiService.getAllProjectAbstractions(currentProjectId)
                        .then(  function(projectAbstractions){
                                    $scope.currentProjectAbstractions = projectAbstractions;
                                    if($scope.currentProjectAbstractions.length > 0){
                                        //If DB has a schema for the current project
                                        var abstractionToShow = $scope.currentProjectAbstractions.filter(function(x){return x["modelid"] === "latest"});
                                        if(abstractionToShow.length <= 0){
                                            abstractionToShow = $scope.currentProjectAbstractions.filter(function(x){return x["modelid"] === "abstract"});                                            
                                        }
                                        return {abstraction: abstractionToShow[0].model, toSave: false, modelid: abstractionToShow[0].modelid};
                                    }
                                    else{
                                        //DB doesn't have schema and save it
                                        //call magic algorithm
                                        return {abstraction: $scope.clusterCurrentProject(), toSave: true};
                                    }
                                },
                                function(error){
                                    return;
                                }
                            );

            return toReturn;

            // TODO: need to handle saving abstractions when they are renamed.
            // TODO: need to handle drill down
            //sending mock for now
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
                goService.buildAndDrawSchema(filteredSchema, goService.diagramTypes.CONCRETE);
            })
        })

        $rootScope.$on('entity-renamed', (event, args) => {
            console.log('TODO renaming entity in model');
            console.log('TODO Save Model after rename change');
        })
        $rootScope.$on('layout-changed', (event, args) => {
            if( $scope.isAbstracted ){
                $scope.saveRootAbstraction();
            }
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
