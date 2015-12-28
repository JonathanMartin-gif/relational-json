# Relational JSON
### Converts a JSON data-schema into a relational data store
Takes a JSON data structure and converts it into a database-like module allowing easy CRUD operations on immutable & relational objects (*no data duplication*).

## Installation
```
npm install relational-json --save
```

## JSON data structure
Create your relational data-structure (*JSON format*) following the instructions below:

### Tables
Your JSON data structure can contain any amount of tables. Each table must respect the following points:
- Table names must be unique.
- Tables must have a **primary** property (*the name of the primary field of the table*)
- Tables must have fields, which minimally contains the primary field of the table.
```js
{
  "TableName": {
    "fields": {}, // fields or columns of the data table
    "primary": "", // primary field of the table
    "aggregates": [], // relations to other tables
    "extends": "", // parent table (inheritance) 
    "extendedBy": [] // child tables (inheritance)
  }
}
```

### Table fields
Every Table in your relational structure must have fields. Fields describe the nature of your data and the constraints that relational-json will enforce during POST and PUT operations.
Fields have the following properties:
- **dataType**: the primitive type of your data. Supported types are:
  - string
  - date (*ISO format*)
  - time (*ISO format, no timezone*)
  - datetime (*ISO format, no timezone*)
  - integer
  - float
  - boolean (*true, false, 0, 1*)
- **allowNull**: whether the value can be set to *null* or not.
- **defaultValue**: the default value used on a POST operation, if no value is provided.
  
#### Table fields, example
```js
{
  "TableName": {
    "primary": "id",
    "fields": {
      "id": {
        "allowNull": false,
        "dataType": "integer"
      },
      "title": {
        "allowNull": false,
        "dataType": "string"
      },
      "is_active": {
        "allowNull": false,
        "defaultValue": 1,
        "dataType": "boolean"
      }
    }
  }
}
```

### Table extends
Tables can extend a parent table, which means that each object from the child table will have a prototype object from the parent table. 
The **extends** property is an object containing the following properties:
- **table**: the parent table name
- **local**: the local field (*child table*) used for the relation. (*equivalent to a foreign key (FK) field in SQL*)
- **foreign**: the parent table field used for the relation. *usually the PK of the foreign table*

When a table extends another, the child object cannot exist without the parent object. When you POST on a child table, relational-json will try two things:
- If the parent table contains an entry with a PK value equal to value of the child's extension field, that parent becomes the child's prototype.
- If no existing parent is found for a given PK, the parent is created using the provided data. (*This means that you must provide all required fields for all ancestors of a table on POST*)

#### Table extends example
```js
{
  "TableA": {
    "primary": "id",
    "fields": {
      "id": {
        "allowNull": false,
        "dataType": "integer"
      },
      "name": {
        "allowNull": false,
        "dataType": "string"
      }
    }
  },
  "TableB": {
    "primary": "id",
    "fields": {
      "id": {
        "allowNull": false,
        "dataType": "integer"
      },
      "job_title": {
        "allowNull": false,
        "dataType": "string"
      }
    },
    "extends": {
      "table": "TableA",
      "local": "id", // refers to TableB.id
      "foreign": "id" // refers to TableA.id
    }
  }
}
```

### Table extendedBy
A table can be extended by child tables, this is essentially the same as *extends*, but from the parent table's point of view. This allows the parent table's objects to refer to their children.
The `extendedBy` property is an array of objects with the following properties:
- **foreignTable**: the table that is a child of the current table.
- **localField**: local field used for the relation.
- **foreignField**: foreign field used for the relation.

#### Table extendedBy example
If we take the previous example, we can add the `extendedBy` property to `TableA`:
```js
{
  "TableA": {
    "primary": "id",
    "fields": {
      "id": {
        "allowNull": false,
        "dataType": "integer"
      },
      "name": {
        "allowNull": false,
        "dataType": "string"
      }
    },
    // added extendedBy information to relate to children
    "extendedBy": [
      {
        "foreignTable": "TableB",
        "localField": "id",
        "foreignField": "id"
      }
    ]
  },
  "TableB": {
    "primary": "id",
    "fields": {
      "id": {
        "allowNull": false,
        "dataType": "integer"
      },
      "job_title": {
        "allowNull": false,
        "dataType": "string"
      }
    },
    "extends": {
      "table": "TableA",
      "local": "id", // refers to TableB.id
      "foreign": "id" // refers to TableA.id
    }
  }
}
```
