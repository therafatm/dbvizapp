app.controller('projectController', ['$scope', 'goService', 'projectApiService', function($scope, goService, projectApiService){

	$scope.currentProjects = {}
	$scope.projectToAdd = {}
 	$scope.gojs = goService.drawSchema;
	$scope.msg = "Pikachu!!";

	$scope.init = function(){
		projectApiService.getAllProjects()
			.then(
				function(projects){
					$scope.currentProjects = projects;
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
					$scope.currentProjects = projects;
				}, function(error){
					alert(error.error);
				}
			);
	}

	$scope.addProjectToDB = function(project){
		projectApiService.addProject(project)
			.then(
				function(projects){
					$scope.currentProjects = projects;
					$scope.projectToAdd = {}
				}, function(error){
					alert(error.error);
				}
			);
	}

}]);
