import type Log4JS from 'log4js';
import type { HadesOption } from '../types.js';



export { symbolLogUpdate, symbolLogDone } from './FileAppenderModule.js';


/**
 * Log4JS global configuration
 */
export const configureStatic: Log4JS.Configuration;


/**
 * - Log system in the format of `where, what, and result`
 * - The error stack will not output by default，saved in file `*.stack.log` instead
 * - 7 log level：
 *   - trace
 *   - debug
 *   - info
 *   - warn
 *   - error
 *   - fatal
 *   - mark
 */
export class Hades {
	constructor(option?: HadesOption);
	/**
	 * Specifies the name of the Hades instance, which is also the log file name by default
	 * @default 'default'
	 */
	name: string;
	/**
	 * Specify the minimum log level at which Hades will handle
	 * @default 'all'
	 * @see {@link https://log4js-node.github.io/log4js-node/api}
	 */
	level: string;
	/**
	 * Specify the directory in which logs are stored
	 * - If do not specify a directory, logs will not be saved to a file
	 * @default process.cwd()
	 */
	dirnLog: string;
	/**
	 * Specify the end-of-line marker of log files
	 */
	eolFile?: string;
	/**
	 * Specify the time template of logs
	 * @default 'MM-DD HH:mm:ss:SSS'
	 * @see {@link https://day.js.org/docs/en/display/format}
	 */
	templateTime: string;
	/**
	 * Specify the maximum size of a log file
	 * @default 20971520 // 20MB
	 */
	sizeFileLogMax: number;
	/**
	 * Specify the number of old log files to keep
	 * @default 0
	 * @see {@link https://github.com/log4js-node/streamroller}
	 */
	numberFileLogBackup: number;
	/**
	 * Texts for i18n
	 */
	texts: {
		name: string;
		init: string;
		'error-encounter': string;
		level: {
			ALL: string;
			TRACE: string;
			DEBUG: string;
			INFO: string;
			WARN: string;
			ERROR: string;
			FATAL: string;
			MARK: string;
			OFF: string;
		};
	};
	/**
	 * Specifies whether Hades will output styling highlighted logs
	 * @default true
	 */
	willHighlight: boolean;
	/**
	 * Specifies whether Hades will output colorful logs based on log level
	 * @default true
	 */
	willColorLevel: boolean;
	/**
	 * Specifies whether Hades will output initialized information after initialization
	 * @default true
	 */
	willOutputInitInfo: boolean;
	/**
	 * Specifies whether Hades will output error logs in console stream
	 * @default false
	 */
	willConsoleOutputError: boolean;
	/**
	 * Log4JS Logger instance
	 */
	logger: Log4JS.Logger;
	/**
	 * Indicates whether Hades has initialized the logger
	 * @default false
	 */
	isInit: boolean;
	/** init Hades */
	init(): this;
	/**
	 * reload logger asynchronously
	 */
	reload(): Promise<this>;
	/**
	 * trace
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in loop
	 * - should not be used in the `production` environment,
	 *   nor should `submit` any trace code. it is usually deleted immediately after debugging
	 * - blue color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	trace(where: string, what: string, ...infos: any[]): void;
	/**
	 * debug
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debug(where: string, what: string, ...infos: any[]): void;
	/**
	 * info
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	info(where: string, what: string, ...infos: any[]): void;
	/**
	 * warn
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warn(where: string, what: string, ...infos: any[]): void;
	/**
	 * error
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	error(where: string, what: string, ...infos: any[]): void;
	/**
	 * fatal
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatal(where: string, what: string, ...infos: any[]): void;
	/**
	 * mark
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	mark(where: string, what: string, ...infos: any[]): void;
	/**
	 * traceU
	 * - mark as inline update
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in loop
	 * - should not be used in the `production` environment,
	 *   nor should `submit` any trace code. it is usually deleted immediately after debugging
	 * - blue color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	traceU(where: string, what: string, ...infos: any[]): void;
	/**
	 * debugU
	 * - mark as inline update
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugU(where: string, what: string, ...infos: any[]): void;
	/**
	 * infoU
	 * - mark as inline update
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoU(where: string, what: string, ...infos: any[]): void;
	/**
	 * warnU
	 * - mark as inline update
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnU(where: string, what: string, ...infos: any[]): void;
	/**
	 * errorU
	 * - mark as inline update
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorU(where: string, what: string, ...infos: any[]): void;
	/**
	 * fatalU
	 * - mark as inline update
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalU(where: string, what: string, ...infos: any[]): void;
	/**
	 * markU
	 * - mark as inline update
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markU(where: string, what: string, ...infos: any[]): void;
	/**
	 * traceD
	 * - mark as inline update ended
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in loop
	 * - should not be used in the `production` environment,
	 *   nor should `submit` any trace code. it is usually deleted immediately after debugging
	 * - blue color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	traceD(where: string, what: string, ...infos: any[]): void;
	/**
	 * debugD
	 * - mark as inline update ended
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugD(where: string, what: string, ...infos: any[]): void;
	/**
	 * infoD
	 * - mark as inline update ended
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoD(where: string, what: string, ...infos: any[]): void;
	/**
	 * warnD
	 * - mark as inline update ended
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnD(where: string, what: string, ...infos: any[]): void;
	/**
	 * errorD
	 * - mark as inline update ended
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorD(where: string, what: string, ...infos: any[]): void;
	/**
	 * fatalD
	 * - mark as inline update ended
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalD(where: string, what: string, ...infos: any[]): void;
	/**
	 * markD
	 * - mark as inline update ended
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markD(where: string, what: string, ...infos: any[]): void;
	/**
	 * fatalE
	 * - exit with detect exit code
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {number} code exit code
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalE(code: number, where: string, what: string, ...infos: any[]): void;
	/**
	 * @param {string} where
	 * @returns {Melinoe}
	 */
	where(where: string): Melinoe;
	/**
	 * @param {string} where
	 * @param {string} what
	 * @returns {Zagreus}
	 */
	what(where: string, what: string): Zagreus;
}

