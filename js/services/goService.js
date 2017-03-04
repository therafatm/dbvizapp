app.service('goService', ['$rootScope','goTemplates', function($rootScope, tp) {

  var GO = go.GraphObject.make;

  this.diagram = null;

  this.diagramTypes = {
    ABSTRACT: "ABSTRACT",
    CONCRETE: "CONCRETE"
  }

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
  this.getDiagramCurrentView = function() {
      // Creates an image that is the same size as the viewport.
      if (this.diagram) {
          // Returns the image data in the form "data:image/png,<base64 image data>"
          return this.diagram.makeImageData();
      } else {
          return "#"; // returns to homepage currently, but would be good to display error feedback.
      }
  }

  this.getFullDiagram = function () {
      // Creates an image containing the whole diagram.
      if (this.diagram) {
          // Returns the image data in the form "data:image/png,<base64 image data>"
          return this.diagram.makeImageData({scale: 1});
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
        GO(go.Shape, "ThickCross",
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
  
  go.GraphObject.defineBuilder("DrillIntoButton", function(args) {
    var eltname = /** @type {string} */ (go.GraphObject.takeBuilderArgument(args, "COLLAPSIBLE"));

    var button = /** @type {Panel} */ (
      GO("Button",
        GO(go.Shape, "Ethernet",
                            { desiredSize: new go.Size(13, 13) }
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
      diagram.startTransaction("Drill Into Entity");

      console.info("Drill into diagram");

      diagram.commitTransaction("Drill Into Entity");
    }

    return button;
  });
  


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

  function convertConcreteGraph(tablesAndCols, foreignKeys){
	    // convert to node data array
	    var nodeDataArray = [];

	    for (let i = 0; i < tablesAndCols.length; i++) {
	        var tbl_name = tablesAndCols[i].table_name;
	        var existing_tbl = _.where(nodeDataArray, {key: tbl_name});

          let shapeData = getDataTypeMapping(tablesAndCols[i].data_type);

	        if (existing_tbl && existing_tbl.length > 0 && tablesAndCols[i]) {
	            existing_tbl[0].items.push({name: tablesAndCols[i].column_name,
					isKey: (tablesAndCols[i].column_key == "PRI"),
					color: shapeData.color,
					figure: shapeData.shape
	            });
	        } else {
	            var new_tbl = {key: tbl_name, items: [ {name: tablesAndCols[i].column_name,
					isKey: (tablesAndCols[i].column_key == "PRI"),
                    color: shapeData.color,
                    figure: shapeData.shape
	            }]};
	            nodeDataArray.push(new_tbl);
	        }
	    }

	    var linkDataArray = [];

	    for (let j = 0; j < foreignKeys.length; j++) {
	    	if (foreignKeys[j].referenced_table_name) {
                linkDataArray.push({
                	from: foreignKeys[j].table_name,
					fromPort: foreignKeys[j].column_name,
                    to: foreignKeys[j].referenced_table_name,
                    toPort: foreignKeys[j].referenced_column_name,
                    toText: foreignKeys[j].constraint_name

                });
			  }
	    }
      return {
        linkDataArray: linkDataArray,
        nodeDataArray: nodeDataArray
      }
  }

  function convertAbstractGraph(abstractEntities, abstractRelationships){
  // convert to node data array
	    var nodeDataArray = [];
	    var linkDataArray = [];

      // set up the abstract entities
	    for (let i = 0; i < abstractEntities.length; i++) {
	        var tbl_name = abstractEntities[i].name;
	        var existing_tbl = _.where(nodeDataArray, {key: tbl_name});

          let shapeData = getDataTypeMapping("text");


          var new_tbl = {
            key: tbl_name,
            category: "entity",
            items: abstractEntities[i].primaryKeys.map( (key) => {
              return {
                name: key.table,
                isKey: true,
                color: shapeData.color,
                figure: shapeData.shape
              }
            }) 
          };
          
          nodeDataArray.push(new_tbl);
      }
      
      // set up the abstract relationships
	    for (let i = 0; i < abstractRelationships.length; i++) {
	        var tbl_name = abstractRelationships[i].name;
	        var existing_tbl = _.where(nodeDataArray, {key: tbl_name});

          let shapeData = getDataTypeMapping("text");


          var new_tbl = {
            key: tbl_name,
            category: "relationship",
            items: abstractRelationships[i].primaryKeys.map( (key) => {
              return {
                name: key.table,
                isKey: true,
                color: shapeData.color,
                figure: shapeData.shape
              }
            }) 
          };
          
          nodeDataArray.push(new_tbl);

          for(let j =0; j<abstractRelationships[i].endpoints.length; j++){
            var endpoint = abstractRelationships[i].endpoints[j];

            linkDataArray.push({
              from: abstractRelationships[i].name,
              fromPort: abstractRelationships[i].name,
              to: endpoint,
              toPort: endpoint,
              toText: ""
            })
          }
      }

      return {
        linkDataArray: linkDataArray,
        nodeDataArray: nodeDataArray
      }
  }

	this.drawSchema = (projectData, modelType, modelId) => {

    if( this.diagram == null){
	    this.diagram =
	        GO(go.Diagram, "databaseDiagram",
	            {
	                initialContentAlignment: go.Spot.Center, // center Diagram contents
	                "undoManager.isEnabled": true, // enable Ctrl-Z to undo and Ctrl-Y to redo
	                allowDelete: false,
	                allowCopy: false,
	                layout: GO(go.LayeredDigraphLayout)
	            });
    }


    if( modelType == this.diagramTypes.CONCRETE){

      if(modelId == null || modelId == undefined){
        // loading the full database view
        this.diagram.nodeTemplate = tp().concreteTableTemplate.tableTemplate;
        this.diagram.linkTemplate = tp().concreteTableTemplate.relationshipTemplate;


        var result = convertConcreteGraph(projectData.tablesAndCols, projectData.foreignKeys)

        this.diagram.model = new go.GraphLinksModel(result.nodeDataArray, result.linkDataArray);

        this.diagram.model.linkFromPortIdProperty = "fromPort";  // necessary to remember portIds
        this.diagram.model.linkToPortIdProperty = "toPort";		// Allows linking from specific columns

      } else {
        // load part of the data view, defined by the modelID. Pull all the tables from the abstract entity associated with the modelID, and display these

        // TODO
      }
    } else if( modelType == this.diagramTypes.ABSTRACT){
      // load the full abstract view of the database
      
      this.diagram.nodeTemplateMap = tp().abstractEntityTemplate.tableTemplateMap;
      this.diagram.linkTemplate = tp().abstractEntityTemplate.relationshipTemplate;

      var result = convertAbstractGraph(projectData.abstractEntities, projectData.abstractRelationships);

      this.diagram.model = new go.GraphLinksModel(result.nodeDataArray, result.linkDataArray);

      this.diagram.model.linkFromPortIdProperty = "fromPort";  // necessary to remember portIds
      this.diagram.model.linkToPortIdProperty = "toPort";		// Allows linking from specific columns

    } else {
      console.error(`Invalid model type "${modelType}" given`);
    }

	};

  this.subscribe = function(event, scope, callback) {
      var handler = $rootScope.$on(event, callback);
      scope.$on('$destroy', handler);
  }
}]);
