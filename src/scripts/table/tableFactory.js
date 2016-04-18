var get = require("./get"),
    recursiveDelete = require("./recursiveDelete"),
    formatDateString = require("../row/formatDateString"),
    model = require("../model/modelFactory"),
    ImmDictionary = require("./ImmutableDictionary"),
    post = require("./post");

module.exports = function tableFactory(tn, fullModel, db) {
    "use strict";
    // TODO: data should be a hash-map, because each PK value is unique
    var rows = new ImmDictionary(), // table's private data
        m = model(tn, fullModel); // table's model instance

    return {
        // SELECT
        get: function(id) {
            return id ? rows.get(id) : rows.all();
        },
        // INSERT, should create new array
        post: function(d) {
            // make sure pk is unique
            if (rows.has(d[m.primary])) {
                throw Error("provided " + m.primary + ": " + d[m.primary] + " is already in use in " + tn);
            } else {
                rows.add(d[m.primary], post(m, d, tn, db));

                return this.get(d[m.primary]);
            }
        },
        // UPDATE, should create new Array and new Row
        put: function(d, pkValue) {
            // find current object
            var current = rows.get(pkValue || d[m.primary]),
                differs = false,
                extendedBy,
                k;

            // throw if unfound
            if (!current) {
                throw Error("Cannot update a non-existent Object, id: " + pkValue);
            }

            // compile new values, keeping only own values
            // check if the PUT operation will actually change something
            // for in also looks up prototypes
            for (k in current) {
                if (current[k] === null || typeof current[k] !== "object") {
                    if (d[k] === undefined) {
                        d[k] = current[k];
                    } else if (d[k] !== current[k]) {
                        // re-validate if type is datetime
                        if (m.fields[k] && m.fields[k].dataType === "datetime") {
                            differs = !differs ? formatDateString(d[k]) !== current[k] : true;
                        } else {
                            differs = true;
                        }
                    }
                }
            }

            // if differences have been detected
            if (differs) {
                if (m.extendedBy && m.extendedBy.some(function(e) {
                        if (!!db[e.foreignTable].get(current[e.localField])) {
                            extendedBy = e;
                            return true;
                        }
                    })) {
                    d[extendedBy.foreignField] = d[extendedBy.localField];
                    return db[extendedBy.foreignTable].put(d);
                } else {
                    // remove existing object
                    this.delete(pkValue || current[m.primary]);

                    // re-create new object
                    return this.post(d);
                }
            } else {
                return current;
            }
        },
        delete: function(id) {
            if (rows.has(id)) {
                // jumps from table to table, eliminating youngest child and up
                recursiveDelete(rows.get(id), m, db);

                // eliminate self
                return rows.remove(id);
            } else {
                throw Error("Cannot delete non existent object id: " + id + "\nin " + tn);
            }
        },
        meta: m
    };
};
