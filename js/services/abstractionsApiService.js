app.service('abstractionsApiService', ['$http', '$q', function($http, $q){

	this.getAllProjectAbstractions = function(projectid){
		var deferred = $q.defer();
        var config = {method: 'GET', url: '/api/abstractions/', params: {"projectid": projectid} };
        // "/url/to/resource/", {params:{"param1": val1, "param2": val2}}
		$http(config)
		.success((data) => { return deferred.resolve(data); })
		.error(() => { 
			return deferred.reject({error: "Failed to get all projects."});
		 });

		return deferred.promise;	
	};


    //watch out for adding models with same modelids for the same project
    //needs to be handled in the controller
	this.addProjectAbstraction = function(projectid, modelData){
		var deferred = $q.defer();		
        var config = {method: 'POST', url: '/api/abstractions/', params: {"projectid": projectid}, data: modelData};
		$http(config)
		.success( (data) => {
				return deferred.resolve(data);
			}
		)
		.error((err) => {
			return deferred.reject({error: 'Error: ' + err});
		});

		return deferred.promise;
	};

    this.getParticularProjectAbstraction = function(projectid, modelid){
        var deferred = $q.defer();
        var config = {method: 'GET', url: '/api/abstractions/', params: {"projectid": projectid, "modelid": modelid} };
        // "/url/to/resource/", {params:{"param1": val1, "param2": val2}}
        $http(config)
        .success((data) => { return deferred.resolve(data); })
        .error(() => { 
            return deferred.reject({error: "Failed to get all projects."});
         });

        return deferred.promise;    
    };

	this.updateProjectAbstraction = function(projectid, modelid, modelData){
		var deferred = $q.defer();
        var config = {method: 'PUT', url: '/api/abstractions/', params: {"projectid": projectid, "modelid": modelid}, data: modelData};
        $http(config);
            .success((data) => {
                return deferred.resolve(data);
            })
            .error((err) => {
                return deferred.reject({error: "Error" + err});
            });

		return deferred.promise;
	};

}]);