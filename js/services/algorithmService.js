app.service('algorithmService', function() {

    this.getPK = function (table) {
        // Filer: return elements that meet a condition
        var PKCols = _.filter(table.cols, function (col) {
            return (col.primaryKey == true);
        });

        // pluck: extract a property from the list.
        return _.pluck (PKCols, 'col_name');
    }

    this.orderTablesByPK = function (tables) {
        // split into lists based on PK length, ensuring that same PKs are side by side.
        var that = this;
        return _.sortBy(tables, function (table) {
            var pkString = "";
            var pk = that.getPK(table);

            pk.sort();

            _.each(pk, function(colName) {
               pkString += colName;
            });

            return pkString;
        });
    }

    // returns true iff for each item in set1, no equal item is in set 2.
    // set1, set2 are arrays
    this.areSetsDisjoint = function (set1, set2) {
        for (let i = 0; i < set1.length; i++) {
            for (let j = 0; j < set2.length; j++) {
                if (set1[i] == set2[j]) return false;
            }
        }

        return true;
    }

    this.areSetsEqual = function (set1, set2) {
        var found;
        // Everything in set 1 is in set 2
        for (let i = 0; i < set1.length; i++) {
            found = false;
            for (let j = 0; j < set2.length; j++) {
                if (set1[i] == set2[j]) {
                    found = true;
                }
            }
            if (found == false) return false;
        }

        // Everything in set 2 is in set 1
        for (let i = 0; i < set2.length; i++) {
            found = false;
            for (let j = 0; j < set1.length; j++) {
                if (set2[i] == set1[j]) {
                    found = true;
                }
            }
            if (found == false) return false;
        }

        return true;
    }

    this.addTable = function (abstractEntity, table) {
        // Add table's primary key to entity's primary key.
        // Only add new columns
        var tablePK = this.getPK(table);

        for (let i = 0; i < tablePK.length; i++) {
            if (abstractEntity.primaryKey.indexOf(tablePK[i]) === -1) {
                abstractEntity.primaryKey.push(tablePK[i]);
            }
        }

        // Add table's name to abstract entity tables
        abstractEntity.table_names.push(table.table_name);
    }

    // Abstraction algorithm. Should move somewhere more suitable.
    this.clusterRelations = function (relations) {
        // relations: a set of tables with their primary keys defined.

        // Table structure:
        // table = {
        //   name: "table_name",
        //   cols: [{name: "name1", PK = true}, {name: "name2", PK = false}]
        // }

        this.orderTablesByPK(relations);

        var abstractEntities = [];
        var abstractRelationships = [];
        var disjoint;

        // relations will be ordered as follows:
        // relations with the fewest attributes in the primary key first;
        // relations with the same primary key adjacent to each other.

        // add the first relation to the abstract entities array.
        var firstEntity = {
            name: "AE0",
            primaryKey: [],
            table_names: []
        };

        // abstractEntities' primary key is the union of all pks of tables in it.
        // This combination is done in 'addTable'.
        this.addTable(firstEntity, relations[0]);
        abstractEntities.push(firstEntity);

        // relations is the set on which we iterate.
        // Remove processed tables from remainingRels.
        var remainingRels = relations.slice();
        remainingRels.splice(0, 1);
        var numAEs = 1;
        for (let i = 1; i < relations.length; i++) {
            if (this.areSetsEqual(this.getPK(relations[i]), this.getPK(relations[i - 1]))) {
                // Add to current abstract entity.
                this.addTable(abstractEntities[numAEs - 1], relations[i]);

                // remove from relations remaining to process.
                remainingRels.splice(remainingRels.indexOf(relations[i]), 1);
            } else {
                disjoint = true;
                // Check if this is disjoint with respect to existing abstract entities.
                for (let j = 0; j < abstractEntities.length; j++) {
                    // disjoint: primary keys share no attributes.
                    if (!this.areSetsDisjoint(abstractEntities[j].primaryKey, this.getPK(relations[i]))) {
                        disjoint = false;
                    }
                }

                // if disjoint, create new abstract entity.
                if (disjoint == true) {
                    var newEntity = {
                        name: "AE" + numAEs,
                        primaryKey: [],
                        table_names: []
                    };
                    this.addTable(newEntity, relations[i]);
                    abstractEntities.push(newEntity);
                    remainingRels.splice(remainingRels.indexOf(relations[i]), 1);
                }
            }
        }

        // Next, pass over remainingRels again, adding more relations.
        relations = remainingRels.slice();
        for (let i = 0; i < relations.length; i++) {
            // add relations[i] to a cluster if it has an attr in common with said cluster
            // and no attrs in common with any other cluster.
            var hasCommonAttr = [];

            for (let j = 0; j < abstractEntities.length; j++) {
                if (!this.areSetsDisjoint(abstractEntities[j].primaryKey, this.getPK(relations[i]))) {
                    hasCommonAttr.push(abstractEntities[j]);
                }
            }

            // Common attrs with only one abstract entity.
            if (hasCommonAttr.length == 1) {
                this.addTable(hasCommonAttr[0], relations[i]);
                // remove from remainingRels
                remainingRels.splice(remainingRels.indexOf(relations[i]), 1);
            }
        }

        // Finally, cluster the remaining tables to form abstract relationships.
        var firstRel = true;
        var numRels = 0;
        // For each R in remainingRels:
        relations = remainingRels.slice();
        for (let i = 0; i < relations.length; i++) {
            var intersections = [];

            // for each abstract entity
            for (let j = 0; j < abstractEntities.length; j++) {
                if (!this.areSetsDisjoint(abstractEntities[j].primaryKey, this.getPK(relations[i]))) {
                    intersections.push(abstractEntities[j]);
                }
            }

            if (firstRel) {
                // indicate relationships
                var abstractRel = {
                    name: "AR0",
                    endpoints: _.pluck(intersections, 'name'),
                    primaryKey: [],
                    table_names: []
                }
                numRels = 1;

                this.addTable(abstractRel, relations[i]);

                abstractRelationships.push(abstractRel);

                remainingRels.splice(remainingRels.indexOf(relations[i]), 1);
            } else {
                var found = false;
                var j = 0;
                while (j < abstractRelationships.length && !found) {
                    // If this relation links the same entities as a previously defined one
                    if (this.areSetsEqual(abstractRelationships[j].abstract_entities, intersections)) {
                        this.addTable(abstractRelationships[j], relations[i]);
                        remainingRels.splice(remainingRels.indexOf(relations[i]), 1);
                    }
                }

                if (!found) {
                    // indicate relationships
                    abstractRel = {
                        name: "AR" + numRels,
                        endpoints: _.pluck(intersections, 'name'),
                        primaryKey: [],
                        table_names: []
                    }

                    numRels++;

                    this.addTable(abstractRel, relations[i]);
                    abstractRelationships.push(abstractRel);
                    // doesn't work, might not be same length.
                    remainingRels.splice(remainingRels.indexOf(relations[i]), 1);
                }
            }
        }

        return {
            entities: abstractEntities,
            relationships: abstractRelationships
        }
    };
});