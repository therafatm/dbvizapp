app.service('projectApiService', ['$http', '$q', function($http, $q){

	this.getAllProjects = function(){
		var deferred = $q.defer();
		$http.get('/api/project/')
		.success((data) => { return deferred.resolve(data); })
		.error(() => { 
			return deferred.reject({error: "Failed to get all projects."});
		 });

		return deferred.promise;	
	}

	this.deleteProject = function(id){
		var deferred = $q.defer();		
		$http.delete('/api/project/' + id)
		.success( (data) => {
				return deferred.resolve(data);
			}
		)
		.error((err) => {
			return deferred.reject({error: 'Error: ' + err});
		});

		return deferred.promise;
	}

	this.addProject = function(project){
		var deferred = $q.defer();
        // Modifying to use url for mysql instead.
        if(typeof(project.name) == 'string' && project.name.length > 0 &&
            typeof(project.host) == 'string' && project.host.length > 0 &&
            typeof(project.username) == 'string' && project.username.length > 0 &&
            typeof(project.password) == 'string' && project.password.length > 0) {
            $http.post('/api/project/', project)
                .success((data) => {
                    return deferred.resolve(data);
                })
                .error((err) => {
                    return deferred.reject({error: "Error" + err});
                });
        } else {
            console.log(project);
            alert("Invalid form information.");
            return deferred.resolve({error: "Invalid form information!", data: {}});
        }

		return deferred.promise;
	}

}]);