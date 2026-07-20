import logUpdate from 'log-update';

import { symbolLogDone, symbolLogUpdate } from './FileAppenderModule.js';

/** @import { AppenderModule } from 'log4js' */
/** @import { ConsoleAppenderConfig } from '../types.ts' */



const console = globalThis.console;
const consoleLog = console.log.bind(console);
const consoleError = console.error.bind(console);


/**
 * Custom log4js console appender module
 * Outputs styled logs to the console with inline update support
 * @type {AppenderModule}
 */
export const moduleAppenderConsole = {
	/** @param {ConsoleAppenderConfig} config */
	configure: config => {
		return event => {
			const { handle } = config;

			const symbolLog = event.data[0] === symbolLogUpdate || event.data[0] === symbolLogDone
				? event.data.shift()
				: void 0;


			const [logFinal, logError] = handle(event, config);


			if(logError && config.hades.willOutputConsoleError) {
				logUpdate.done();

				consoleError(logError);
			}
			else if(symbolLog === symbolLogUpdate) {
				logUpdate(logFinal);
			}
			else if(symbolLog === symbolLogDone) {
				logUpdate(logFinal);

				logUpdate.done();
			}
			else {
				consoleLog(logFinal);
			}
		};
	}
};
