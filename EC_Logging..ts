/**
 * Created by shawn on 1/9/17.
 */

///<reference path="node_modules/@types/lodash/index.d.ts"/>
///<reference path="consoleAppender.js"/>

///<reference path="node_modules/moment/moment.d.ts"/>


//region declarations from aurelia

    // for some reason TS wasn't able to resolve these, from the aurelia-logging.d.ts file despite me trying a
    // few different ways to bring the declarations in scope.
declare namespace LogManager {


    /**
     * Specifies the available logging levels.
     */
    export  interface LogLevel {

        /**
         * No logging.
         */
        none: number;

        /**
         * Log only error messages.
         */
        error: number;

        /**
         * Log warnings messages or above.
         */
        warn: number;

        /**
         * Log informational messages or above.
         */
        info: number;

        /**
         * Log all messages.
         */
        debug: number;
    }

    /**
     * Implemented by classes which wish to append log data to a target data store.
     */
    export  interface Appender {

        /**
         * Appends a debug log.
         *
         * @param logger The source logger.
         * @param rest The data to log.
         */
        debug(logger: Logger, ...rest: any[]): void;

        /**
         * Appends an info log.
         *
         * @param logger The source logger.
         * @param rest The data to log.
         */
        info(logger: Logger, ...rest: any[]): void;

        /**
         * Appends a warning log.
         *
         * @param logger The source logger.
         * @param rest The data to log.
         */
        warn(logger: Logger, ...rest: any[]): void;

        /**
         * Appends an error log.
         *
         * @param logger The source logger.
         * @param rest The data to log.
         */
        error(logger: Logger, ...rest: any[]): void;
    }

    /**
     * Specifies the available logging levels.
     */
    /**
     * Specifies the available logging levels.
     */
    export const logLevel: LogLevel;

    /**
     * Gets the instance of a logger associated with a particular id (or creates one if it doesn't already exist).
     *
     * @param id The id of the logger you wish to get an instance of.
     * @return The instance of the logger, or creates a new logger if none exists for that id.
     */
    export function getLogger(id: string): Logger;

    /**
     * Adds an appender capable of processing logs and channeling them to an output.
     *
     * @param appender An appender instance to begin processing logs with.
     */
    /**
     * Adds an appender capable of processing logs and channeling them to an output.
     *
     * @param appender An appender instance to begin processing logs with.
     */
    export function addAppender(appender: Appender): void;

    /**
     * Sets the level of logging for ALL the application loggers.
     *
     * @param level Matches a value of logLevel specifying the level of logging.
     */
    export function setLevel(level: number): void;

    /**
     * Gets the level of logging of ALL the application loggers.
     *
     * @return The logLevel value used in all loggers.
     */
    export function getLevel(): number;

    /**
     * A logger logs messages to a set of appenders, depending on the log level that is set.
     */
    export class Logger {

        /**
         * The id that the logger was created with.
         */
        id: string;

        /**
         * The logging severity level for this logger
         */
        level: number;

        /**
         * You cannot instantiate the logger directly - you must use the getLogger method instead.
         */
        constructor(id: string, key: Object);

        /**
         * Logs a debug message.
         *
         * @param message The message to log.
         * @param rest The data to log.
         */
        debug(message: string, ...rest: any[]): void;

        /**
         * Logs info.
         *
         * @param message The message to log.
         * @param rest The data to log.
         */
        info(message: string, ...rest: any[]): void;

        /**
         * Logs a warning.
         *
         * @param message The message to log.
         * @param rest The data to log.
         */
        warn(message: string, ...rest: any[]): void;

        /**
         * Logs an error.
         *
         * @param message The message to log.
         * @param rest The data to log.
         */
        error(message: string, ...rest: any[]): void;

        /**
         * Sets the level of logging for this logger instance
         *
         * @param level Matches a value of logLevel specifying the level of logging.
         */
        setLevel(level: number): void;
    }
}

//endregion

declare interface Moment {
    ():any
    duration:any
}
declare var moment:Moment



namespace LogManager {

    /**
     * Value to be prepended to each log message title. Defaults to a random 4 digit integer
     * @type {string}
     */
    export let correlationId = Math.floor(Math.random() * 10000).toString();

    /**
     * if true then log message include a random integer (or your custom) prefix to each log entry title.
     * which is fixed for the duration of this script run. This can be used to correlate between different runs
     * of the same script (e.g. multiple runs of a scheduled script or discerning between multiple simultaneous calls
     * to a RESTlet or Suitelet)
     */
    export let includeCorrelationId = false;

    /**
     * Controls whether the correlation id prefixes should be included in log messages or not.
     * @param enable if true, adds correlationid to the log messages, otherwise no correlation id prefix is added
     */
    export let setIncludeCorrelationId = (enable: boolean) => includeCorrelationId = enable


// invokes the nsdal log function and handles adding a title tag
    function log(loglevel: number, logger: Logger, ...rest: any[]) {
        let [title, details] = rest
        let prefix = ''

        if (includeCorrelationId === true) {
            prefix += `${correlationId}>`
        }
        // prefix all loggers except the 'default' one used by top level code
        if (logger.id !== 'default') {
            prefix += `[${logger.id}]`
        }
        // NetSuite now supports logging js objects but does not log properties from the prototype chain. This is
        // basically how JSON.stringify() works so I presume they are doing that?
        // To cover the most common use case of logging an object to see its properties, first convert to
        // a plain object if it's not one already.
        if (_.isObject(details) && (!_.isPlainObject(details))) details = _.toPlainObject(details)
        nlapiLogExecution(toNetSuiteLogLevel(loglevel), `${prefix} ${title}`, details)
    }

