app.service('projectService', function() {
    var projectList = [];
    var currentProject;

    var addProject = function(project) {
        projectList.push(project);
    };

    var setProjects = function(projects) {
        projectList = projects;
    };

    var getProjects = function(){
        return projectList;
    };

    var setCurrentProject = function(project) {
        currentProject = project;
    };

    var getCurrentProject = function() {
        return currentProject;
    };

    var getProjectById = function(id) {
        return _.findWhere(projectList, {id: id});
    };

    return {
        addProject: addProject,
        setProjects: setProjects,
        getProjects: getProjects,
        setCurrentProject: setCurrentProject,
        getCurrentProject: getCurrentProject,
        getProjectById: getProjectById
    };

});