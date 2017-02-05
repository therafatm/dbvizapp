app.service('goService', function() {

	var GO = go.GraphObject.make;

	 // define several shared Brushes for drawing go elements
  var bluegrad = GO(go.Brush, "Linear", { 0: "rgb(150, 150, 250)", 0.5: "rgb(86, 86, 186)", 1: "rgb(86, 86, 186)" });
  var greengrad = GO(go.Brush, "Linear", { 0: "rgb(158, 209, 159)", 1: "rgb(67, 101, 56)" });
  var redgrad = GO(go.Brush, "Linear", { 0: "rgb(206, 106, 100)", 1: "rgb(180, 56, 50)" });
  var yellowgrad = GO(go.Brush, "Linear", { 0: "rgb(254, 221, 50)", 1: "rgb(254, 182, 50)" });
  var lightgrad = GO(go.Brush, "Linear", { 1: "#E6E6FA", 0: "#FFFAF0" });

	// the template for each attribute in a node's array of item data
  var attributeTemplate =
    GO(go.Panel, "Horizontal",
      GO(go.Shape,
        { desiredSize: new go.Size(10, 10) },
        new go.Binding("figure", "figure"),
        new go.Binding("fill", "color")),
      GO(go.TextBlock,
        { stroke: "#333333",
          font: "bold 14px sans-serif" },
        new go.Binding("text", "name"))
    );

  // define the Node template, representing an entity
  var tableTemplate =
    GO(go.Node, "Auto",  // the whole node panel
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
        { fill: lightgrad, stroke: "#756875", strokeWidth: 3 }),
      GO(go.Panel, "Table",
        { margin: 8, stretch: go.GraphObject.Fill },
        GO(go.RowColumnDefinition, { row: 0, sizing: go.RowColumnDefinition.None }),
        // the table header
        GO(go.TextBlock,
          {
            row: 0, alignment: go.Spot.Center,
            margin: new go.Margin(0, 14, 0, 2),  // leave room for Button
            font: "bold 16px sans-serif"
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
            padding: 3,
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

	this.drawSchema = () => {
	    var diagram =
	        GO(go.Diagram, "databaseDiagram",
	            {
	                initialContentAlignment: go.Spot.Center, // center Diagram contents
	                "undoManager.isEnabled": true, // enable Ctrl-Z to undo and Ctrl-Y to redo
	                allowDelete: false,
	                allowCopy: false,
	                layout: GO(go.ForceDirectedLayout)
	            });

    diagram.nodeTemplate = tableTemplate
		diagram.linkTemplate = relationshipTemplate

		diagram.model = new go.GraphLinksModel(this.fakeData.nodeDataArray, this.fakeData.linkDataArray);
	};

  // FAKE DATA
  this.fakeData = {};
    // create the model for the E-R diagram
  this.fakeData.nodeDataArray = [
  { key: "Products",
    items: [ { name: "ProductID", iskey: true, figure: "Decision", color: yellowgrad },
        { name: "ProductName", iskey: false, figure: "Cube1", color: bluegrad },
        { name: "SupplierID", iskey: false, figure: "Decision", color: "purple" },
        { name: "CategoryID", iskey: false, figure: "Decision", color: "purple" } ] },
  { key: "Suppliers",
    items: [ { name: "SupplierID", iskey: true, figure: "Decision", color: yellowgrad },
        { name: "CompanyName", iskey: false, figure: "Cube1", color: bluegrad },
        { name: "ContactName", iskey: false, figure: "Cube1", color: bluegrad },
        { name: "Address", iskey: false, figure: "Cube1", color: bluegrad } ] },
  { key: "Categories",
    items: [ { name: "CategoryID", iskey: true, figure: "Decision", color: yellowgrad },
        { name: "CategoryName", iskey: false, figure: "Cube1", color: bluegrad },
        { name: "Description", iskey: false, figure: "Cube1", color: bluegrad },
        { name: "Picture", iskey: false, figure: "TriangleUp", color: redgrad } ] },
  { key: "Order Details",
    items: [ { name: "OrderID", iskey: true, figure: "Decision", color: yellowgrad },
        { name: "ProductID", iskey: true, figure: "Decision", color: yellowgrad },
        { name: "UnitPrice", iskey: false, figure: "MagneticData", color: greengrad },
        { name: "Quantity", iskey: false, figure: "MagneticData", color: greengrad },
        { name: "Discount", iskey: false, figure: "MagneticData", color: greengrad } ] },
  ];
  this.fakeData.linkDataArray = [
    { from: "Products", to: "Suppliers" },
    { from: "Products", to: "Categories" },
    { from: "Order Details", to: "Products" }
  ];
});