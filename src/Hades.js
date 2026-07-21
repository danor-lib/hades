import { resolve as resolvePath } from 'node:path';

import Log4JS from 'log4js';

import { RichError } from '@danor-lib/error';

import { formatLog } from './formatLog.js';

import { moduleAppenderFile, symbolLogDone, symbolLogUpdate } from './FileAppenderModule.js';
import { moduleAppenderConsole } from './ConsoleAppenderModule.js';

/** @import { HadesOption, ConsoleAppenderConfig, FileAppenderConfig } from '../types.ts' */



/**
 * Check if a value is a non-null object
 * @param {any} value
 * @returns {boolean}
 */
const isObject = (value) => value != null && typeof value == 'object';



/**
 * Log4JS global configuration
 * @type {Log4JS.Configuration}
 */
export const configureStatic = {
	appenders: {
		default: { type: 'console' }
	},
	categories: {
		default: { appenders: ['default'], level: 'off' }
	},
	pm2: true,
};



export class Hades {
	/**
	 * Specify the name of the Hades instance, which is also the log file name by default
	 * @type {string}
	 */
	name = 'default';
	/**
	 * Specify the minimum log level that Hades will handle
	 * @type {string}
	 * @see {@link https://log4js-node.github.io/log4js-node/api}
	 */
	level = 'all';
	/**
	 * Specify the directory in which logs are stored
	 * - If no directory is specified, logs will not be saved to a file
	 * @type {string}
	 */
	dirnLog = process.cwd();


	/**
	 * Specify the end-of-line marker of log files
	 * @type {string}
	 */
	eolFile;
	/**
	 * Specify the time template of logs
	 * @type {string}
	 * @see {@link https://day.js.org/docs/en/display/format}
	 */
	templateTime = 'MM-DD HH:mm:ss:SSS';
	/**
	 * Specify the maximum size of a log file
	 * @type {number}
	 */
	sizeFileLogMax = 1024 * 1024 * 20; // 20MB

	/**
	 * Specify the number of old log files to keep
	 * @type {number}
	 * @see {@link https://github.com/log4js-node/streamroller}
	 */
	numberFileLogBackup = 0;


	/**
	 * Texts for i18n
	 */
	texts = {
		'name': '日志',
		'init': '加载',
		'error-encounter': '发生错误',
		'level': {
			'ALL': '全部',
			'TRACE': '跟踪',
			'DEBUG': '调试',
			'INFO': '信息',
			'WARN': '警告',
			'ERROR': '错误',
			'FATAL': '致命',
			'MARK': '标记',
			'OFF': '关闭'
		}
	};


	/**
	 * Specify whether Hades outputs styled and highlighted logs
	 * @type {boolean}
	 */
	willHighlight = true;
	/**
	 * Specify whether Hades outputs color-coded logs based on log level
	 * @type {boolean}
	 */
	willColorLevel = true;
	/**
	 * Specify whether Hades outputs initialization information after setup
	 * @type {boolean}
	 */
	willOutputInitInfo = true;
	/**
	 * Specify whether Hades outputs error logs in the console stream
	 * @type {boolean}
	 */
	willConsoleOutputError = false;



	/**
	 * Log4JS Logger instance
	 * @type {Log4JS.Logger}
	 */
	logger;



	/**
	 * Indicates whether Hades has initialized the logger
	 * @type {boolean}
	 */
	isInit = false;



