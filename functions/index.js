/**
 * Handles auth functions
 */
exports.auth = require("./src/auth");

/**
 * Handles conversation functions
 */
exports.conversations = require("./src/conversations");

/**
 * Handles songmates functions
 */
exports.songmates = require("./src/songmates");

/**
 * Handles songstory functions
 */
exports.songstory = require("./src/songstory");

/**
 * Handles user functions
 */
exports.user = require("./src/user");

/**
 * Handles payment using Stripe
 */

exports.payment = require("./src/payment");
