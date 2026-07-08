import { normalize } from 'node:path';
import { EOL } from 'node:os';

import Log4JS from 'log4js';
import LoggingEvent from 'log4js/lib/LoggingEvent.js';
import StreamRoller from 'streamroller';

import formatLog from './formatLog.js';

/** @import { AppenderFunction, AppenderModule } from 'log4js' */
/** @import { FileAppenderConfig } from '../types.ts' */
/** @import { Hades } from './Hades.js' */



const console = globalThis.console;
const consoleError = console.error.bind(console);


/**
 * Open a rolling file stream with error handling and drain events
 * @param {string} path
 * @param {number} sizeFileLog
 * @param {number} numberFileLogBackup
 * @param {any} options
 * @param {Hades} hades
 */
const openRollingFileStream = (path, sizeFileLog, numberFileLogBackup, options, hades) => {
	return new StreamRoller.RollingFileStream(path, sizeFileLog, numberFileLogBackup, options)
		.on('error', error => consoleError(formatLog(
			new LoggingEvent(
				hades.name, Log4JS.levels.ERROR,
				[hades.texts['name'], 'FileAppender', `✘ ${hades.texts['error-encounter']}`, path, error],
				hades.logger?.context ?? {}, undefined,
				error,
			),
			hades.willHighlight, hades.willColorLevel, hades.templateTime, hades.texts)[0]),
		)
		.on('drain', () => process.emit('log4js:pause', false));
};


/** Symbol to mark a log as an inline update */
export const symbolLogUpdate = Symbol('log-update');
/** Symbol to mark a log as the end of an inline update */
export const symbolLogDone = Symbol('log-done');



/**
 * Custom log4js file appender module
 * Writes formatted logs to rolling files with SIGHUP handling
 * @type {AppenderModule}
 */
export const moduleAppenderFile = {
	/** @param {FileAppenderConfig} config */
	configure: config => {
		const { hades, handle } = config;

		const path = normalize(config.path);
		const { eol, sizeFileLogMax, numberFileLogBackup } = hades;



		let stream = openRollingFileStream(path, sizeFileLogMax, numberFileLogBackup, config.optionsStreamRoller, hades);

		/** @type {AppenderFunction} */
		const appender = event => {
			const log = handle(event, config);

			if(log !== undefined && !stream.write(log + (eol ?? EOL), 'utf8')) {
				process.emit('log4js:pause', true);
			}
		};

		appender.reopen = () => stream.end(() => stream = openRollingFileStream(path, sizeFileLogMax, numberFileLogBackup, config));

		appender.sighupHandler = () => appender.reopen();

		appender.shutdown = complete => {
			process.removeListener('SIGHUP', appender.sighupHandler);

			stream.end('', 'utf-8', complete);
		};

		process.on('SIGHUP', appender.sighupHandler);


		return appender;
	}
};
