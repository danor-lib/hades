import { dirname, resolve as resolvePath } from 'path';
import { fileURLToPath } from 'url';

import Log4JS from 'log4js';

import formatLog from './lib/formatLog.js';
import { symbolLogUpdate, symbolLogDone } from './lib/symbol.js';

import moduleAppenderFile from './lib/FileAppenderModule.js';
import moduleAppenderConsole from './lib/ConsoleAppenderModule.js';

import { copyJSON } from '@nuogz/utility';
import { loadI18NResource, TT } from '@nuogz/i18n';



loadI18NResource('@nuogz/hades', resolvePath(dirname(fileURLToPath(import.meta.url)), 'locale'));

const { T, TS } = TT('@nuogz/hades');



const globalTop = globalThis ?? global;
const NI18N = globalTop.NI18N;


const escapeFromHades = value => value?.toString?.()?.replace?.(/([~{}[\]])/g, '\\$1') ?? value;
const escapeFromI18Next = NI18N.translator.interpolator.escape;


NI18N.services.formatter.add('typeof', value => typeof value);

NI18N.services.formatter.add('term', value => `~[${escapeFromHades(value)}]`);
NI18N.services.formatter.add('value', value => `~{${escapeFromHades(value)}}`);

NI18N.services.formatter.add('valueType', value => `~{${escapeFromI18Next(escapeFromHades(value))} <${typeof value}>}`);
NI18N.services.formatter.add('valueTypeUnescape', value => `~{${escapeFromHades(value)} <${typeof value}>}`);
NI18N.services.formatter.add('valueJSON', value => `~{${escapeFromI18Next(escapeFromHades(JSON.stringify(value)))}`);
NI18N.services.formatter.add('valueJSONUnescape', value => `~{${escapeFromHades(JSON.stringify(value))}`);

NI18N.services.formatter.add('valueTypeof', value => `~{${typeof value}}`);


/** @typedef {import('./bases.d.ts').HadesOption} HadesOption */


/**
 * Log4JS Total Configuration
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


export { symbolLogUpdate, symbolLogDone };


const parseEnvironments = () => {
	/** @type {Object<string,string>} */
	const environments = {};


	try {
		const entries = [...new globalTop.URL(`https://world.peace?${process.env?.NENV_HADES ?? ''}`).searchParams.entries()];


		for(const [key, value] of entries) { environments[key.toLowerCase()] = value; }
	}
	catch { void 0; }


	return environments;
};
const parseEnvironmentFlag = string =>
	string == 'true' ? true
		: string == 'false' ? false :
			string === '' ? undefined : string;



/**
 * @param {Error|string} message
 * @param {any} [cause]
 * @returns {Error}
 */
export const ErrorCause = (message, cause) => {
	const error = message instanceof Error ? message : Error(message, { cause });

	if(cause !== undefined && !('cause' in error)) { error.cause = cause; }

	return error;
};


/**
 * @param {Error|string} message
 * @param {any} [data]
 * @returns {Error}
 */
export const ErrorData = (message, data) => {
	const error = message instanceof Error ? message : Error(message);

	if(data !== undefined) { error.data = data; }

	return error;
};



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
 * @class
 */
export default class Hades {
	/**
	 * Specifies the name of the Hades instance, which is also the log file name by default
	 * @default 'default'
	 * @type {string}
	 */
	name;
	/**
	 * Specify the minimum log level at which Hades will handle
	 * @default 'all'
	 * @type {string}
	 * @see {@link https://log4js-node.github.io/log4js-node/api}
	 */
	level;
	/**
	 * Specify the directory in which logs are stored
	 * - If do not specify a directory, logs will not be saved to a file
	 * @type {string}
	 */
	dirLog;


	/**
	 * Specify the end-of-line marker of log files
	 * @type {string}
	 */
	eol;
	/**
	 * Specify the time template of logs
	 * @default 'MM-DD HH:mm:ss:SSS'
	 * @type {string}
	 * @see {@link https://day.js.org/docs/en/display/format}
	 */
	templateTime;
	/**
	 * Specify the maximum size of a log file
	 * @default 20971520 // 20MB
	 * @type {number}
	 */
	sizeFileLogMax;

