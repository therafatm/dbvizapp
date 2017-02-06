app.service('goService', ['$rootScope', function($rootScope) {
	
  var GO = go.GraphObject.make;

  this.diagram = null;

	 // define several shared Brushes for drawing go elements
  var bluegrad = GO(go.Brush, "Linear", { 0: "rgb(150, 150, 250)", 0.5: "rgb(86, 86, 186)", 1: "rgb(86, 86, 186)" });
  var greengrad = GO(go.Brush, "Linear", { 0: "rgb(158, 209, 159)", 1: "rgb(67, 101, 56)" });
  var redgrad = GO(go.Brush, "Linear", { 0: "rgb(206, 106, 100)", 1: "rgb(180, 56, 50)" });
  var yellowgrad = GO(go.Brush, "Linear", { 0: "rgb(254, 221, 50)", 1: "rgb(254, 182, 50)" });
  var lightgrad = GO(go.Brush, "Linear", { 1: "#E6E6FA", 0: "#FFFAF0" });

    this.toggleAllAttributeVisibility = () => {
    
        if (this.diagram === null) return;
        if (this.diagram.isReadOnly) return;

        this.diagram.startTransaction("Collapse/Expand all panels");

        var isExpanded = false;
        this.diagram.nodes.each( (node) => {
            var list = node.findObject("ATTRIBUTES");
            if( list !== null && list.visible == true) isExpanded = true;
        })

        if( isExpanded ){
            this.diagram.nodes.each( (node) => {
                var list = node.findObject("ATTRIBUTES");
                if( list !== null) list.visible = false;
            })
        } else {
            this.diagram.nodes.each( (node) => {
                var list = node.findObject("ATTRIBUTES");
                if( list !== null) list.visible = true;
            })
        }

        this.diagram.commitTransaction("Collapse/Expand all panels");
  }

  this.showEntity = (entityName) => {
    this.diagram.startTransaction("Collapse/Expand Entity");
    this.diagram.nodes.each( (node) => {
        var table = node.findObject("TABLENAME");
        var entity = table.panel.panel;
        if( table.text == entityName ){
          entity.visible = true;

          var linksIter = entity.findLinksConnected().iterator;
          while(linksIter.next()){
            linksIter.value;
            
            // deal with the cases of to and from links
            if(linksIter.value.toNode.findObject("TABLENAME").text == table.text){
              if( linksIter.value.fromNode.visible ){
                linksIter.value.visible = true;
              }
            } else if( linksIter.value.fromNode.findObject("TABLENAME").text == table.text){
              if( linksIter.value.toNode.visible ){
                linksIter.value.visible = true;
              }
            }

          }
        }
    })
    this.diagram.commitTransaction("Collapse/Expand Entity");
  }

  go.GraphObject.defineBuilder("ToggleEntityVisibilityButton", function(args) {
    var eltname = /** @type {string} */ (go.GraphObject.takeBuilderArgument(args, "COLLAPSIBLE"));

    var button = /** @type {Panel} */ (
      GO("Button",
        GO(go.Shape, "IrritationHazard",
                            { desiredSize: new go.Size(10, 10) }
        )
      )
    );

    var border = button.findObject("ButtonBorder");
    if (border instanceof go.Shape) {
      border.stroke = null;
      border.fill = "transparent";
    }

    button.click = function(e, button) {
      var diagram = button.diagram;
      diagram.startTransaction("Collapse/Expand Entity");
      var entity = button.panel.panel;
      var linksIter = entity.findLinksConnected().iterator;
      while(linksIter.next()){
        linksIter.value.visible = false;
      }
      entity.visible = false;
      $rootScope.$emit('hide-entity', entity.findObject("TABLENAME").text);
      diagram.commitTransaction("Collapse/Expand Entity");
    }

    return button;
  });

  go.GraphObject.defineBuilder("ExpandEntityButton", function(args) {
    var eltname = /** @type {string} */ (go.GraphObject.takeBuilderArgument(args, "COLLAPSIBLE"));

    var button = /** @type {Panel} */ (
      GO("Button",
        GO(go.Shape, "NinePointedBurst",
                            { desiredSize: new go.Size(10, 10),
                              margin: new go.Margin(5)}
        )
      )
    );

    var border = button.findObject("ButtonBorder");
    if (border instanceof go.Shape) {
      border.stroke = null;
      border.fill = "transparent";
    }

    button.click = function(e, button) {
      var diagram = button.diagram;
      diagram.startTransaction("Expand Diagram based on Entity");
      var entity = button.panel;
      var entityName = entity.findObject("TABLENAME").text;
      var linksIter = entity.findLinksConnected().iterator;
      while(linksIter.next()){
                    // deal with the cases of to and from links
          if(linksIter.value.toNode.findObject("TABLENAME").text == entityName){
            if( !linksIter.value.fromNode.visible ){
              $rootScope.$emit('show-entity', linksIter.value.fromNode.findObject("TABLENAME").text);
            }
          } else if( linksIter.value.fromNode.findObject("TABLENAME").text == entityName){
            if( !linksIter.value.toNode.visible ){
              $rootScope.$emit('show-entity', linksIter.value.toNode.findObject("TABLENAME").text);
            }
          }
      }
      diagram.commitTransaction("Expand Diagram based on Entity");
    }

    return button;
  });

	// the template for each attribute in a node's array of item data
  var attributeTemplate =
    GO(go.Panel, "Horizontal",
      GO(go.Shape,
        { desiredSize: new go.Size(10, 10), margin: 3 },
        new go.Binding("figure", "figure"),
        new go.Binding("fill", "color")),
      GO(go.TextBlock,
        { stroke: "#333333",
          font: "bold 14px sans-serif",
            fromSpot: go.Spot.LeftRightSides, toSpot: go.Spot.LeftRightSides,},
          new go.Binding("text", "name"),
          new go.Binding("portId", "name"))
    );

  // define the Node template, representing an entity
  var tableTemplate =
    GO(go.Node, "Auto",  // the whole node panel
      {
        name: "ENTITY", 
        selectionAdorned: true,
        resizable: false,
        minSize: new go.Size(150,50),
        layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
        fromSpot: go.Spot.AllSides,
        toSpot: go.Spot.AllSides,
        isShadowed: true,
        shadowColor: "#C5C1AA" },
      new go.Binding("location", "location").makeTwoWay(),
      // define the node's outer shape, which will surround the Table
      GO(go.Shape, "Rectangle",
        { fill: lightgrad, stroke: "#756875", strokeWidth: 3 }),
      GO(go.Panel, "Table",
          { margin: 8, stretch: go.GraphObject.Fill },
          GO(go.RowColumnDefinition, { row: 0, background: "#1199ff", sizing: go.RowColumnDefinition.None}),
          // the table header
          GO(go.TextBlock,
          {
            name: "TABLENAME",
            row: 0, alignment: go.Spot.Center,
            margin: new go.Margin(0, 14, 0, 14),  // leave room for Button
            font: "bold 16px sans-serif"
          },
          new go.Binding("text", "key")),
        // the collapse/expand button
        GO("PanelExpanderButton", "ATTRIBUTES",  // the name of the element whose visibility this button toggles
          { row: 0, alignment: go.Spot.TopRight }),
        GO("ToggleEntityVisibilityButton", "ENTITY",  // the name of the element whose visibility this button toggles
          { row: 0, alignment: go.Spot.TopLeft }),
        GO(go.Panel, "Vertical",
          {
            name: "ATTRIBUTES",
            row: 1,
            padding: 0,
            alignment: go.Spot.TopLeft,
            defaultAlignment: go.Spot.Left,
            stretch: go.GraphObject.Horizontal,
            itemTemplate: attributeTemplate
          },
          new go.Binding("itemArray", "items"))
      )  // end Table Panel
    );  // end Node

  // define the Link template, representing a relationship
  var relationshipTemplate =

		  GO(go.Link,  // the whole link panel
			{
				selectionAdorned: true,
				layerName: "Foreground",
				reshapable: true,
				routing: go.Link.AvoidsNodes,
				corner: 5,
				curve: go.Link.JumpOver
			},
			GO(go.Shape,  // the link shape
				{ stroke: "#303B45", strokeWidth: 2.5 })
		);

	this.drawSchema = (projectData) => {
	    this.diagram =
	        GO(go.Diagram, "databaseDiagram",
	            {
	                initialContentAlignment: go.Spot.Center, // center Diagram contents
	                "undoManager.isEnabled": true, // enable Ctrl-Z to undo and Ctrl-Y to redo
	                allowDelete: false,
	                allowCopy: false,
	                layout: GO(go.ForceDirectedLayout)
	            });

      this.diagram.nodeTemplate = tableTemplate;
      this.diagram.linkTemplate = relationshipTemplate;

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

	    //diagram.nodeTemplate = tableTempl;
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
                    toPort: projectData.foreignKeys[j].referenced_column_name,
                    toText: projectData.foreignKeys[j].constraint_name

                });
			}
	    }

	    this.diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

        this.diagram.model.linkFromPortIdProperty = "fromPort";  // necessary to remember portIds
        this.diagram.model.linkToPortIdProperty = "toPort";		// Allows linking from specific columns
	};

  this.subscribe = function(event, scope, callback) {
      var handler = $rootScope.$on(event, callback);
      scope.$on('$destroy', handler);
  }
}]);