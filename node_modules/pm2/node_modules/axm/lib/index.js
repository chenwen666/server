
var Events      = require('./events.js');
var Actions     = require('./actions.js');
var Notify      = require('./notify.js');
var Transaction = require('./transaction.js');

var util        = require('util');

var Export  = {};

/**
 * Flatten API
 */

util._extend(Export, Events);
util._extend(Export, Actions);
util._extend(Export, Notify);
util._extend(Export, Transaction);

/**
 * Export
 */

module.exports = Export;