	/**
	 * Specify the number of old log files to keep
	 * @default 0
	 * @type {number}
	 * @see {@link https://github.com/log4js-node/streamroller}
	 */
	numberFileLogBackup;


	/**
	 * Specifies whether Hades will output styling highlighted logs
	 * @default true
	 * @type {boolean}
	 */
	willHighlight;
	/**
	 * Specifies whether Hades will output colorful logs based on log level
	 * @default true
	 * @type {boolean}
	 */
	willColorfulLevel;
	/**
	 * Specifies whether Hades will output initialized information after initialization
	 * @default true
	 * @type {boolean}
	 */
	willOutputInitInfo;
	/**
	 * Specifies whether Hades will output the directory where logs are located after initialization
	 * @default false
	 * @type {boolean}
	 */
	willOutputLogDir;
	/**
	 * Specifies whether Hades will output error logs in console stream
	 * @default false
	 * @type {boolean}
	 */
	willOutputConsoleError;
	/**
	 * Specifies whether Hades will be initialized immediately after construct
	 * @default true
	 * @type {boolean}
	 */
	willInitImmediate;


	/**
	 * Log4JS Logger instance
	 * @type {Log4JS.Logger}
	 */
	logger;


	/**
	 * Indicates whether Hades has initialized the logger
	 * @type {boolean}
	 */
	inited = false;


	/** @param {HadesOption} [option] */
	constructor(option) {
		const environments = parseEnvironments();


		this.name = option?.name ?? environments.name ?? 'default';
		this.level = option?.level ?? environments.level ?? 'all';
		this.dirLog = option?.dirLog ?? environments.dirlog;

		this.eol = option?.eol ?? environments.eol;
		this.templateTime = option?.templateTime ?? environments.templatetime ?? 'MM-DD HH:mm:ss:SSS';
		this.sizeFileLogMax = option?.sizeFileLogMax ?? environments.sizefilelogmax ?? 1024 * 1024 * 20;
		this.numberFileLogBackup = option?.numberFileLogBackup ?? environments.numberfilelogbackup ?? 0;

		this.willHighlight = option?.willHighlight ?? parseEnvironmentFlag(environments.willhighlight) ?? true;
		this.willColorfulLevel = option?.willColorfulLevel ?? parseEnvironmentFlag(environments.willColorfulLevel) ?? true;
		this.willOutputInitInfo = option?.willOutputInitInfo ?? parseEnvironmentFlag(environments.willoutputinitinfo) ?? true;
		this.willOutputLogDir = option?.willOutputLogDir ?? parseEnvironmentFlag(environments.willoutputlogdir) ?? false;
		this.willOutputConsoleError = option?.willOutputConsoleError ?? parseEnvironmentFlag(environments.willoutputconsoleerror) ?? false;
		this.willInitImmediate = option?.willInitImmediate ?? parseEnvironmentFlag(environments.willinitimmediate) ?? true;


		if(this.willInitImmediate) { this.init(); }
	}


