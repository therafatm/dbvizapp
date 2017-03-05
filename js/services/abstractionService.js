app.service('abstractionService', function() {

    var computeProjectAbstractions = function(){
        //magic algorithm
    }

    function extractTablesFromObject(tables, projectData){
        var filteredData = projectData;
        filteredData.tablesAndCols = projectData.tablesAndCols.filter( (table) => {
            return tables.filter( (tblName) => table.table_name == tblName).length > 0;
        })
        return filteredData;
    }


    return {
        computeProjectAbstractions: computeProjectAbstractions,
        extractTablesFromObject: extractTablesFromObject,
    };

});