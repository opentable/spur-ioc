class Level

  constructor:(@level, @name, @ascii, @exit = false)->

  @create:(level, name, ascii, exit)->
    new Level(level, name, ascii, exit)

  log:(args...)=>
    console.log.apply console, [@ascii].concat(args)

class Logger

  LEVELS:
    "fatal":Level.create(0, "FATAL", `'\033[30m\033[41mFATAL\033[0m'`, true)
    "error":Level.create(1, "Error", `'\033[31mERROR\033[0m'`)
    "warn":Level.create(2, "WARNING", `'\033[33mWARNING\033[0m'`)
    "info":Level.create(3, "INFO", `'\033[32mINFO\033[0m'`)
    "debug":Level.create(4, "DEBUG", `'\033[0mDEBUG\033[0m'`)
    "trace":Level.create(5, "TRACE", `'\033[37mTRACE\033[0m'`)

  constructor:()->
    @addLoggingMethods()

  @create:()-> new Logger()

  addLoggingMethods:()->
    for levelName, level of @LEVELS

      do (levelName, level)=>
        @[levelName] = level.log

module.exports = Logger