	/** init Hades */
	init() {
		const { name, level, dirLog, willOutputInitInfo, willOutputLogDir } = this;


		/** @type {Log4JS.Configuration} */
		const configure = copyJSON(configureStatic);
		/** @type {Log4JS.Appender[]} */
		const appenders = [];



		const nameAppenderConsole = `${name}-console`;
		/** @type {import('./bases.d.ts').ConsoleAppenderConfig} */
		const configAppenderConsole = {
			type: moduleAppenderConsole,
			hades: this,
			T,
			handle: (event, { hades, T: Translator }) => formatLog(event, hades.willHighlight, hades.willColorfulLevel, hades.templateTime, Translator),
		};
		configure.appenders[nameAppenderConsole] = configAppenderConsole;
		appenders.push(nameAppenderConsole);


		if(dirLog) {
			const nameAppenderFile = `${name}-file`;

			/** @type {import('./bases.d.ts').FileAppenderConfig} */
			const configAppenderFile = {
				type: moduleAppenderFile,
				hades: this,
				T,
				handle: (event, { hades, T: Translator }) => formatLog(event, hades.willHighlight, hades.willColorfulLevel, hades.templateTime, Translator)[0],
				path: resolvePath(dirLog, `${name}.log`)
			};
			configure.appenders[nameAppenderFile] = configAppenderFile;
			appenders.push(nameAppenderFile);


			const nameAppenderFileStack = `${name}-file-stack`;

			/** @type {import('./bases.d.ts').FileAppenderConfig} */
			const configAppenderFileStack = {
				type: moduleAppenderFile,
				hades: this,
				T,
				handle: (event, { hades, T: TScoped }) => formatLog(event, hades.willHighlight, hades.willColorfulLevel, hades.templateTime, TScoped)[1],
				path: resolvePath(dirLog, `${name}.stack.log`)
			};

			configure.appenders[nameAppenderFileStack] = configAppenderFileStack;
			appenders.push(nameAppenderFileStack);
		}



		configure.categories[name] = { appenders, level };


		this.logger = Log4JS.configure(configure).getLogger(name);

		this.inited = true;


		if(willOutputInitInfo) {
			if(dirLog && willOutputLogDir) {
				this.info(...TS('', 'name', 'init', '✔', `${T('path')}~{${dirLog}}`));
			}
			else {
				this.info(...TS('', 'name', 'init', '✔'));
			}
		}


		return this;
	}

