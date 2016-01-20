/**
 * Attempts to validate data formats based on MySQL requirements & best-practices.
 * @param {object} field - field-portion of the model
 * @param {*} value - value to test against field's dataType
 * @returns {boolean}
 */
module.exports = function validateDataType(field, value) {
    "use strict";
    // expected types: string, integer, float, date, time, datetime, boolean
    var trueType = Object.prototype.toString.call(value),
        res = false;

    // minimal structure expected from field arg
    if (field.allowNull === undefined || field.dataType === undefined) {
        throw Error("validateDataType expects a proper field description.\nExpected properties 'allowNull' and 'dataType'.\nProvided: " + JSON.stringify(field));
    }

    // exception for nullable fields
    if (field.allowNull === true && value === null) {
        return true;
    }

    switch (field.dataType) {
        case "string": {
            res = trueType === "[object String]";
            break;
        }

        case "integer": {
            res = trueType === "[object Number]" && /^[-+]?\d{1,20}$/.test(value.toString());
            break;
        }

        case "float": {
            res = trueType === "[object Number]" && /^[-+]?\d{1,20}(?:\.\d{1,20})?$/.test(value.toString());
            break;
        }

        case "boolean": {
            res = trueType === "[object Boolean]" && (value === true || value === false) || (value === 1 || value === 0);
            break;
        }

        case "date": {
            // validates iso format: yyyy-mm-dd
            res = trueType === "[object String]" && /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/.test(value);
            break;
        }

        case "datetime": {
            var fullTest = /^([0-9]{4})(\-0[1-9]|\-1[0-2])?(\-[0-2][0-9]|\-3[0-1])?(T(?=\d)([0-5][0-9]:)?([0-5][0-9])?(:[0-5][0-9])?(\.\d{1,3})?(Z|([\-\+](0[0-9]|1[0-4]):(00|15|30|45))))?$/;

            res = trueType === "[object String]" && fullTest.test(value);
            break;
        }

        case "time": {
            res = trueType === "[object String]" && /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}(\.[0-9]{1,6})?$/.test(value);
            break;
        }

        default: {
            throw new Error("Incompatible dataType:" + trueType);
        }
    }

    return res;
};
