/**
 * Datastores
 * (sails.config.datastores)
 *
 * A set of datastore configurations which tell Sails where to fetch or save
 * data when you execute built-in model methods like `.find()` and `.create()`.
 *
 * For more information on configuring datastores, check out:
 * https://sailsjs.com/config/datastores
 */

module.exports.datastores = {

  /***************************************************************************
  *                                                                          *
  * Default datastore configuration.                                         *
  * Dynamically detects if environment variables for PostgreSQL are set      *
  * and falls back to local sails-disk (file-based) database for             *
  * development convenience if not.                                          *
  *                                                                          *
  ***************************************************************************/

  default: {
    // Dynamically switch adapter based on environment
    adapter: process.env.DB_ADAPTER || 'sails-disk',

    // Connection URL (required for PostgreSQL)
    // E.g. 'postgresql://user:password@host:port/database'
    url: process.env.DATABASE_URL || undefined,
  },

};
