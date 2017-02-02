app.service('goService', function() {

	this.drawSchema = function(projectData){
	    var GO = go.GraphObject.make;
	    var diagram =
	        GO(go.Diagram, "databaseDiagram",
	            {
	                initialContentAlignment: go.Spot.Center, // center Diagram contents
	                "undoManager.isEnabled": true, // enable Ctrl-Z to undo and Ctrl-Y to redo
	                allowDelete: false,
	                allowCopy: false,
	                layout: GO(go.ForceDirectedLayout)
	            });

	    // Visualize a database; based on http://gojs.net/latest/samples/entityRelationship.html

	    // Database column
	    var colTempl = GO(go.Panel, "Horizontal", GO(go.TextBlock,
	        {}, new go.Binding("text", "name")));

	    var tableTempl = GO(go.Node, "Auto", {}, new go.Binding("location", "location").makeTwoWay(),
	        GO(go.Shape, "Rectangle", {fill: "#FFFAF0"}),
	        GO(go.Panel, "Table", {},
	            GO(go.RowColumnDefinition, {row: 0}),
	            GO(go.TextBlock, {font: "bold 16px sans-serif"}, new go.Binding("text", "key")),
	            GO(go.Panel, "Vertical", {name: "LIST", row: 1, itemTemplate: colTempl}, new go.Binding("itemArray", "items"))
	        ) // end table panel
	    ); // end node

	    diagram.nodeTemplate = tableTempl;

	    // Link template (relationship)
	    var linkTempl = GO(go.Link, {reshapable: true, routing: go.Link.AvoidsNodes, curve: go.Link.JumpOver},
	                    GO(go.Shape, {}),
	                    // "from" label.
	                    GO(go.TextBlock, {segmentOffset: new go.Point(NaN, NaN), segmentIndex: 0}, new go.Binding("text", "fromText")),
	                    // "to" label.
	                    GO(go.TextBlock, {segmentOffset: new go.Point(NaN, NaN), segmentIndex: -1}, new go.Binding("text", "toText"))
	    ); // end link

	    diagram.linkTemplate = linkTempl;

	    // convert to node data array
	    var nodeDataArray = [];

	    for (var i = 0; i < projectData.tablesAndCols.length; i++) {
	        var tbl_name = projectData.tablesAndCols[i].table_name;
	        var existing_tbl = _.where(nodeDataArray, {key: tbl_name});

	        if (existing_tbl && existing_tbl.length > 0 && projectData.query1) {
	            existing_tbl[0].items.push({name: projectData.tablesAndCols[i].column_name,
					isKey: (projectData.tablesAndCols[i].column_key == "PRI")});
	        } else {
	            var new_tbl = {key: tbl_name, items: [ {name: projectData.tablesAndCols[i].column_name,
					isKey: (projectData.tablesAndCols[i].column_key == "PRI")}]};
	            nodeDataArray.push(new_tbl);
	        }
	    }

	    var linkDataArray = [];

	    for (let j = 0; j < projectData.tablesAndCols.length; j++) {
	    	if (projectData.tablesAndCols[j].referenced_table_name) {
                linkDataArray.push({from: projectData.tablesAndCols[j].table_name,
                    to: projectData.tablesAndCols[j].referenced_table_name,
                    fromText: projectData.tablesAndCols[j].constraint_name, toText: "blah"});
			}
	    }

	    diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
	};
});