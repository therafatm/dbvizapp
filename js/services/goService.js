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

		// Maps SQL data types to shapes for columns.
		var dataTypeMapping = {
			numerical: {
				shape: "Square",
				color: "blue"
			},
			string: {
				shape: "Circle",
				color: "purple"
			},
			date: {
				shape: "TriangleUp",
				color: "green"
			},
			enumeration: {
				shape: "Pentagon",
				color: "yellow"
			}
		};

		var getDataTypeMapping = function(type) {
			if (type.includes("char") || type.includes("varchar") || type.includes("text")) {
				return dataTypeMapping.string;
			} else if (type.includes("int") || type.includes("float") || type.includes("double") || type.includes("decimal")) {
				return dataTypeMapping.numerical;
			} else if (type.includes("date") || type.includes("time")) {
				return dataTypeMapping.date;
			} else if (type.includes("enum") || type.includes("set")) {
				return dataTypeMapping.enumeration;
			} else {
				return {shape: "ThinX", color: "red"}
			}
		}

	    // Database column template.
	    var colTempl = GO(go.Panel, "Horizontal",
            GO(go.Shape,
                { desiredSize: new go.Size(10, 10), margin: 2 },
                new go.Binding("figure", "figure"),
                new go.Binding("fill", "color")),
            GO(go.TextBlock,
                { stroke: "#333333",
                    font: "bold 14px sans-serif" },
                new go.Binding("text", "name")),
            new go.Binding("portId", "name")
		);

	    var tableTempl = GO(go.Node, "Auto",
            { selectionAdorned: true,
                resizable: true,
                layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
                fromSpot: go.Spot.AllSides,
                toSpot: go.Spot.AllSides,
                isShadowed: true,
                shadowColor: "#C5C1AA" },
			new go.Binding("location", "location").makeTwoWay(),
            // define the node's outer shape, which will surround the Table
            GO(go.Shape, "Rectangle",
                { fill: "#ffffff", strokeWidth: 0 }),
            GO(go.Panel, "Table",
                { stretch: go.GraphObject.Fill },
                GO(go.RowColumnDefinition, { row: 0, background: "#1199ff", sizing: go.RowColumnDefinition.None}),
                // the table header
                GO(go.TextBlock,
                    {
                        row: 0, alignment: go.Spot.Center,
                        margin: new go.Margin(0, 14, 0, 2),  // leave room for Button
                        font: "bold 16px sans-serif",
                    },
                    new go.Binding("text", "key")),
                // the collapse/expand button
                GO("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
                    { row: 0, alignment: go.Spot.TopRight }),
                // the list of Panels, each showing an attribute
                GO(go.Panel, "Vertical",
                    {
                        name: "LIST",
                        row: 1,
                        padding: 5,
                        alignment: go.Spot.TopLeft,
                        defaultAlignment: go.Spot.Left,
                        stretch: go.GraphObject.Horizontal,
						itemTemplate: colTempl
                    },
                    new go.Binding("itemArray", "items"))
            )  // end Table Panel
	    ); // end node

	    diagram.nodeTemplate = tableTempl;

	    // Link template (relationship)
	    var linkTempl = GO(go.Link, {reshapable: true, routing: go.Link.AvoidsNodes, curve: go.Link.JumpOver},
	                    GO(go.Shape, { stroke: "#303B45", strokeWidth: 2.5 }),
	                    // "from" label.
	                    GO(go.TextBlock, {segmentOffset: new go.Point(NaN, NaN), segmentIndex: 0}, new go.Binding("text", "fromText")),
	                    // "to" label.
	                    GO(go.TextBlock, {segmentOffset: new go.Point(NaN, NaN), segmentIndex: -1}, new go.Binding("text", "toText"))
	    ); // end link

	    diagram.linkTemplate = linkTempl;

	    // convert to node data array
	    var nodeDataArray = [];

	    for (let i = 0; i < projectData.tablesAndCols.length; i++) {
	        var tbl_name = projectData.tablesAndCols[i].table_name;
	        var existing_tbl = _.where(nodeDataArray, {key: tbl_name});

            let shapeData = getDataTypeMapping(projectData.tablesAndCols[i].data_type);

	        if (existing_tbl && existing_tbl.length > 0 && projectData.tablesAndCols[i]) {
	            existing_tbl[0].items.push({name: projectData.tablesAndCols[i].column_name,
					isKey: (projectData.tablesAndCols[i].column_key == "PRI"),
					color: shapeData.color,
					figure: shapeData.shape
	            });
	        } else {
	            var new_tbl = {key: tbl_name, items: [ {name: projectData.tablesAndCols[i].column_name,
					isKey: (projectData.tablesAndCols[i].column_key == "PRI"),
                    color: shapeData.color,
                    figure: shapeData.shape
	            }]};
	            nodeDataArray.push(new_tbl);
	        }
	    }

	    var linkDataArray = [];

	    for (let j = 0; j < projectData.foreignKeys.length; j++) {
	    	if (projectData.foreignKeys[j].referenced_table_name) {
                linkDataArray.push({
                	from: projectData.foreignKeys[j].table_name,
					fromPort: projectData.foreignKeys[j].column_name,
                    to: projectData.foreignKeys[j].referenced_table_name,
                    fromPort: projectData.foreignKeys[j].referenced_column_name,
                    toText: projectData.foreignKeys[j].constraint_name

                });
			}
	    }

	    diagram.model = new go.GraphLinksModel();

        diagram.model.linkFromPortIdProperty = "fromPort";  // necessary to remember portIds
        diagram.model.linkToPortIdProperty = "toPort";		// Allows linking from specific columns

		diagram.model.nodeDataArray = nodeDataArray;
		diagram.model.linkDataArray = linkDataArray;
	};
});