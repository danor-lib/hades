import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import Log4JS from 'log4js';

import formatLog from './lib/formatLog.js';
import { symbolLogUpdate, symbolLogDone } from './lib/symbol.js';

import moduleAppenderFile from './lib/FileAppenderModule.js';
import moduleAppenderConsole from './lib/ConsoleAppenderModule.js';

import { copyJSON } from '@nuogz/utility';
import { loadI18NResource, TT } from '@nuogz/i18n';



loadI18NResource('@nuogz/hades', resolve(dirname(fileURLToPath(import.meta.url)), 'locale'));

const T = TT('@nuogz/hades');



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


const parseFlagsEnv = () => {
	let textRaw = process.env.NENV_HADES_FLAGS;

	if(textRaw === undefined || !textRaw.trim()) { return {}; }

	const flagsRaw = textRaw.split(',');

	const flagHighlight = flagsRaw.find(f => /^!?Highlight$/i.test(f));
	const flagOutputInited = flagsRaw.find(f => /^!?OutputInited$/i.test(f));
	const flagOutputDirLog = flagsRaw.find(f => /^!?OutputDirLog$/i.test(f));
	const flagInitImmediate = flagsRaw.find(f => /^!?InitImmediate$/i.test(f));

	return {
		willHighlight: flagHighlight === undefined ? void 0 : !flagHighlight.startsWith('!'),
		willOutputInitInfo: flagOutputInited === undefined ? void 0 : !flagOutputInited.startsWith('!'),
		willOutputLogDir: flagOutputDirLog === undefined ? void 0 : !flagOutputDirLog.startsWith('!'),
		willInitImmediate: flagInitImmediate === undefined ? void 0 : !flagInitImmediate.startsWith('!'),
	};
};



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
	 * logger name (file name by default)
	 * @type {string}
	 */
	name;
	/**
	 * log max level
	 * @type {string}
	 */
	level;
	/**
	 * dir of log saved
	 * @type {string}
	 */
	dirLog;
	/**
	 * max size of one log file;
	 * @type {string}
	 */
	sizeLogFileMax;
	/**
	 * the template for log time formatting
	 * @type {string}
	 */
	templateTime;


	/**
	 * will use styling highlight to render logs or not
	 * @type {boolean}
	 */
	willHighlight;
	/**
	 * detect output the initial result after init
	 * @type {boolean}
	 */
	willOutputInitInfo;
	/**
	 * detect output the dir of logs
	 * @type {boolean}
	 */
	willOutputLogDir;
	/**
	 * detect init logger immediately when new instance
	 * @type {boolean}
	 */
	willInitImmediate;
	/**
	 * is inited logger or not
	 * @type {boolean}
	 */
	isInited = false;



	/**
	 * Log4JS's Logger
	 * @type {Log4JS.Logger}
	 */
	logger;



	/**
	 * @param {string} [name]
	 * @param {string} [level]
	 * @param {string} [dirLog]
	 * @param {HadesOption} [option]
	 * @returns {Log4JS.Logger}
	 */
	constructor(name, level, dirLog, option) {
		const env = process.env;

		this.name = name ?? env.NENV_HADES_NAME ?? 'default';
		this.level = level ?? env.NENV_HADES_LEVEL ?? 'all';
		this.dirLog = dirLog ?? env.NENV_HADES_DIR;

		this.sizeLogFileMax = option?.sizeLogFileMax ?? 1024 * 1024 * 20;

		const flags = parseFlagsEnv();

		this.willHighlight = option?.willHighlight ?? flags.willHighlight ?? true;
		this.willOutputInitInfo = option?.willOutputInitInfo ?? flags.willOutputInitInfo ?? true;
		this.willOutputLogDir = option?.willOutputLogDir ?? flags.willOutputLogDir ?? false;
		this.willInitImmediate = option?.willInitImmediate ?? flags.willInitImmediate ?? true;
		this.templateTime = option?.templateTime ?? flags.templateTime ?? 'YY-MM-DD HH:mm:ss:SSS';


		if(this.willInitImmediate) { this.init(); }
	}


	/** init Hades */
	init() {
		const { name, level, dirLog, willHighlight, willOutputInitInfo, willOutputLogDir } = this;


		/** @type {Log4JS.Configuration} */
		const configure = copyJSON(configureStatic);
		/** @type {Log4JS.Appender[]} */
		const appenders = [];


		const nameAppenderConsole = `${name}-console`;
		configure.appenders[nameAppenderConsole] = {
			type: moduleAppenderConsole,
			willHighlight,
			T,
			handle: (event, willHighlightScoped, TScoped) => formatLog(event, willHighlightScoped, TScoped),
		};
		appenders.push(nameAppenderConsole);


		if(dirLog) {
			const nameAppenderFile = `${name}-file`;
			configure.appenders[nameAppenderFile] = {
				type: moduleAppenderFile,
				path: resolve(dirLog, name + '.log'),
				willHighlight, maxLogSize: this.sizeLogFileMax, eol: '\n',
				T,
				handle: (event, willHighlightScoped, TScoped) => formatLog(event, willHighlightScoped, TScoped)[0],
			};
			appenders.push(nameAppenderFile);


			const nameAppenderFileStack = `${name}-file-stack`;
			configure.appenders[nameAppenderFileStack] = {
				type: moduleAppenderFile,
				path: resolve(dirLog, name + '.stack.log'),
				willHighlight, maxLogSize: this.sizeLogFileMax, eol: '\n',
				T: (key, options) => T(key, options),
				handle: (event, willHighlightScoped, TScoped) => formatLog(event, willHighlightScoped, TScoped)[1],
			};
			appenders.push(nameAppenderFileStack);
		}


		configure.categories[name] = { appenders, level };


		this.logger = Log4JS.configure(configure).getLogger(name);

		this.isInited = true;


		if(willOutputInitInfo) {
			if(dirLog && willOutputLogDir) {
				this.info(T('name'), T('init'), '✔ ', `${T('init')}~{${dirLog}}`);
			}
			else {
				this.info(T('name'), T('init'), '✔ ');
			}
		}


		return this;
	}

	/**
	 * reload logger asynchronously
	 * @returns {Promise<Hades>}
	 */
	async reload() {
		return new Promise((resolver, rejecter) =>
			Log4JS.shutdown(error => error ? resolver(this.init()) : rejecter(error))
		);
	}


	/**
	 * the symbol of console line update
	 */
	get symbolLogUpdate() { return symbolLogUpdate; }
	/**
	 * the symbol of console line update ended
	 */
	get symbolLogDone() { return symbolLogDone; }


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
}
