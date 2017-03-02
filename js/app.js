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

// returns true iff for each item in set1, no equal item is in set 2.
// set1, set2 are arrays
var areDisjoint = function(set1, set2) {
    for (let i = 0; i < set1.size; i++) {
        for (let j = 0; j < set2.size; j++) {
            if (set1[i] == set2[j]) return false;
        }
    }

    return true;
}

var areEqual = function(set1, set2) {
    for (let i = 0; i < set1.size; i++) {
        var found = false;
        for (let j = 0; j < set2.size; j++) {
            if (set1[i] == set2[j]) {
                found = true;
            }
        }
        if (found == false) return false;
    }

    return true;
}

// Abstraction algorithm. Should move somewhere more suitable.
var abstractionAlgorithm = function(relations) {
    // relations: a set of relations with their primary keys defined

    // that is, an array of objects like: = {primaryKey: [attrs], allAttrs = [attrs]}

    var abstractEntities = [];
    var abstractRelationships = [];
    var disjoint;

    // relations will be ordered as follows:
    // relations with the fewest attributes in the primary key first;
    // relations with the same primary key adjacent to each other.

    // add the first relation to the abstract entities array.
    abstractEntities.push([relations[0]]);

    // abstractEntities' primary key is the union of all pks of relations in it.

    var remainingRels = relations.copy();
    for (let i = 1; i < relations.size; i++) {
        if (relations[i].primaryKey == relations[i - 1].primaryKey) {
            // Add to current abstract entity.
            abstractEntities[abstractEntities.size - 1].push(relations[i]);
            // remove from relations remaining to process.
            remainingRels.splice(i, 1);
        } else {
            disjoint = true;
            // Check if this is disjoint with respect to existing abstract entities.
            for (let j = 0; j < abstractEntities.size; j++) {
                // disjoint: primary keys share no attributes.
                if (!areDisjoint(abstractEntities[j].primaryKey, relations[i].primaryKey)) {
                    disjoint = false;
                }
                // for (let k = 0; j < abstractEntities[j][0].primaryKey.size; k++) {
                //     for (let l = 0; l < relations[i].primaryKey.size; l++) {
                //         if (abstractEntities[j][0].primaryKey[k] == relations[i].primaryKey[l]) {
                //             disjoint = false;
                //         }
                //     }
                // }
            }

            // if disjoint, create new abstract entity.
            if (disjoint == true) {
                abstractEntities.push([relations[i]]);
                remainingRels.splice(i, 1);
            }
        }
    }

    // Next, pass over remainingRels again, adding more relations.
    relations = remainingRels.copy();

    for (let i = 0; i < relations.size; i++) {
        // add relations[i] to a cluster if it has an attr in common with said cluster
        // and no attrs in common with any other cluster.
        var hasCommonAttr = [];
        var noCommonAttr = [];

        for (let j = 0; j < abstractEntities.size; j++) {
            for (let k = 0; j < abstractEntities[j][0].primaryKey.size; k++) {
                for (let l = 0; l < relations[i].primaryKey.size; l++) {
                    if (abstractEntities[j][0].primaryKey[k] == relations[i].primaryKey[l]) {
                        hasCommonAttr.push(abstractEntities[j]);
                    } else {
                        noCommonAttr.push(abstractEntities[j]);
                    }
                }
            }
        }

        if (hasCommonAttr.size == 1) {
            hasCommonAttr[0].push(relations[i]);
            // remove from remainingRels
            remainingRels.slice(i, 1);
        }
    }

    // Finally, cluster the remaining tables to form abstract relationships.
    var firstRel = true;
    // For each R in remainingRels:
    relations = remainingRels.copy();
    for (let i = 0; i < relations.size; i++) {
        var intersections = [];

        // for each abstract entity
        for (let j = 0; j < abstractEntities.size; j++) {
            for (let k = 0; j < abstractEntities[j][0].primaryKey.size; k++) {
                for (let l = 0; l < relations[i].primaryKey.size; l++) {
                    // If the primary keys share an attribute, add this to intersections.
                    if (abstractEntities[j][0].primaryKey[k] == relations[i].primaryKey[l]) {
                        // intersections: list of abstract entities with which this relation intersects.
                        intersections.push(abstractEntities[j]);
                        break;
                    }
                }
            }
        }

        if (firstRel) {
            // indicate relationships
            var abstractRel = {
                name: "AR0",
                entities: intersections,
                rels: [relations[i]]
            }

            abstractRelationships.push(abstractRel);
            // doesn't work, might not be same length.
            remainingRels.slice(i, 1);
        } else {
            var found = false;
            var j = 0;
            while (j < abstractRelationships.size && !found) {
                // If this relation links the same entities as a previously defined one
                if (abstractRelationships[j].entities = intersections) {
                    abstractRelationships[j].rels.push(relations[i]);
                    remainingRels.slice(i, 1);
                }
            }

            if (!found) {
                // indicate relationships
                abstractRel = {
                    name: "AR0",
                    entities: intersections,
                    rels: [relations[i]]
                }

                abstractRelationships.push(abstractRel);
                // doesn't work, might not be same length.
                remainingRels.slice(i, 1);
            }
        }
    }
};