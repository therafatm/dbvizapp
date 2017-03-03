var app = angular.module('dbVizApp', ['ngRoute', 'ui.bootstrap']);

app.config(function($routeProvider, $compileProvider) {

    // Allows image download link (data).
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);

    $routeProvider
      //   .when('/', {
      //      templateUrl: '/views/partials/main.html'
      //  })
        .when('/schema/:id', {
            templateUrl: '/views/partials/schema.html'
        })
        .when('/', {
            templateUrl: '/views/partials/material-main.html'
        });
});

var orderTablesByPK = function(tables) {
    // split into lists based on PK length
    return _.sortBy(tables, function(table) {
        return getPK(table).size;
    });
}

// returns true iff for each item in set1, no equal item is in set 2.
// set1, set2 are arrays
var areSetsDisjoint = function(set1, set2) {
    for (let i = 0; i < set1.size; i++) {
        for (let j = 0; j < set2.size; j++) {
            if (set1[i] == set2[j]) return false;
        }
    }

    return true;
}

var areSetsEqual = function(set1, set2) {
    // Everything in set 1 is in set 2
    for (let i = 0; i < set1.size; i++) {
        var found = false;
        for (let j = 0; j < set2.size; j++) {
            if (set1[i] == set2[j]) {
                found = true;
            }
        }
        if (found == false) return false;
    }

    // Everything in set 2 is in set 1
    for (let i = 0; i < set2.size; i++) {
        var found = false;
        for (let j = 0; j < set1.size; j++) {
            if (set2[i] == set1[j]) {
                found = true;
            }
        }
        if (found == false) return false;
    }

    return true;
}

var getPK = function(table) {
    return _.filter(table.cols, function(col) {
        return (col.PK == true);
    });
}

var addTable = function(abstractEntity, table) {
    // Add table's primary key to entity's primary key.
    abstractEntity.PK.concat(getPK(table));

    // Add table's name to abstract entity tables
    abstractEntity.table_names.push(table.name);
}

// Abstraction algorithm. Should move somewhere more suitable.
var abstractionAlgorithm = function(relations) {
    // relations: a set of tables with their primary keys defined.

    // Table structure:
    // table = {
    //   name: "table_name",
    //   cols: [{name: "name1", PK = true}, {name: "name2", PK = false}]
    // }

    var abstractEntities = [];
    var abstractRelationships = [];
    var disjoint;

    // relations will be ordered as follows:
    // relations with the fewest attributes in the primary key first;
    // relations with the same primary key adjacent to each other.

    // add the first relation to the abstract entities array.
    var firstEntity = {
        name: "AE0",
        PK: [],
        table_names: []
    };

    addTable(firstEntity, relations[0]);
    abstractEntities.push(firstEntity);

    // abstractEntities' primary key is the union of all pks of tables in it.

    // relations is the set on which we iterate.
    // Remove processed tables from remainingRels.
    var remainingRels = relations.copy();
    var numAEs = 1;
    for (let i = 1; i < relations.size; i++) {
        if (areSetsEqual(getPK(relations[i]), getPK(relations[i - 1]))) {
            // Add to current abstract entity.
            addTable(abstractEntities[numAEs - 1], relations[i]);

            // remove from relations remaining to process.
            remainingRels.splice(remainingRels.indexOf(relations[i]), 1);
        } else {
            disjoint = true;
            // Check if this is disjoint with respect to existing abstract entities.
            for (let j = 0; j < abstractEntities.size; j++) {
                // disjoint: primary keys share no attributes.
                if (!areSetsDisjoint(abstractEntities[j].PK, getPK(relations[i]))) {
                    disjoint = false;
                }
            }

            // if disjoint, create new abstract entity.
            if (disjoint == true) {
                var newEntity = {
                    name: "AE" + numAEs,
                    PK: [],
                    table_names: []
                };
                addTable(newEntity, relations[i]);
                abstractEntities.push(newEntity);
                remainingRels.splice(remainingRels.indexOf(relations[i]), 1);
            }
        }
    }

    // Next, pass over remainingRels again, adding more relations.
    relations = remainingRels.copy();
    for (let i = 0; i < relations.size; i++) {
        // add relations[i] to a cluster if it has an attr in common with said cluster
        // and no attrs in common with any other cluster.
        var hasCommonAttr = [];

        for (let j = 0; j < abstractEntities.size; j++) {
            if (!areSetsDisjoint(abstractEntities[j].PK, getPK(relations[i]))) {
                hasCommonAttr.push(abstractEntities[j]);
            }
        }

        // Common attrs with only one abstract entity.
        if (hasCommonAttr.size == 1) {
            addTable(hasCommonAttr[0], relations[i]);
            // remove from remainingRels
            remainingRels.splice(remainingRels.indexOf(relations[i]), 1);
        }
    }

    // Finally, cluster the remaining tables to form abstract relationships.
    var firstRel = true;
    var numRels = 0;
    // For each R in remainingRels:
    relations = remainingRels.copy();
    for (let i = 0; i < relations.size; i++) {
        var intersections = [];

        // for each abstract entity
        for (let j = 0; j < abstractEntities.size; j++) {
            if (!areSetsDisjoint(abstractEntities[j].PK, getPK(relations[i]))) {
                intersections.push(abstractEntities[j]);
            }
        }

        if (firstRel) {
            // indicate relationships
            var abstractRel = {
                name: "AR0",
                abstract_entities: intersections,
                PK: [],
                table_names: []
            }
            numRels = 1;

            addTable(abstractRel, relations[i]);

            abstractRelationships.push(abstractRel);

            remainingRels.splice(remainingRels.indexOf(relations[i]), 1);
        } else {
            var found = false;
            var j = 0;
            while (j < abstractRelationships.size && !found) {
                // If this relation links the same entities as a previously defined one
                if (areSetsEqual(abstractRelationships[j].abstract_entities, intersections)) {
                    addTable(abstractRelationships[j], relations[i]);
                    remainingRels.splice(remainingRels.indexOf(relations[i]), 1);
                }
            }

            if (!found) {
                // indicate relationships
                abstractRel = {
                    name: "AR" + numRels,
                    abstract_entities: intersections,
                    PK: [],
                    table_names: []
                }

                numRels++;

                addTable(abstractRel, relations[i]);
                abstractRelationships.push(abstractRel);
                // doesn't work, might not be same length.
                remainingRels.splice(remainingRels.indexOf(relations[i]), 1);
            }
        }
    }
};