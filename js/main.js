var gojs = function() {
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

    // What we will have: the result of a pair of SQL queries
    // Representation
    var query1 = [
        { table_name: "students", column_name: "student_id", column_key: "PRI" },
        { table_name: "students", column_name: "first_name", column_key: "" },
        { table_name: "students", column_name: "last_name", column_key: "" },
        { table_name: "students", column_name: "program_id", column_key: "MUL" },
        { table_name: "students", column_name: "school_id", column_key: "MUL" },
        { table_name: "programs", column_name: "program_id", column_key: "PRI" },
        { table_name: "programs", column_name: "program_name", column_key: "" },
        { table_name: "schools", column_name: "school_id", column_key: "PRI" },
        { table_name: "schools", column_name: "school_name", column_key: ""	}
    ];

    // convert to node data array
    var nodeDataArray = [];

    for (var i = 0; i < query1.length; i++) {
        var tbl_name = query1[i].table_name;
        var existing_tbl = _.where(nodeDataArray, {key: tbl_name});

        if (existing_tbl && existing_tbl.length > 0) {
            existing_tbl[0].items.push({name: query1[i].column_name, isKey: (query1[i].column_key == "PRI")});
        } else {
            var new_tbl = {key: tbl_name, items: [ {name: query1[i].column_name, isKey: (query1[i].column_key == "PRI")}]};
            nodeDataArray.push(new_tbl);
        }
    }

    var query2 = [
        { constraint_name: "Program", table_name: "students", column_name: "program_id",
            referenced_table_name: "programs", referenced_column_name: "program_id" },
        { constraint_name: "School", table_name: "students", column_name: "school_id",
            referenced_table_name: "schools", referenced_column_name: "school_id"}
    ];

    var linkDataArray = [
        //{ from: "students", to: "schools", fromText: "0..N", toText: "1" },
    ];

    for (var j = 0; j < query2.length; j++) {
        linkDataArray.push({from: query2[j].table_name, to: query2[j].referenced_table_name,
            fromText: query2[j].constraint_name, toText: "blah"});
    }

    diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
};