	/** @param {HadesOption} [options] */
	constructor(options) {
		if(options != null) {
			if(!isObject(options)) {
				throw new RichError({
					code: 'invalid-options', at: 'hades/Hades#constructor(options)',
					data: { options },
				});
			}
		}
		else { options = {}; }



		const name = options.name;
		if(name != null) {
			if(typeof name != 'string') {
				throw new RichError({
					code: 'invalid-name', at: 'hades/Hades#constructor(options.name)',
					data: { name },
				});
			}


			this.name = name.trim();
		}

		const level = options.level;
		if(level != null) {
			if(typeof level != 'string') {
				throw new RichError({
					code: 'invalid-level', at: 'hades/Hades#constructor(options.level)',
					data: { level },
				});
			}


			this.level = level.trim();
		}

		const dirnLog = options.dirn;
		if(dirnLog != null) {
			if(typeof dirnLog != 'string') {
				throw new RichError({
					code: 'invalid-log-dirn', at: 'hades/Hades#constructor(options.dirn)',
					data: { dirn: dirnLog },
				});
			}


			this.dirnLog = dirnLog.trim();
		}


		let textsEnv;
		try {
			textsEnv = process.env.DR_HADES_TEXTS ? JSON.parse(process.env.DR_HADES_TEXTS) : null;
		}
		catch {
			textsEnv = null;
		}

		const texts = options.texts != null ? options.texts : textsEnv;
		if(texts != null) {
			if(!isObject(texts)) {
				throw new RichError({
					code: 'invalid-texts', at: 'hades/Hades#constructor(options.texts)',
					data: { texts },
				});
			}


			this.texts.name = typeof texts.name == 'string' ? texts.name.trim() : this.texts.name;
			this.texts.init = typeof texts.init == 'string' ? texts.init.trim() : this.texts.init;
			this.texts.errorEncouter = typeof texts.errorEncouter == 'string' ? texts.errorEncouter.trim() : this.texts.errorEncouter;

			this.texts.level.ALL = typeof texts.level?.ALL == 'string' ? texts.level.ALL.trim() : this.texts.level.ALL;
			this.texts.level.TRACE = typeof texts.level?.TRACE == 'string' ? texts.level.TRACE.trim() : this.texts.level.TRACE;
			this.texts.level.DEBUG = typeof texts.level?.DEBUG == 'string' ? texts.level.DEBUG.trim() : this.texts.level.DEBUG;
			this.texts.level.INFO = typeof texts.level?.INFO == 'string' ? texts.level.INFO.trim() : this.texts.level.INFO;
			this.texts.level.WARN = typeof texts.level?.WARN == 'string' ? texts.level.WARN.trim() : this.texts.level.WARN;
			this.texts.level.ERROR = typeof texts.level?.ERROR == 'string' ? texts.level.ERROR.trim() : this.texts.level.ERROR;
			this.texts.level.FATAL = typeof texts.level?.FATAL == 'string' ? texts.level.FATAL.trim() : this.texts.level.FATAL;
			this.texts.level.MARK = typeof texts.level?.MARK == 'string' ? texts.level.MARK.trim() : this.texts.level.MARK;
			this.texts.level.OFF = typeof texts.level?.OFF == 'string' ? texts.level.OFF.trim() : this.texts.level.OFF;
		}



		const eolFile = options.eol;
		if(eolFile != null) {
			if(typeof eolFile != 'string') {
				throw new RichError({
					code: 'invalid-eol', at: 'hades/Hades#constructor(options.eol)',
					data: { eol: eolFile },
				});
			}


			this.eolFile = eolFile;
		}

		const templateTime = options.templateTime;
		if(templateTime != null) {
			if(typeof templateTime != 'string') {
				throw new RichError({
					code: 'invalid-time-template', at: 'hades/Hades#constructor(options.templateTime)',
					data: { templateTime },
				});
			}


			this.templateTime = templateTime.trim();
		}

		const sizeFileLogMax = options.sizeFileLogMax;
		if(sizeFileLogMax != null) {
			if(typeof sizeFileLogMax != 'number' || !Number.isInteger(sizeFileLogMax) || sizeFileLogMax <= 0) {
				throw new RichError({
					code: 'invalid-max-file-log-size', at: 'hades/Hades#constructor(options.sizeFileLogMax)',
					data: { sizeFileLogMax },
				});
			}


			this.sizeFileLogMax = sizeFileLogMax;
		}

		const numberFileLogBackupMax = options.numberFileLogBackupMax;
		if(numberFileLogBackupMax != null) {
			if(typeof numberFileLogBackupMax != 'number' || Number.isInteger(numberFileLogBackupMax) || numberFileLogBackupMax < 0) {
				throw new RichError({
					code: 'invalid-max-backup-log-file', at: 'hades/Hades#constructor(options.numberFileLogBackup)',
					data: { numberFileLogBackup: numberFileLogBackupMax },
				});
			}


			this.numberFileLogBackup = numberFileLogBackupMax;
		}



		const willHighlight = options.willHighlight;
		if(willHighlight != null) {
			if(typeof willHighlight != 'boolean') {
				throw new RichError({
					code: 'invalid-will-highlight', at: 'hades/Hades#constructor(options.willHighlight)',
					data: { willHighlight },
				});
			}


			this.willHighlight = willHighlight;
		}

		const willColorLevel = options.willColorLevel;
		if(willColorLevel != null) {
			if(typeof willColorLevel != 'boolean') {
				throw new RichError({
					code: 'invalid-will-level-colorful', at: 'hades/Hades#constructor(options.willColorLevel)',
					data: { willColorLevel },
				});
			}


			this.willColorLevel = willColorLevel;
		}

		const willOutputInitInfo = options.willOutputInitInfo;
		if(willOutputInitInfo != null) {
			if(typeof willOutputInitInfo != 'boolean') {
				throw new RichError({
					code: 'invalid-will-output-init-info', at: 'hades/Hades#constructor(options.willOutputInitInfo)',
					data: { willOutputInitInfo },
				});
			}


			this.willOutputInitInfo = willOutputInitInfo;
		}

		const willConsoleOutputError = options.willConsoleOutputError;
		if(willConsoleOutputError != null) {
			if(typeof willConsoleOutputError != 'boolean') {
				throw new RichError({
					code: 'invalid-will-output-console-error', at: 'hades/Hades#constructor(options.willConsoleOutputError)',
					data: { willConsoleOutputError },
				});
			}


			this.willConsoleOutputError = willConsoleOutputError;
		}


		let willInitImmediate = options.willInitImmediate;
		if(willInitImmediate != null) {
			if(typeof willInitImmediate != 'boolean') {
				throw new RichError({
					code: 'invalid-will-init-immediate', at: 'hades/Hades#constructor(options.willInitImmediate)',
					data: { willInitImmediate },
				});
			}
		}
		else { willInitImmediate = true; }



		if(willInitImmediate) { this.init(); }
	}