/** typed `Hades` with `where` preseted */
export class Melinoe {
	/**
	 * @param {Hades} hades
	 * @param {string} where
	 */
	constructor(hades: Hades, where: string);
	/**
	 * the Hades instance
	 * @type {Hades}
	 */
	hades: Hades;
	/**
	 * Specifies preset where
	 * @type {string}
	 */
	where: string;
	/**
	 * @param {string} what
	 * @returns {Zagreus}
	 */
	what(what: string): Zagreus;
	/**
	 * trace
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in loop
	 * - should not be used in the `production` environment,
	 *   nor should `submit` any trace code. it is usually deleted immediately after debugging
	 * - blue color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	trace(what: string, ...infos: any[]): void;
	/**
	 * debug
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debug(what: string, ...infos: any[]): void;
	/**
	 * info
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	info(what: string, ...infos: any[]): void;
	/**
	 * warn
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warn(what: string, ...infos: any[]): void;
	/**
	 * error
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	error(what: string, ...infos: any[]): void;
	/**
	 * fatal
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatal(what: string, ...infos: any[]): void;
	/**
	 * mark
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	mark(what: string, ...infos: any[]): void;
	/**
	 * traceU
	 * - mark as inline update
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in loop
	 * - should not be used in the `production` environment,
	 *   nor should `submit` any trace code. it is usually deleted immediately after debugging
	 * - blue color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	traceU(what: string, ...infos: any[]): void;
	/**
	 * debugU
	 * - mark as inline update
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugU(what: string, ...infos: any[]): void;
	/**
	 * infoU
	 * - mark as inline update
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoU(what: string, ...infos: any[]): void;
	/**
	 * warnU
	 * - mark as inline update
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnU(what: string, ...infos: any[]): void;
	/**
	 * errorU
	 * - mark as inline update
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorU(what: string, ...infos: any[]): void;
	/**
	 * fatalU
	 * - mark as inline update
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalU(what: string, ...infos: any[]): void;
	/**
	 * markU
	 * - mark as inline update
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markU(what: string, ...infos: any[]): void;
	/**
	 * traceD
	 * - mark as inline update ended
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in loop
	 * - should not be used in the `production` environment,
	 *   nor should `submit` any trace code. it is usually deleted immediately after debugging
	 * - blue color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	traceD(what: string, ...infos: any[]): void;
	/**
	 * debugD
	 * - mark as inline update ended
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugD(what: string, ...infos: any[]): void;
	/**
	 * infoD
	 * - mark as inline update ended
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoD(what: string, ...infos: any[]): void;
	/**
	 * warnD
	 * - mark as inline update ended
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnD(what: string, ...infos: any[]): void;
	/**
	 * errorD
	 * - mark as inline update ended
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorD(what: string, ...infos: any[]): void;
	/**
	 * fatalD
	 * - mark as inline update ended
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalD(what: string, ...infos: any[]): void;
	/**
	 * markD
	 * - mark as inline update ended
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markD(what: string, ...infos: any[]): void;
	/**
	 * fatalE
	 * - exit with detect exit code
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {number} code exit code
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalE(code: number, what: string, ...infos: any[]): void;
}

/** typed `Hades` with `where` and `what` preseted */
export class Zagreus {
	/**
	 * @param {Hades} hades
	 * @param {string} where
	 * @param {string} what
	 */
	constructor(hades: Hades, where: string, what: string);
	/**
	 * the Hades instance
	 * @type {Hades}
	 */
	hades: Hades;
	/**
	 * Specifies preset where
	 * @type {string}
	 */
	where: string;
	/**
	 * Specifies preset what
	 * @type {string}
	 */
	what: string;
	/**
	 * trace
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in loop
	 * - should not be used in the `production` environment,
	 *   nor should `submit` any trace code. it is usually deleted immediately after debugging
	 * - blue color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	trace(...infos: any[]): void;
	/**
	 * debug
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debug(...infos: any[]): void;
	/**
	 * info
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	info(...infos: any[]): void;
	/**
	 * warn
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warn(...infos: any[]): void;
	/**
	 * error
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	error(...infos: any[]): void;
	/**
	 * fatal
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatal(...infos: any[]): void;
	/**
	 * mark
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	mark(...infos: any[]): void;
	/**
	 * traceU
	 * - mark as inline update
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in loop
	 * - should not be used in the `production` environment,
	 *   nor should `submit` any trace code. it is usually deleted immediately after debugging
	 * - blue color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	traceU(...infos: any[]): void;
	/**
	 * debugU
	 * - mark as inline update
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugU(...infos: any[]): void;
	/**
	 * infoU
	 * - mark as inline update
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoU(...infos: any[]): void;
	/**
	 * warnU
	 * - mark as inline update
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnU(...infos: any[]): void;
	/**
	 * errorU
	 * - mark as inline update
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorU(...infos: any[]): void;
	/**
	 * fatalU
	 * - mark as inline update
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalU(...infos: any[]): void;
	/**
	 * markU
	 * - mark as inline update
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markU(...infos: any[]): void;
	/**
	 * traceD
	 * - mark as inline update ended
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in loop
	 * - should not be used in the `production` environment,
	 *   nor should `submit` any trace code. it is usually deleted immediately after debugging
	 * - blue color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	traceD(...infos: any[]): void;
	/**
	 * debugD
	 * - mark as inline update ended
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugD(...infos: any[]): void;
	/**
	 * infoD
	 * - mark as inline update ended
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoD(...infos: any[]): void;
	/**
	 * warnD
	 * - mark as inline update ended
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnD(...infos: any[]): void;
	/**
	 * errorD
	 * - mark as inline update ended
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorD(...infos: any[]): void;
	/**
	 * fatalD
	 * - mark as inline update ended
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalD(...infos: any[]): void;
	/**
	 * markD
	 * - mark as inline update ended
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markD(...infos: any[]): void;
	/**
	 * fatalE
	 * - exit with detect exit code
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {number} code exit code
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalE(code: number, ...infos: any[]): void;
}
