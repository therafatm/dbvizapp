(function() {
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

    // TODO: get from $.getJSON or ajax call instead.
    var nodeDataArray = [
        { key: "Products",
            items: [ { name: "ProductID", iskey: true},
                { name: "ProductName", iskey: false},
                { name: "SupplierID", iskey: false},
                { name: "CategoryID", iskey: false} ] },
        { key: "Suppliers",
            items: [ { name: "SupplierID", iskey: true},
                { name: "CompanyName", iskey: false},
                { name: "ContactName", iskey: false},
                { name: "Address", iskey: false} ] }
    ];

    // TODO: get form $.getJSON or ajax call instead.
    var linkDataArray = [
        { from: "Products", to: "Suppliers", fromText: "0..N", toText: "1" },
    ];

    diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
}());