	/**
	 * Initialize Hades
	 * @returns {Hades}
	 */
	init() {
		const { name, level, dirnLog, texts, willOutputInitInfo } = this;


		/** @type {Log4JS.Configuration} */
		const configure = JSON.parse(JSON.stringify(configureStatic));
		/** @type {Log4JS.Appender[]} */
		const appenders = [];



		const nameAppenderConsole = `${name}-console`;
		/** @type {ConsoleAppenderConfig} */
		const configAppenderConsole = {
			type: moduleAppenderConsole,
			hades: this,
			handle: (event, { hades }) => formatLog(event, hades.willHighlight, hades.willColorLevel, hades.templateTime, hades.texts),
		};
		configure.appenders[nameAppenderConsole] = configAppenderConsole;
		appenders.push(nameAppenderConsole);


		if(dirnLog) {
			const nameAppenderFile = `${name}-file`;

			/** @type {FileAppenderConfig} */
			const configAppenderFile = {
				type: moduleAppenderFile,
				hades: this,
				handle: (event, { hades }) => formatLog(event, hades.willHighlight, hades.willColorLevel, hades.templateTime, hades.texts)[0],
				path: resolvePath(dirnLog, `${name}.log`)
			};
			configure.appenders[nameAppenderFile] = configAppenderFile;
			appenders.push(nameAppenderFile);


			const nameAppenderFileStack = `${name}-file-stack`;

			/** @type {FileAppenderConfig} */
			const configAppenderFileStack = {
				type: moduleAppenderFile,
				hades: this,
				handle: (event, { hades }) => formatLog(event, hades.willHighlight, hades.willColorLevel, hades.templateTime, hades.texts)[1],
				path: resolvePath(dirnLog, `${name}.stack.log`)
			};

			configure.appenders[nameAppenderFileStack] = configAppenderFileStack;
			appenders.push(nameAppenderFileStack);
		}


		configure.categories[name] = { appenders, level };



		this.logger = Log4JS.configure(configure).getLogger(name);

		this.inited = true;


		if(willOutputInitInfo) {
			this.info(texts['name'], texts['init'], '✔');
		}


		return this;
	}

	/**
	 * Reload the logger asynchronously
	 * @returns {Promise<Hades>}
	 */
	async reload() {
		await new Promise((resolver, rejecter) =>
			Log4JS.shutdown(error => error ? resolver() : rejecter(error))
		);

		return this.init();
	}



