_ = require "lodash"

class Util

  parseDependencies:(fn)->
    params = fn.toString()
      .replace( /\n/g, ' ' )
      .match( /function\s+\w*\s*\((.*?)\)/ )[1].split( /\s*,\s*/ )

    _.compact(_.map(params, (p)-> p.trim()))



module.exports = new Util