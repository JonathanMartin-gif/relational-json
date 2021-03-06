"use strict";

var buildAliasMap = require("../buildModel/Model/buildAliasMap"),
    dictionaryFactory = require("./dictionaryFactory"),
    get = require("./get"),
    put = require("./put"),
    post = require("./post"),
    remove = require("./remove");

/**
 * @typedef {object} Table
 * @summary Once relational-json parsed your schema, it will return your relational database, which will be a collection of all the Tables in your data.
 * Each Table uses an internal Dictionary to store, retrieve and manipulate it's data (rows).
 * Tables are essentially the interface through which you manipulate data.
 */

module.exports = function tableFactory(model, db) {
    var tableData = dictionaryFactory();

    return Object.freeze({
        /**
         * @function
         * @name Table#get
         *
         * @summary returns row data matching the provided arguments on their primary field value
         * @returns {object|object[]}
         * if no argument is provided, it returns an array of all data within the table.
         * if 1 argument is provided, it returns that row object
         * if many arguments are provided, it returns an array containing those row objects
         */
        get: function() {
            return get(arguments, tableData);
        },

        /**
         * @function
         * @name Table#post
         *
         * @summary creates a new row of data
         * @param {object} d - data bundle, must contain all required fields
         * @returns {object} row instance created
         */
        post: function(d, pkValue) {
            var row;

            if (tableData.hasKey(pkValue || d[model.primary])) {
                throw Error("provided " + model.primary + ": " + d[model.primary] + " is already in use in " + model.tableName);
            } else {
                row = post(model, db, d);
                tableData.set(row[model.primary], row);

                return row;
            }
        },

        /**
         * @function
         * @name Table#put
         *
         * @summary modifies a data row, by re-creating the row merged with the new data
         * @param {object} d - field:value object of data to modify
         * @param {*} pkValue=d.primary - primary value to find row to modify
         * @returns {object} newly created row
         */
        put: function(d, pkValue) {
            if (tableData.hasKey(pkValue || d[model.primary])) {
                return put(
                    model,
                    db,
                    tableData.get(pkValue || d[model.primary]),
                    d
                );
            } else {
                throw Error("Cannot update a non-existent Object, id: " + pkValue + " for table " + model.tableName);
            }
        },

        /**
         * @function
         * @name Table#delete
         *
         * @summary recursively deletes the target row and it's children (if any)
         * @param {*} id - primary field value of row to delete
         * @returns {object} deleted row
         */
        delete: function(id) {
            var target = tableData.get(id);

            if (target) {
                tableData.remove(id);
                return remove(model, db, target);
            } else {
                throw Error("Cannot delete non existent object id: " + id + " in " + model.tableName);
            }
        },

        /**
         * @name Table#meta
         * @type {object}
         *
         * @property {string} name - Table's property key in the relational-json database
         * @property {string} pk - name of the Table's primary field
         * @property {string} primary - alias of Table.meta.pk
         * @property {object} aliasMap - hashmap of the the table's rows' properties pointing to other tables in the relational-json database
         * @property {string[]} ownRequiredFields - list of all own required fields, which must have a value at all times
         * @property {string[]} allRequiredFields - list of all required fields, including own & ancestors' required fields
         * @summary partial interface into the Table's inner details
         */
        meta: Object.freeze(
            Object.create(null, {
                name: {
                    value: model.tableName,
                    enumerable: true
                },
                pk: {
                    value: model.primary,
                    enumerable: true
                },
                primary: {
                    value: model.primary
                },
                aliasMap: {
                    value: Object.freeze(buildAliasMap(model)),
                    enumerable: true
                },
                ownRequiredFields: {
                    value: model.getRequiredFields("own"),
                    enumerable: true
                },
                allRequiredFields: {
                    value: model.getRequiredFields("all"),
                    enumerable: true
                }
            })
        )
    });
};