	/**
	 * trace
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in a loop
	 * - should not be used in production,
	 *   nor should any trace code be committed; it is usually removed immediately after debugging
	 * - blue
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	trace(where, what, ...infos) { this.logger.trace(...arguments); }
	/**
	 * debug
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function or an unimportant heartbeat
	 * - cyan
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debug(where, what, ...infos) { this.logger.debug(...arguments); }
	/**
	 * info
	 * - used to record regular summaries or expected exception data that can be handled
	 * - green
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	info(where, what, ...infos) { this.logger.info(...arguments); }
	/**
	 * warn
	 * - used to record operational data that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can reconnect later
	 * - yellow
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warn(where, what, ...infos) { this.logger.warn(...arguments); }
	/**
	 * error
	 * - used to record abnormal logic and unexpected error data
	 * - such as when inserting data into the database
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	error(where, what, ...infos) { this.logger.error(...arguments); }
	/**
	 * fatal
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exceptions or unexpected file read/write errors
	 * - magenta
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatal(where, what, ...infos) { this.logger.fatal(...arguments); }
	/**
	 * mark
	 * - used to record necessary descriptions of unrelated operational conditions
	 * - unless the log is turned off, it will always be output
	 * - such as copyright descriptions and precautions
	 * - grey
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	mark(where, what, ...infos) { this.logger.mark(...arguments); }


	/**
	 * traceU
	 * - mark as inline update
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in a loop
	 * - should not be used in production,
	 *   nor should any trace code be committed; it is usually removed immediately after debugging
	 * - blue
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	traceU(where, what, ...infos) { this.logger.trace(symbolLogUpdate, ...arguments); }
	/**
	 * debugU
	 * - mark as inline update
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function or an unimportant heartbeat
	 * - cyan
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugU(where, what, ...infos) { this.logger.debug(symbolLogUpdate, ...arguments); }
	/**
	 * infoU
	 * - mark as inline update
	 * - used to record regular summaries or expected exception data that can be handled
	 * - green
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoU(where, what, ...infos) { this.logger.info(symbolLogUpdate, ...arguments); }
	/**
	 * warnU
	 * - mark as inline update
	 * - used to record operational data that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can reconnect later
	 * - yellow
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnU(where, what, ...infos) { this.logger.warn(symbolLogUpdate, ...arguments); }
	/**
	 * errorU
	 * - mark as inline update
	 * - used to record abnormal logic and unexpected error data
	 * - such as when inserting data into the database
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorU(where, what, ...infos) { this.logger.error(symbolLogUpdate, ...arguments); }
	/**
	 * fatalU
	 * - mark as inline update
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exceptions or unexpected file read/write errors
	 * - magenta
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalU(where, what, ...infos) { this.logger.fatal(symbolLogUpdate, ...arguments); }
	/**
	 * markU
	 * - mark as inline update
	 * - used to record necessary descriptions of unrelated operational conditions
	 * - unless the log is turned off, it will always be output
	 * - such as copyright descriptions and precautions
	 * - grey
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markU(where, what, ...infos) { this.logger.mark(symbolLogUpdate, ...arguments); }


	/**
	 * traceD
	 * - mark as end of inline update
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in a loop
	 * - should not be used in production,
	 *   nor should any trace code be committed; it is usually removed immediately after debugging
	 * - blue
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	traceD(where, what, ...infos) { this.logger.trace(symbolLogDone, ...arguments); }
	/**
	 * debugD
	 * - mark as end of inline update
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function or an unimportant heartbeat
	 * - cyan
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugD(where, what, ...infos) { this.logger.debug(symbolLogDone, ...arguments); }
	/**
	 * infoD
	 * - mark as end of inline update
	 * - used to record regular summaries or expected exception data that can be handled
	 * - green
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoD(where, what, ...infos) { this.logger.info(symbolLogDone, ...arguments); }
	/**
	 * warnD
	 * - mark as end of inline update
	 * - used to record operational data that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can reconnect later
	 * - yellow
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnD(where, what, ...infos) { this.logger.warn(symbolLogDone, ...arguments); }
	/**
	 * errorD
	 * - mark as end of inline update
	 * - used to record abnormal logic and unexpected error data
	 * - such as when inserting data into the database
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorD(where, what, ...infos) { this.logger.error(symbolLogDone, ...arguments); }
	/**
	 * fatalD
	 * - mark as end of inline update
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exceptions or unexpected file read/write errors
	 * - magenta
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalD(where, what, ...infos) { this.logger.fatal(symbolLogDone, ...arguments); }
	/**
	 * markD
	 * - mark as end of inline update
	 * - used to record necessary descriptions of unrelated operational conditions
	 * - unless the log is turned off, it will always be output
	 * - such as copyright descriptions and precautions
	 * - grey
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markD(where, what, ...infos) { this.logger.mark(symbolLogDone, ...arguments); }

	/**
	 * fatalE
	 * - exit with the specified exit code
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exceptions or unexpected file read/write errors
	 * - magenta
	 * @param {number} code exit code
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalE(code, where, what, ...infos) {
		const args = [...arguments];
		args.shift();

		this.logger.fatal(symbolLogDone, ...args);

		process.exit(code);
	}



	/**
	 * @param {string} where
	 * @returns {Melinoe}
	 */
	where(where) { return new Melinoe(this, where); }
	/**
	 * @param {string} where
	 * @param {string} what
	 * @returns {Zagreus}
	 */
	what(where, what) { return new Zagreus(this, where, what); }
}



