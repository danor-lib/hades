import logUpdate from 'log-update';

import { symbolLogDone, symbolLogUpdate } from './symbol.js';



const console = globalThis.console;
const consoleLog = console.log.bind(console);
const consoleError = console.error.bind(console);


/** @type {import('log4js').AppenderModule} */
const moduleAppenderConsole = {
	/** @param {import('../bases.js').ConsoleAppenderConfig} config */
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



export default moduleAppenderConsole;