	/**
	 * reload logger asynchronously
	 * @returns {Promise<Hades>}
	 */
	reload() {
		return new Promise((resolver, rejecter) =>
			Log4JS.shutdown(error => error ? resolver(this.init()) : rejecter(error))
		);
	}



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
	trace(where, what, ...infos) { this.logger.trace(...arguments); }
	/**
	 * debug
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debug(where, what, ...infos) { this.logger.debug(...arguments); }
	/**
	 * info
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	info(where, what, ...infos) { this.logger.info(...arguments); }
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
	warn(where, what, ...infos) { this.logger.warn(...arguments); }
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
	error(where, what, ...infos) { this.logger.error(...arguments); }
	/**
	 * fatal
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatal(where, what, ...infos) { this.logger.fatal(...arguments); }
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
	mark(where, what, ...infos) { this.logger.mark(...arguments); }


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
	traceU(where, what, ...infos) { this.logger.trace(symbolLogUpdate, ...arguments); }
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
	debugU(where, what, ...infos) { this.logger.debug(symbolLogUpdate, ...arguments); }
	/**
	 * infoU
	 * - mark as inline update
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoU(where, what, ...infos) { this.logger.info(symbolLogUpdate, ...arguments); }
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
	warnU(where, what, ...infos) { this.logger.warn(symbolLogUpdate, ...arguments); }
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
	errorU(where, what, ...infos) { this.logger.error(symbolLogUpdate, ...arguments); }
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
	fatalU(where, what, ...infos) { this.logger.fatal(symbolLogUpdate, ...arguments); }
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
	markU(where, what, ...infos) { this.logger.mark(symbolLogUpdate, ...arguments); }


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
	traceD(where, what, ...infos) { this.logger.trace(symbolLogDone, ...arguments); }
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
	debugD(where, what, ...infos) { this.logger.debug(symbolLogDone, ...arguments); }
	/**
	 * infoD
	 * - mark as inline update ended
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {string} where
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoD(where, what, ...infos) { this.logger.info(symbolLogDone, ...arguments); }
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
	warnD(where, what, ...infos) { this.logger.warn(symbolLogDone, ...arguments); }
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
	errorD(where, what, ...infos) { this.logger.error(symbolLogDone, ...arguments); }
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
	fatalD(where, what, ...infos) { this.logger.fatal(symbolLogDone, ...arguments); }
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
	markD(where, what, ...infos) { this.logger.mark(symbolLogDone, ...arguments); }

	/**
	 * fatalU
	 * - exit with detect exit code
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
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



/** typed `Hades` with `where` preseted */
export class Melinoe {
	/**
	 * the Hades instance
	 * @type {Hades}
	 */
	hades;
	/**
	 * Specifies preset where
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
	 * trace
	 * - used to record `low-level` data with `high` frequency
	 * - such as `i` in loop
	 * - should not be used in the `production` environment,
	 *   nor should `submit` any trace code. it is usually deleted immediately after debugging
	 * - blue color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	trace(what, ...infos) { this.hades.trace(this.where, ...arguments); }
	/**
	 * debug
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debug(what, ...infos) { this.hades.debug(this.where, ...arguments); }
	/**
	 * info
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	info(what, ...infos) { this.hades.info(this.where, ...arguments); }
	/**
	 * warn
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warn(what, ...infos) { this.hades.warn(this.where, ...arguments); }
	/**
	 * error
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	error(what, ...infos) { this.hades.error(this.where, ...arguments); }
	/**
	 * fatal
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatal(what, ...infos) { this.hades.fatal(this.where, ...arguments); }
	/**
	 * mark
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	mark(what, ...infos) { this.hades.mark(this.where, ...arguments); }


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
	traceU(what, ...infos) { this.hades.trace(symbolLogUpdate, this.where, ...arguments); }
	/**
	 * debugU
	 * - mark as inline update
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugU(what, ...infos) { this.hades.debug(symbolLogUpdate, this.where, ...arguments); }
	/**
	 * infoU
	 * - mark as inline update
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoU(what, ...infos) { this.hades.info(symbolLogUpdate, this.where, ...arguments); }
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
	warnU(what, ...infos) { this.hades.warn(symbolLogUpdate, this.where, ...arguments); }
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
	errorU(what, ...infos) { this.hades.error(symbolLogUpdate, this.where, ...arguments); }
	/**
	 * fatalU
	 * - mark as inline update
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalU(what, ...infos) { this.hades.fatal(symbolLogUpdate, this.where, ...arguments); }
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
	markU(what, ...infos) { this.hades.mark(symbolLogUpdate, this.where, ...arguments); }


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
	traceD(what, ...infos) { this.hades.trace(symbolLogDone, this.where, ...arguments); }
	/**
	 * debugD
	 * - mark as inline update ended
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugD(what, ...infos) { this.hades.debug(symbolLogDone, this.where, ...arguments); }
	/**
	 * infoD
	 * - mark as inline update ended
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoD(what, ...infos) { this.hades.info(symbolLogDone, this.where, ...arguments); }
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
	warnD(what, ...infos) { this.hades.warn(symbolLogDone, this.where, ...arguments); }
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
	errorD(what, ...infos) { this.hades.error(symbolLogDone, this.where, ...arguments); }
	/**
	 * fatalD
	 * - mark as inline update ended
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalD(what, ...infos) { this.hades.fatal(symbolLogDone, this.where, ...arguments); }
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
	markD(what, ...infos) { this.hades.mark(symbolLogDone, this.where, ...arguments); }

	/**
	 * fatalU
	 * - exit with detect exit code
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {number} code exit code
	 * @param {string} what
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalE(code, what, ...infos) {
		this.hades.fatal(symbolLogDone, this.where, what, ...infos);

		process.exit(code);
	}
}



/** typed `Hades` with `where` and `what` preseted */
export class Zagreus {
	/**
	 * the Hades instance
	 * @type {Hades}
	 */
	hades;
	/**
	 * Specifies preset where
	 * @type {string}
	 */
	where;
	/**
	 * Specifies preset what
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
	 * - such as `i` in loop
	 * - should not be used in the `production` environment,
	 *   nor should `submit` any trace code. it is usually deleted immediately after debugging
	 * - blue color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	trace(...infos) { this.hades.trace(this.where, this.what, ...arguments); }
	/**
	 * debug
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debug(...infos) { this.hades.debug(this.where, this.what, ...arguments); }
	/**
	 * info
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	info(...infos) { this.hades.info(this.where, this.what, ...arguments); }
	/**
	 * warn
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warn(...infos) { this.hades.warn(this.where, this.what, ...arguments); }
	/**
	 * error
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	error(...infos) { this.hades.error(this.where, this.what, ...arguments); }
	/**
	 * fatal
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatal(...infos) { this.hades.fatal(this.where, this.what, ...arguments); }
	/**
	 * mark
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	mark(...infos) { this.hades.mark(this.where, this.what, ...arguments); }


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
	traceU(...infos) { this.hades.trace(symbolLogUpdate, this.where, this.what, ...arguments); }
	/**
	 * debugU
	 * - mark as inline update
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugU(...infos) { this.hades.debug(symbolLogUpdate, this.where, this.what, ...arguments); }
	/**
	 * infoU
	 * - mark as inline update
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoU(...infos) { this.hades.info(symbolLogUpdate, this.where, this.what, ...arguments); }
	/**
	 * warnU
	 * - mark as inline update
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnU(...infos) { this.hades.warn(symbolLogUpdate, this.where, this.what, ...arguments); }
	/**
	 * errorU
	 * - mark as inline update
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorU(...infos) { this.hades.error(symbolLogUpdate, this.where, this.what, ...arguments); }
	/**
	 * fatalU
	 * - mark as inline update
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalU(...infos) { this.hades.fatal(symbolLogUpdate, this.where, this.what, ...arguments); }
	/**
	 * markU
	 * - mark as inline update
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markU(...infos) { this.hades.mark(symbolLogUpdate, this.where, this.what, ...arguments); }


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
	traceD(...infos) { this.hades.trace(symbolLogDone, this.where, this.what, ...arguments); }
	/**
	 * debugD
	 * - mark as inline update ended
	 * - used to record `calculation results` with `low` frequency
	 * - such as the result of a function, or not important heartbeat
	 * - cyan color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	debugD(...infos) { this.hades.debug(symbolLogDone, this.where, this.what, ...arguments); }
	/**
	 * infoD
	 * - mark as inline update ended
	 * - used to record regular summaries, or expected exception datas that can be handled
	 * - green color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	infoD(...infos) { this.hades.info(symbolLogDone, this.where, this.what, ...arguments); }
	/**
	 * warnD
	 * - mark as inline update ended
	 * - used to record operation datas that may cause exceptions
	 * - such as the database connection timed out during the startup of the program,
	 *   but the program can be connected again later
	 * - yellow color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	warnD(...infos) { this.hades.warn(symbolLogDone, this.where, this.what, ...arguments); }
	/**
	 * errorD
	 * - mark as inline update ended
	 * - used to record abnormal logic and unexpected error datas
	 * - such as when inserting data into the database.
	 *   but the necessary fields are empty, resulting in business interruption
	 * - red color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	errorD(...infos) { this.hades.error(symbolLogDone, this.where, this.what, ...arguments); }
	/**
	 * fatalD
	 * - mark as inline update ended
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalD(...infos) { this.hades.fatal(symbolLogDone, this.where, this.what, ...arguments); }
	/**
	 * markD
	 * - mark as inline update ended
	 * - used to record the necessary descriptions of unrelated operation conditions
	 * - unless the log is turned off, it will be output
	 * - such as copyright description and precautions
	 * - grey color
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	markD(...infos) { this.hades.mark(symbolLogDone, this.where, this.what, ...arguments); }

	/**
	 * fatalU
	 * - exit with detect exit code
	 * - used to record critical logs that cause the program to exit
	 * - such as unhandled exception, unexpected file read and write
	 * - magenta color
	 * @param {number} code exit code
	 * @param {any[]} infos the first content will not wrap, and the second content will wrap with indent
	 */
	fatalE(code, ...infos) {
		this.hades.fatal(symbolLogDone, this.where, this.what, ...infos);

		process.exit(code);
	}
}
