"use strict";

var getFurthestChild = require("./utils/getFurthestChild"),
    getParent = require("./utils/getParent");

/**
 * deletes from furthestChild, all the way up to self
 * @param model
 * @param db
 * @param target
 */
function recursiveDelete(model, db, target) {
    var next = getFurthestChild(model, db, target);

    // delete rows from child upwards until target has been deleted
    while (db[model.tableName].hasKey(target[model.primary])) {
        next = getParent(
            next.model,
            db[next.model.tableName].delete(next.row[next.model.primary])
        );
    }

    return target;
}

module.exports = recursiveDelete;