    /**
     * Log appender targeting the NS execution log
     * Severities are mapped as follows:
     *
     * debug -> NS 'DEBUG'
     * info -> NS 'AUDIT'
     * warn -> NS 'ERROR'
     * error -> NS 'emergency'
     */
    class ExecutionLogAppender implements Appender {


        debug(logger: Logger, ...rest: any[]) {
            log(logLevel.debug, logger, ...rest)
        }

        /**
         * Info about info
         * @param logger
         * @param rest
         */
        info(logger: Logger, ...rest: any[]) {
            log(logLevel.info, logger, ...rest)
        }

        warn(logger: Logger, ...rest: any[]) {
            log(logLevel.warn, logger, ...rest)
        }

        error(logger: Logger, ...rest: any[]) {
            log(logLevel.error, logger, ...rest)
        }
    }

// instantiate the default logger and set it's logging level to the most verbose - this is used as
// the 'main' logger by consumers
    let defaultLogger = getLogger('default')
    defaultLogger.setLevel(logLevel.debug)

// maps aurelia numeric levels to NS string level names
    function toNetSuiteLogLevel(level: number) {
        switch (level) {
            case logLevel.debug:
                return 'debug'
            case logLevel.info:
                return 'audit'
            case logLevel.warn:
                return 'error'
            case logLevel.error:
                return 'emergency'
        }
    }

    function getGovernanceMessage(governanceEnabled: boolean) {
        //TODO: figure out why TS doesn't like the type of nlapiGetContext().getRemainingUsage()
        
        return undefined
        //return governanceEnabled ? `governance: ${remaining}` : undefined
    }

    /**
     * Uses AOP to automatically log method entry/exit with arguments to the netsuite execution log.
     * Call this method at the end of your script. Log entries are 'DEBUG' level.
     *
     * @param methodsToLogEntryExit array of pointcuts
     * @param {Object} config configuration settings
     * @param {Boolean} [config.withArgs] true if you want to include logging the arguments passed to the method in the
     * details. Default is true.
     * @param {Boolean} [config.withReturnValue] true if you want function return values to be logged
     * @param {Boolean} [config.withProfiling] set true if you want elapsed time info printed for each function
     * @param {Boolean} [config.withGovernance] set true if you want remaining governance units info printed for
     * each function
     * false. Colors not configurable so that we maintain consistency across all our scripts.
     * @param {number} [config.logType] the logging level to use, logLevel.debug, logLevel.info, etc.
     * @returns {} an array of jquery aop advices
     */
    export function autoLogMethodEntryExit(methodsToLogEntryExit: {target: Object, method: string | RegExp},
                                           config?: AutoLogConfig) {

        if (!config) config = {}
        // include method parameters by default
        let withArgs = config.withArgs !== false
        // include return values by default
        let withReturnValue = config.withReturnValue !== false
        // default to not show profiling info
        let withProfiling = config.withProfiling === true
        // default to not show governance info
        let withGovernance = config.withGovernance === true
        // logger on which to autolog, default to the top level 'Default' logger used by scripts
        let logger = config.logger || DefaultLogger

        return aop.around(methodsToLogEntryExit, function (invocation) {
            // record function entry with details for every method on our explore object
            log(config.logLevel || logLevel.debug, logger, `Enter ${invocation.method}() ${getGovernanceMessage(withGovernance)}`,
                withArgs ? 'args: ' + JSON.stringify(arguments[0].arguments) : null)
            let startTime = moment()
            let retval = invocation.proceed()
            let elapsedMessage
            if (withProfiling) {
                let elapsedMilliseconds = moment().diff(startTime);
                elapsedMessage = elapsedMilliseconds + "ms = " +
                    moment.duration(elapsedMilliseconds).asMinutes().toFixed(2) + " minutes";
            }
            // record function exit for every method on our explore object
            log(config.logLevel || logLevel.debug, logger,
                [`Exit ${invocation.method}()`,
                    elapsedMessage,
                    getGovernanceMessage(withGovernance)].join(' ').trim(),
                withReturnValue ? "returned: " + JSON.stringify(retval) : null);

            return retval;
        });
    }

    /**
     * Configuration options for AutoLogMethodEntryExit
     */
    export interface AutoLogConfig {
        /**
         * set true to include automatically include passed method arguments in the logs
         */
        withArgs?: boolean
        /**
         * If true, includes the function return value in the log
         */
        withReturnValue?: boolean
        /**
         *
         */
        withProfiling?: boolean
        withGovernance?: boolean
        logger?: Logger
        logLevel?: number
    }

    /**
     * The default logger - this should be the main top level logger used in scripts
     */
    export let DefaultLogger: Logger = defaultLogger

    /**
     * Use to set the correlation id to a value other than the default random number
     * @param value new correlation id, will be used on all subsequent logging
     */
    export let setCorrelationId = (value: string) => correlationId = value

    // automatically use a browser appender if this is a client script so as to save network round trips
    // caused by logging. Otherwise use the NS serverside execution log.
    if (EC.isClientScript)  addAppender(new ConsoleAppender.ConsoleAppender())
    else addAppender(new ExecutionLogAppender())
}


