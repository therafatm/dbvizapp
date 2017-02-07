app.service('goService', ['$rootScope','goTemplates', function($rootScope, tp) {
	
  var GO = go.GraphObject.make;

  this.diagram = null;

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

  this.updateLayout = (layout) => {
    if(layout == tp().LAYOUTS.GRID){
      this.diagram.layout = new go.GridLayout();
    }
    if(layout == tp().LAYOUTS.CIRCULAR){
      this.diagram.layout = new go.CircularLayout();
    }

    if(layout == tp().LAYOUTS.FORCEDIRECTED){
      this.diagram.layout = new go.ForceDirectedLayout();
    }
    if(layout == tp().LAYOUTS.DIGRAPH){
      this.diagram.layout = new go.LayeredDigraphLayout();
    }
  }

  // Exporting image of diagram.
  this.getImageBase64 = function() {
      // Creates an image that is the same size as the viewport.
      if (this.diagram) {
          // Returns the image data in the form "data:image/png,<base64 image data>"
          return this.diagram.makeImageData();
      } else {
          return "#"; // returns to homepage currently, but would be good to display error feedback.
      }
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

	this.drawSchema = (projectData) => {
	    this.diagram =
	        GO(go.Diagram, "databaseDiagram",
	            {
	                initialContentAlignment: go.Spot.Center, // center Diagram contents
	                "undoManager.isEnabled": true, // enable Ctrl-Z to undo and Ctrl-Y to redo
	                allowDelete: false,
	                allowCopy: false,
	                layout: GO(go.LayeredDigraphLayout)
	            });

      this.diagram.nodeTemplate = tp().tableTemplate;
      this.diagram.linkTemplate = tp().relationshipTemplate;

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