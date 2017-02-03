app.controller('projectController', ['$scope', '$location', 'goService', 'projectApiService', 'projectService', function($scope, $location, goService, projectApiService, projectService){

	$scope.currentProjects = {}
	$scope.projectToAdd = {}
 	$scope.gojs = goService.drawSchema;
	$scope.msg = "Pikachu!!";

	$scope.updateCurrentProjects = function(projects) {
	    $scope.currentProjects = projects;
	    projectService.setProjects(projects);
    }

	$scope.init = function(){
		projectApiService.getAllProjects()
			.then(
				function(projects){
					$scope.updateCurrentProjects(projects);
				}, function(error){
					alert(error.error);
				}
		);
	}

	$scope.deleteProjectFromDB = function(id){
		projectApiService.deleteProject(id)
			.then(
				function(projects){
					alert("Project has been deleted succesfully!");
					$scope.updateCurrentProjects(projects);
				}, function(error){
					alert(error.error);
				}
			);
	}

	$scope.addProjectToDB = function(project){
		projectApiService.addProject(project)
			.then(
				function(projects){
					$scope.updateCurrentProjects(projects);
					$scope.projectToAdd = {};
				}, function(error){
					alert(error.error);
				}
			);
	}

    $scope.showProject = function(id) {
        let project = projectService.getProjectById(id);
        if (project) {
            projectService.setCurrentProject(project);
            // Switch to schema.
            $location.path("/schema/" + project.id);
        } else {
            alert("Error: project doesn't exist.");
        }
    }

}]);
