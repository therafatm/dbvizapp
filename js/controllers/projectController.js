app.controller('projectController', ['$scope', '$http', 'goService', function($scope, $http, goService){

	$scope.projectToAdd = {};

	$http.get('/api/project/')
	.success((data) => { $scope.currentProjects = data; })
	.error((error) => { console.log('Error: ' + error); });

	$scope.deleteProject = function(id){
		$http.delete('/api/project/' + id)
		.success( (data) => {
				alert("Project has been deleted succesfully!");
				$scope.currentProjects = data
			}
		)
		.error((error) => {
			alert('Error: ' + error);
		});
	}

	$scope.addProject = function(project){

		if(parseInt(project.id) > 0 && (typeof(project.name) == 'string') && project.name.length > 0){
			$http.post('/api/project/', $scope.projectToAdd)
			.success( (data) => {
				$scope.currentProjects = data;
				alert("New project has been added!");
			})
			.error((error) => {
				alert("Error - " + error);
			});
		} else{
			console.log(project);
			alert("Invalid form information!");
			$scope.projectToAdd = {};
		}

		$scope.projectToAdd = {};
	}
 	
 	$scope.gojs = goService.drawSchema;
	$scope.msg = "Pikachu!!";
}]);
