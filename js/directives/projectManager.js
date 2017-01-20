app.directive('projectManager', function() {
  return {
    restrict: 'E',
    scope: {
    },
    link: function(scope){
    	scope.stringList = [
			{ id: 1, name: "Oscar"},
			{ id: 2, name: "Minecraft"},
			{ id: 3, name: "Prince of Persa"},
    	];
    },
    templateUrl: '/views/partials/projectList.html'
  };
});