/** Typed `Hades` with preset `where` */
export class Melinoe {
	/**
	 * The Hades instance
	 * @type {Hades}
	 */
	hades;
	/**
	 * Specify the preset where
	 * @type {string}
	 */
	where;


	/**
	 * @param {Hades} hades
	 * @param {string} where
	 */
	constructor(hades, where) {
		this.hades = hades;
		this.where = where;
	}


	/**
	 * @param {string} what
	 * @returns {Zagreus}
	 */
	what(what) { return new Zagreus(this.hades, this.where, what); }


	/**
	 * trace
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in a loop
	 * - should not be used in production,
	 *   nor should any trace code be committed; it is usually removed immediately after debugging
	 * - blue
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	trace(what, ...infos) { this.hades.trace(this.where, ...arguments); }
	/**
	 * debug
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function or an unimportant heartbeat
	 * - cyan
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debug(what, ...infos) { this.hades.debug(this.where, ...arguments); }
	/**
	 * info
	 * - used to record regular summaries or expected exception data that can be handled
	 * - green
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	info(what, ...infos) { this.hades.info(this.where, ...arguments); }
	/**
	 * warn
	 * - used to record operational data that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can reconnect later
	 * - yellow
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warn(what, ...infos) { this.hades.warn(this.where, ...arguments); }
	/**
	 * error
	 * - used to record abnormal logic and unexpected error data
	 * - such as when inserting data into the database
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	error(what, ...infos) { this.hades.error(this.where, ...arguments); }
	/**
	 * fatal
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exceptions or unexpected file read/write errors
	 * - magenta
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatal(what, ...infos) { this.hades.fatal(this.where, ...arguments); }
	/**
	 * mark
	 * - used to record necessary descriptions of unrelated operational conditions
	 * - unless the log is turned off, it will always be output
	 * - such as copyright descriptions and precautions
	 * - grey
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	mark(what, ...infos) { this.hades.mark(this.where, ...arguments); }


	/**
	 * traceU
	 * - mark as inline update
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in a loop
	 * - should not be used in production,
	 *   nor should any trace code be committed; it is usually removed immediately after debugging
	 * - blue
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	traceU(what, ...infos) { this.hades.trace(symbolLogUpdate, this.where, ...arguments); }
	/**
	 * debugU
	 * - mark as inline update
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function or an unimportant heartbeat
	 * - cyan
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugU(what, ...infos) { this.hades.debug(symbolLogUpdate, this.where, ...arguments); }
	/**
	 * infoU
	 * - mark as inline update
	 * - used to record regular summaries or expected exception data that can be handled
	 * - green
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoU(what, ...infos) { this.hades.info(symbolLogUpdate, this.where, ...arguments); }
	/**
	 * warnU
	 * - mark as inline update
	 * - used to record operational data that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can reconnect later
	 * - yellow
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnU(what, ...infos) { this.hades.warn(symbolLogUpdate, this.where, ...arguments); }
	/**
	 * errorU
	 * - mark as inline update
	 * - used to record abnormal logic and unexpected error data
	 * - such as when inserting data into the database
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorU(what, ...infos) { this.hades.error(symbolLogUpdate, this.where, ...arguments); }
	/**
	 * fatalU
	 * - mark as inline update
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exceptions or unexpected file read/write errors
	 * - magenta
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalU(what, ...infos) { this.hades.fatal(symbolLogUpdate, this.where, ...arguments); }
	/**
	 * markU
	 * - mark as inline update
	 * - used to record necessary descriptions of unrelated operational conditions
	 * - unless the log is turned off, it will always be output
	 * - such as copyright descriptions and precautions
	 * - grey
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markU(what, ...infos) { this.hades.mark(symbolLogUpdate, this.where, ...arguments); }


	/**
	 * traceD
	 * - mark as end of inline update
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in a loop
	 * - should not be used in production,
	 *   nor should any trace code be committed; it is usually removed immediately after debugging
	 * - blue
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	traceD(what, ...infos) { this.hades.trace(symbolLogDone, this.where, ...arguments); }
	/**
	 * debugD
	 * - mark as end of inline update
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function or an unimportant heartbeat
	 * - cyan
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugD(what, ...infos) { this.hades.debug(symbolLogDone, this.where, ...arguments); }
	/**
	 * infoD
	 * - mark as end of inline update
	 * - used to record regular summaries or expected exception data that can be handled
	 * - green
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoD(what, ...infos) { this.hades.info(symbolLogDone, this.where, ...arguments); }
	/**
	 * warnD
	 * - mark as end of inline update
	 * - used to record operational data that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can reconnect later
	 * - yellow
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnD(what, ...infos) { this.hades.warn(symbolLogDone, this.where, ...arguments); }
	/**
	 * errorD
	 * - mark as end of inline update
	 * - used to record abnormal logic and unexpected error data
	 * - such as when inserting data into the database
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorD(what, ...infos) { this.hades.error(symbolLogDone, this.where, ...arguments); }
	/**
	 * fatalD
	 * - mark as end of inline update
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exceptions or unexpected file read/write errors
	 * - magenta
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalD(what, ...infos) { this.hades.fatal(symbolLogDone, this.where, ...arguments); }
	/**
	 * markD
	 * - mark as end of inline update
	 * - used to record necessary descriptions of unrelated operational conditions
	 * - unless the log is turned off, it will always be output
	 * - such as copyright descriptions and precautions
	 * - grey
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markD(what, ...infos) { this.hades.mark(symbolLogDone, this.where, ...arguments); }

	/**
	 * fatalE
	 * - exit with the specified exit code
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exceptions or unexpected file read/write errors
	 * - magenta
	 * @param {number} code exit code
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalE(code, what, ...infos) {
		this.hades.fatal(symbolLogDone, this.where, what, ...infos);

		process.exit(code);
	}
}



/** Typed `Hades` with preset `where` and `what` */
export class Zagreus {
	/**
	 * The Hades instance
	 * @type {Hades}
	 */
	hades;
	/**
	 * Specify the preset where
	 * @type {string}
	 */
	where;
	/**
	 * Specify the preset what
	 * @type {string}
	 */
	what;


