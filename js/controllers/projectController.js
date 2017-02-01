app.controller('projectController', ['$scope', '$http', '$location','projectService', function($scope, $http, $location, projectService){

	$scope.projectToAdd = {};

	$http.get('/api/project/')
	.success((data) => { $scope.currentProjects = data; projectService.setProjects(data); })
	.error((error) => { console.log('Error: ' + error); });

	$scope.deleteProject = function(id){
		$http.delete('/api/project/' + id)
		.success( (data) => {
				alert("Project has been deleted succesfully!");
				$scope.currentProjects = data;
				projectService.setProjects(data);
			}
		)
		.error((error) => {
			alert('Error: ' + error);
		});
	}

	$scope.addProject = function(project){

		// Modifying to use url for mysql instead.
		if(typeof(project.name) == 'string' && project.name.length > 0 &&
		   typeof(project.host) == 'string' && project.host.length > 0 &&
		   typeof(project.username) == 'string' && project.username.length > 0 &&
		   typeof(project.password) == 'string' && project.password.length > 0) {
			$http.post('/api/project/', $scope.projectToAdd)
				.success((data) => {
				$scope.currentProjects = data;
				projectService.setProjects(data);
				alert("New project has been added.");
			})
			.error((error) => {
				alert("Error - " + error);
			});
		} else {
            console.log(project);
            alert("Invalid form information.");
            $scope.projectToAdd = {};
        }

		// if(parseInt(project.id) > 0 && (typeof(project.name) == 'string') && project.name.length > 0){
		// 	$http.post('/api/project/', $scope.projectToAdd)
		// 	.success( (data) => {
		// 		$scope.currentProjects = data;
		// 		alert("New project has been added!");
		// 	})
		// 	.error((error) => {
		// 		alert("Error - " + error);
		// 	});
		// } else{
		// 	console.log(project);
		// 	alert("Invalid form information!");
		// 	$scope.projectToAdd = {};
		// }

		$scope.projectToAdd = {};
	};

	$scope.showProject = function(id) {
		let project = _.findWhere(projectService.getProjects(), {id: id});
		if (project) {
            projectService.setCurrentProject(project);
            // Switch to schema.
			$location.path("/schema");
		} else {
			alert("Error: project doesn't exist.");
		}
	};

	$scope.msg = "Pikachu!!";
}]);
