app.constant("goTemplates", function(){
  var GO = go.GraphObject.make;

  var templates = {
    concreteTableTemplate: {},
    abstractEntityTemplate: {},
    abstractRelationshipTemplate: {}
  }

  templates.colors = {};
  // define the template for displaying tables and their relationships
	 // define several shared Brushes for drawing go elements
  templates.colors.bluegrad = GO(go.Brush, "Linear", { 0: "rgb(150, 150, 250)", 0.5: "rgb(86, 86, 186)", 1: "rgb(86, 86, 186)" });
  templates.colors.greengrad = GO(go.Brush, "Linear", { 0: "rgb(158, 209, 159)", 1: "rgb(67, 101, 56)" });
  templates.colors.redgrad = GO(go.Brush, "Linear", { 0: "rgb(206, 106, 100)", 1: "rgb(180, 56, 50)" });
  templates.colors.yellowgrad = GO(go.Brush, "Linear", { 0: "rgb(254, 221, 50)", 1: "rgb(254, 182, 50)" });
  templates.colors.lightgrad = GO(go.Brush, "Linear", { 1: "#E6E6FA", 0: "#FFFAF0" });
  templates.colors.fire = GO(go.Brush, "Linear", {0: "#EE9900", 1: "#EE0000"});

  templates.LAYOUTS = {
    GRID:0,
    FORCEDIRECTED:1,
    CIRCULAR:2,
    DIGRAPH:3,
  }
  
  var concreteTableTemplate = {};

	// the template for each attribute in a node's array of item data
  concreteTableTemplate.attributeTemplate =
    GO(go.Panel, "Horizontal",
        { fromSpot: go.Spot.Right, toSpot: go.Spot.Left},
      GO(go.Shape,
        { desiredSize: new go.Size(10, 10), margin: 3 },
        new go.Binding("figure", "figure"),
        new go.Binding("fill", "color")),
      GO(go.TextBlock,
        { stroke: "#333333",
          font: "bold 14px sans-serif"},
          new go.Binding("text", "name")),
          new go.Binding("portId", "name")
    );

  // define the Node template, representing an entity
  concreteTableTemplate.tableTemplate =
    GO(go.Node, "Auto",  // the whole node panel
      {
        name: "ENTITY",
        selectionAdorned: true,
        resizable: false,
        minSize: new go.Size(150,50),
        layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
          portSpreading: go.Node.SpreadingNone,
        isShadowed: true,
        shadowColor: "#C5C1AA"
      },
      new go.Binding("location", "location").makeTwoWay(),
      // define the node's outer shape, which will surround the Table
      GO(go.Shape, "Rectangle",
        { fill: templates.colors.lightgrad, stroke: "#756875", strokeWidth: 3 }),
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
          { row: 0, alignment: go.Spot.TopRight,
              toolTip:  // define a tooltip for each node that displays the color as text
                  GO(go.Adornment, "Auto",
                      GO(go.Shape, { fill: "#FFFFCC" }),
                      GO(go.TextBlock, { margin: 4 }, "Show/hide attributes.")
                  )  // end of Adornment
              }),
        GO("ToggleEntityVisibilityButton", "ENTITY",  // the name of the element whose visibility this button toggles
          { row: 0, alignment: go.Spot.TopLeft,
              toolTip:  // define a tooltip for each node that displays the color as text
                  GO(go.Adornment, "Auto",
                      GO(go.Shape, { fill: "#FFFFCC" }),
                      GO(go.TextBlock, { margin: 4 }, "Hide this entity.")
                  )  // end of Adornment
          }),
        GO(go.Panel, "Vertical",
          {
            name: "ATTRIBUTES",
            row: 1,
            padding: 0,
            alignment: go.Spot.TopLeft,
            defaultAlignment: go.Spot.Left,
            stretch: go.GraphObject.Horizontal,
            itemTemplate: concreteTableTemplate.attributeTemplate
          },
          new go.Binding("itemArray", "items")),
          GO(go.Panel, "Vertical", // spacer to prevent entity button from overlapping name.
              {
                  row: 2,
                  margin: 6,
                  alignment: go.Spot.TopLeft,
                  defaultAlignment: go.Spot.Left,
                  stretch: go.GraphObject.Horizontal,
              })
      ), // end Table Panel
        GO("ExpandEntityButton", "ENTITY",  // the name of the element whose visibility this button toggles
        { row: 0, alignment: go.Spot.BottomRight, margin: 5,
            toolTip:  // define a tooltip for each node that displays the color as text
                GO(go.Adornment, "Auto",
                    GO(go.Shape, { fill: "#FFFFCC" }),
                    GO(go.TextBlock, { margin: 4 }, "Show all entities linked to this one.")
                )  // end of Adornment
        })
    );  // end Node

  // define the Link template, representing a relationship
  concreteTableTemplate.relationshipTemplate =

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
				{ strokeWidth: 2.5 },
                new go.Binding("stroke", "color"))
		);

  templates.concreteTableTemplate = concreteTableTemplate;

  var abstractEntityTemplate = {};

  // define the Link template, representing a relationship
  abstractEntityTemplate.relationshipTemplate =
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
	// the template for each attribute in a node's array of item data
  abstractEntityTemplate.attributeTemplate =
    GO(go.Panel, "Horizontal",
        { fromSpot: go.Spot.Right, toSpot: go.Spot.Left},
      GO(go.Shape,
        { desiredSize: new go.Size(10, 10), margin: 3 },
        new go.Binding("figure", "figure"),
        new go.Binding("fill", "color")),
      GO(go.TextBlock,
        { stroke: "#333333",
          font: "bold 14px sans-serif"},
          new go.Binding("text", "name")),
          new go.Binding("portId", "name")
    );

  // define the Node template, representing an entity
  var abstractEntityTableTemplate =
    GO(go.Node, "Auto",  // the whole node panel
      {
        name: "ENTITY",
        selectionAdorned: true,
        resizable: false,
        minSize: new go.Size(150,75),
        layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
          portSpreading: go.Node.SpreadingNone,
        isShadowed: true,
        shadowColor: "#C5C1AA"
      },
      new go.Binding("location", "location").makeTwoWay(),
      // define the node's outer shape, which will surround the Table
      GO(go.Shape, "Rectangle",
        { fill: templates.colors.lightgrad, stroke: "#756875", strokeWidth: 3 }),
      GO(go.Panel, "Table",
          { margin: new go.Margin(3,0,3,0), stretch: go.GraphObject.Fill, alignment: go.Spot.TopCenter  },
          GO(go.RowColumnDefinition, { row: 0, background: "#1199ff", sizing: go.RowColumnDefinition.None}),
          // the table header
          GO(go.TextBlock,
          {
            name: "TABLENAME",
            row: 0, alignment: go.Spot.Center,
            margin: new go.Margin(0, 75, 0, 75),  // leave room for Button
            font: "bold 16px sans-serif",
            editable: true
          },
          new go.Binding("text", "key")),
        // the collapse/expand button
        GO("PanelExpanderButton", "ATTRIBUTES",  // the name of the element whose visibility this button toggles
          { row: 0, alignment: new go.Spot(1,0),
              toolTip:  // define a tooltip for each node that displays the color as text
                  GO(go.Adornment, "Auto",
                      GO(go.Shape, { fill: "#FFFFCC" }),
                      GO(go.TextBlock, { margin: 2 }, "Show/hide attributes.")
                  )  // end of Adornment
              }),
        GO("DrillIntoButton", 
          { row: 0, alignment: new go.Spot(0.8,0),
              toolTip:  // define a tooltip for each node that displays the color as text
                  GO(go.Adornment, "Auto",
                      GO(go.Shape, { fill: "#FFFFCC" }),
                      GO(go.TextBlock, { margin: 2 }, "Show entity content")
                  )  // end of Adornment
              }),
        GO("ToggleEntityVisibilityButton", "ENTITY",  // the name of the element whose visibility this button toggles
          { row: 0, alignment: go.Spot.TopLeft,
              toolTip:  // define a tooltip for each node that displays the color as text
                  GO(go.Adornment, "Auto",
                      GO(go.Shape, { fill: "#FFFFCC" }),
                      GO(go.TextBlock, { margin: 2 }, "Hide this entity.")
                  )  // end of Adornment
          }),
        GO(go.Panel, "Vertical",
          {
            name: "ATTRIBUTES",
            row: 1,
            padding: 0,
            alignment: go.Spot.TopLeft,
            defaultAlignment: go.Spot.Left,
            stretch: go.GraphObject.Horizontal,
            itemTemplate: abstractEntityTemplate.attributeTemplate
          },
          new go.Binding("itemArray", "items")),
          GO(go.Panel, "Vertical", // spacer to prevent entity button from overlapping name.
              {
                  row: 2,
                  margin: 1,
                  alignment: go.Spot.TopLeft,
                  defaultAlignment: go.Spot.Left,
                  stretch: go.GraphObject.Horizontal,
              })
      ), // end Table Panel
        GO("ExpandEntityButton", "ENTITY",  // the name of the element whose visibility this button toggles
        { row: 0, alignment: go.Spot.BottomRight, margin: 5,
            toolTip:  // define a tooltip for each node that displays the color as text
                GO(go.Adornment, "Auto",
                    GO(go.Shape, { fill: "#FFFFCC" }),
                    GO(go.TextBlock, { margin: 2 }, "Show all entities linked to this one.")
                )  // end of Adornment
        })
    );  // end Node

  // define the Link template, representing a relationship
  var abstractRelationshipTableTemplate =
    GO(go.Node, "Auto",  // the whole node panel
      {
        name: "ENTITY",
        selectionAdorned: true,
        resizable: false,
        minSize: new go.Size(150,150),
        layoutConditions: go.Part.LayoutStandard & ~go.Part.LayoutNodeSized,
          portSpreading: go.Node.SpreadingNone,
        isShadowed: true,
        shadowColor: "#C5C1AA"
      },
      new go.Binding("location", "location").makeTwoWay(),
      // define the node's outer shape, which will surround the Table
      GO(go.Shape, "Diamond",
        { fill: templates.colors.lightgrad, stroke: "#756875", strokeWidth: 3 }),
      GO(go.Panel, "Table",
          { margin: new go.Margin(3,0,3,0), stretch: go.GraphObject.Fill, alignment: go.Spot.TopCenter  },
          GO(go.RowColumnDefinition, { row: 0, background: "#1199ff", sizing: go.RowColumnDefinition.None}),
          // the table header
          GO(go.TextBlock,
          {
            name: "TABLENAME",
            row: 0, alignment: go.Spot.Center,
            margin: new go.Margin(0, 75, 0, 75),  // leave room for Button
            font: "bold 16px sans-serif",
            editable: true
          },
          new go.Binding("text", "key")),        // the collapse/expand button
        GO("PanelExpanderButton", "ATTRIBUTES",  // the name of the element whose visibility this button toggles
          { row: 0, alignment: new go.Spot(1,0),
              toolTip:  // define a tooltip for each node that displays the color as text
                  GO(go.Adornment, "Auto",
                      GO(go.Shape, { fill: "#FFFFCC" }),
                      GO(go.TextBlock, { margin: 2 }, "Show/hide attributes.")
                  )  // end of Adornment
              }),
        GO("DrillIntoButton", 
          { row: 0, alignment: new go.Spot(0.8,0),
              toolTip:  // define a tooltip for each node that displays the color as text
                  GO(go.Adornment, "Auto",
                      GO(go.Shape, { fill: "#FFFFCC" }),
                      GO(go.TextBlock, { margin: 2 }, "Show entity content")
                  )  // end of Adornment
              }),
        GO("ToggleEntityVisibilityButton", "ENTITY",  // the name of the element whose visibility this button toggles
          { row: 0, alignment: go.Spot.TopLeft,
              toolTip:  // define a tooltip for each node that displays the color as text
                  GO(go.Adornment, "Auto",
                      GO(go.Shape, { fill: "#FFFFCC" }),
                      GO(go.TextBlock, { margin: 2 }, "Hide this entity.")
                  )  // end of Adornment
          }),
        GO(go.Panel, "Vertical",
          {
            name: "ATTRIBUTES",
            row: 1,
            padding: 0,
            alignment: go.Spot.TopLeft,
            defaultAlignment: go.Spot.Left,
            stretch: go.GraphObject.Horizontal,
            itemTemplate: abstractEntityTemplate.attributeTemplate
          },
          new go.Binding("itemArray", "items")),
          GO(go.Panel, "Vertical", // spacer to prevent entity button from overlapping name.
              {
                  row: 2,
                  margin: 1,
                  alignment: go.Spot.TopLeft,
                  defaultAlignment: go.Spot.Left,
                  stretch: go.GraphObject.Horizontal,
              })
      ), // end Table Panel
        GO("ExpandEntityButton", "ENTITY",  // the name of the element whose visibility this button toggles
        { row: 0, alignment: go.Spot.BottomRight, margin: 5,
            toolTip:  // define a tooltip for each node that displays the color as text
                GO(go.Adornment, "Auto",
                    GO(go.Shape, { fill: "#FFFFCC" }),
                    GO(go.TextBlock, { margin: 2 }, "Show all entities linked to this one.")
                )  // end of Adornment
        })
    );  // end Node



  // create the nodeTemplateMap, holding three node templates:
  var templmap = new go.Map("string", go.Node);
  // for each of the node categories, specify which template to use
  templmap.add("entity", abstractEntityTableTemplate);
  templmap.add("relationship", abstractRelationshipTableTemplate);
  templmap.add("", concreteTableTemplate.tableTemplate);

  abstractEntityTemplate.tableTemplateMap = templmap;

  templates.abstractEntityTemplate = abstractEntityTemplate;

  // DEFINE SOME FAKE DATA
  templates.fakeData = {};
  templates.fakeData.fakeAbstractEntityGraph = {
    abstractEntities : [
      {
        name: "AE1",
        table_names: [
            "Table 1",
            "Table 2"
        ]
      },
      {
        name: "AE2",
        table_names: [
            "Table 3",
            "Table 4",
            "Table 5"
        ]
      },
      {
        name: "AE3",
        table_names: [
          "Table 6"
        ]
      },
      {
        name: "AE4",
        table_names: [
            "Table 7"
        ]
      }
    ],
    abstractRelationships : [
      {
        name : "AR1",
        table_names: [
          "programs",
          "schools",
          "teachers"
        ],
        endpoints: ["AE1", "AE2", "AE3"]
      },
      {
        name : "AR2",
        table_names: [
            "Table 12",
            "Table 13" 
        ],
        endpoints: ["AE3", "AE4"]
      }

    ]
  }

  return templates;
});
