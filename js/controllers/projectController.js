app.controller('projectController', ['$scope', '$location', 'projectApiService', 'projectService', '$modal', function($scope, $location, projectApiService, projectService, $modal){

	$scope.currentProjects = [];
	$scope.projectToAdd = {};
	$scope.projectToEdit = {};
	$scope.msg = "Pikachu!!";

	$scope.updateCurrentProjects = function(projects) {
	    $scope.currentProjects = projects;
	    projectService.setProjects(projects);
    };

	$scope.init = function(){
		if($scope.currentProjects.length == 0){
			projectApiService.getAllProjects()
				.then(
					function(projects){
						$scope.updateCurrentProjects(projects);
					}, function(error){
						alert(error.error);
					}
			);
		}
		$scope.projectToAdd = {};
		$scope.projectToEdit = {};
	};

	$scope.deleteProjectFromDB = function(id){
		projectApiService.deleteProject(id)
			.then(
				function(projects){
					alert("Project has been deleted succesfully!");
					projectService.setProjects(projects);
					$scope.currentProjects = projects;
				}, function(error){
					alert(error.error);
				}
			)
;	};

	var ModalInstanceCtrl = function ($scope, $modalInstance) {
	  $scope.submitEditRequest = function (id) {
	  	$scope.editProjectInDB(id, $modalInstance);
	  };
	  $scope.cancelEditRequest = function () {
	    $modalInstance.dismiss("cancel");
	    $scope.projectToEdit = {}
	  };
	};

	$scope.openEditModal = function(projectId){
		$scope.projectToEdit = angular.copy(projectService.getProjectById(projectId));
	    $modal.open({
	      templateUrl: '/views/partials/editModal.html',
	      controller: ModalInstanceCtrl,
	      scope: $scope
	    });
	};

	$scope.editProjectInDB = function(id, modalInstance){
		projectApiService.updateProject(id)
			.then(
				function(projects){
					projectService.setProjects(projects);
					$scope.currentProjects = projects;					
					alert("This project has been successfully updated!");
					modalInstance.close("ok");
				 	$scope.projectToEdit = {};
				},
				function(error){
					alert(error.error);

				}
			);
	};

	$scope.cancelEditRequest = function(){
		$scope.projectToEdit = {};
		return;
	};

	$scope.addProjectToDB = function(project){
		projectApiService.addProject(project)
			.then(
				function(projects){
					projectService.setProjects(projects);
					$scope.currentProjects = projects;
					$scope.projectToAdd = {};
					alert("Project has been added succesfully!");					
				}, function(error){
					$scope.projectToAdd = {};	
					alert(error.error);
				}
			);
	};

    $scope.showProject = function(id) {
        let project = projectService.getProjectById(id);
        if (project) {
            projectService.setCurrentProject(project);
            // Switch to schema.
            $location.path("/schema/" + project.id);
        } else {
            alert("Error: project doesn't exist.");
        }
    };

}]);