	/**
	 * @param {Hades} hades
	 * @param {string} where
	 * @param {string} what
	 */
	constructor(hades, where, what) {
		this.hades = hades;
		this.where = where;
		this.what = what;
	}


	/**
	 * trace
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in a loop
	 * - should not be used in production,
	 *   nor should any trace code be committed; it is usually removed immediately after debugging
	 * - blue
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	trace(...infos) { this.hades.trace(this.where, this.what, ...arguments); }
	/**
	 * debug
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function or an unimportant heartbeat
	 * - cyan
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debug(...infos) { this.hades.debug(this.where, this.what, ...arguments); }
	/**
	 * info
	 * - used to record regular summaries or expected exception data that can be handled
	 * - green
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	info(...infos) { this.hades.info(this.where, this.what, ...arguments); }
	/**
	 * warn
	 * - used to record operational data that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can reconnect later
	 * - yellow
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warn(...infos) { this.hades.warn(this.where, this.what, ...arguments); }
	/**
	 * error
	 * - used to record abnormal logic and unexpected error data
	 * - such as when inserting data into the database
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	error(...infos) { this.hades.error(this.where, this.what, ...arguments); }
	/**
	 * fatal
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exceptions or unexpected file read/write errors
	 * - magenta
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatal(...infos) { this.hades.fatal(this.where, this.what, ...arguments); }
	/**
	 * mark
	 * - used to record necessary descriptions of unrelated operational conditions
	 * - unless the log is turned off, it will always be output
	 * - such as copyright descriptions and precautions
	 * - grey
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	mark(...infos) { this.hades.mark(this.where, this.what, ...arguments); }


	/**
	 * traceU
	 * - mark as inline update
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in a loop
	 * - should not be used in production,
	 *   nor should any trace code be committed; it is usually removed immediately after debugging
	 * - blue
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	traceU(...infos) { this.hades.trace(symbolLogUpdate, this.where, this.what, ...arguments); }
	/**
	 * debugU
	 * - mark as inline update
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function or an unimportant heartbeat
	 * - cyan
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugU(...infos) { this.hades.debug(symbolLogUpdate, this.where, this.what, ...arguments); }
	/**
	 * infoU
	 * - mark as inline update
	 * - used to record regular summaries or expected exception data that can be handled
	 * - green
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoU(...infos) { this.hades.info(symbolLogUpdate, this.where, this.what, ...arguments); }
	/**
	 * warnU
	 * - mark as inline update
	 * - used to record operational data that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can reconnect later
	 * - yellow
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnU(...infos) { this.hades.warn(symbolLogUpdate, this.where, this.what, ...arguments); }
	/**
	 * errorU
	 * - mark as inline update
	 * - used to record abnormal logic and unexpected error data
	 * - such as when inserting data into the database
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorU(...infos) { this.hades.error(symbolLogUpdate, this.where, this.what, ...arguments); }
	/**
	 * fatalU
	 * - mark as inline update
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exceptions or unexpected file read/write errors
	 * - magenta
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalU(...infos) { this.hades.fatal(symbolLogUpdate, this.where, this.what, ...arguments); }
	/**
	 * markU
	 * - mark as inline update
	 * - used to record necessary descriptions of unrelated operational conditions
	 * - unless the log is turned off, it will always be output
	 * - such as copyright descriptions and precautions
	 * - grey
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markU(...infos) { this.hades.mark(symbolLogUpdate, this.where, this.what, ...arguments); }


	/**
	 * traceD
	 * - mark as end of inline update
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in a loop
	 * - should not be used in production,
	 *   nor should any trace code be committed; it is usually removed immediately after debugging
	 * - blue
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	traceD(...infos) { this.hades.trace(symbolLogDone, this.where, this.what, ...arguments); }
	/**
	 * debugD
	 * - mark as end of inline update
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function or an unimportant heartbeat
	 * - cyan
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugD(...infos) { this.hades.debug(symbolLogDone, this.where, this.what, ...arguments); }
	/**
	 * infoD
	 * - mark as end of inline update
	 * - used to record regular summaries or expected exception data that can be handled
	 * - green
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoD(...infos) { this.hades.info(symbolLogDone, this.where, this.what, ...arguments); }
	/**
	 * warnD
	 * - mark as end of inline update
	 * - used to record operational data that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can reconnect later
	 * - yellow
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnD(...infos) { this.hades.warn(symbolLogDone, this.where, this.what, ...arguments); }
	/**
	 * errorD
	 * - mark as end of inline update
	 * - used to record abnormal logic and unexpected error data
	 * - such as when inserting data into the database
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorD(...infos) { this.hades.error(symbolLogDone, this.where, this.what, ...arguments); }
	/**
	 * fatalD
	 * - mark as end of inline update
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exceptions or unexpected file read/write errors
	 * - magenta
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalD(...infos) { this.hades.fatal(symbolLogDone, this.where, this.what, ...arguments); }
	/**
	 * markD
	 * - mark as end of inline update
	 * - used to record necessary descriptions of unrelated operational conditions
	 * - unless the log is turned off, it will always be output
	 * - such as copyright descriptions and precautions
	 * - grey
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markD(...infos) { this.hades.mark(symbolLogDone, this.where, this.what, ...arguments); }

	/**
	 * fatalE
	 * - exit with the specified exit code
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exceptions or unexpected file read/write errors
	 * - magenta
	 * @param {number} code exit code
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalE(code, ...infos) {
		this.hades.fatal(symbolLogDone, this.where, this.what, ...infos);

		process.exit(code);
	}
}
