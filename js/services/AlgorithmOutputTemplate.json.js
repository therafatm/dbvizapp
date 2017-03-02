// primary key data structure
{
  table: "TableId",
  primaryKey: [col1, col2, col3,...] // represents the attributes of the primary key of the table
}


// the data structure for the abstract entities
{
  primaryKeys:[ PK1, PK2, PK3, ...], // represents the different sets of primary keys in this entity
  name : "AbstractEntityID"
}

// a abstract relationship structure
{
  primaryKeys: [PK1, PK2, PK3, ...], // the different sets of primary keys in this relationship 
  name: "AbstractRelationshipID",
  endpoints: [ "Id1", "Id2"] // an array representing the endpoints of the relationship.
}