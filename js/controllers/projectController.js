app.controller('projectController', ['$scope', '$location', 'goService', 'projectApiService', 'projectService', '$modal', function($scope, $location, goService, projectApiService, projectService, $modal){

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
					$scope.currentProjects = projects;
                    projectService.setProjects(projects);
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

	var ModalInstanceCtrl = function ($scope, $modalInstance) {
	  $scope.submitEditRequest = function () {
	    $modalInstance.close("ok");
	  };
	  $scope.cancelEditRequest = function () {
	    $modalInstance.dismiss("cancel");
	  };
	};

	$scope.editProjectInDB = function(){
	    var modalInstance = $modal.open({
	      templateUrl: '/views/partials/editModal.html',
	      controller: ModalInstanceCtrl
	    });
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
