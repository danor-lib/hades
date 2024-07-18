import { normalize } from 'path';
import { EOL } from 'os';

import streams from 'streamroller';



const console = globalThis.console;
const consoleError = console.error.bind(console);

const openRollingFileStream = (path, sizeFileLog, numberFileLogBackup, option) => {
	return new streams.RollingFileStream(path, sizeFileLog, numberFileLogBackup, option)
		.on('error', error => consoleError('log4js.fileAppender - Writing to file %s, error happened ', path, error))
		.on('drain', () => process.emit('log4js:pause', false));
};



/** @type {import('log4js').AppenderModule} */
const moduleAppenderFile = {
	/** @param {import('../bases.js').FileAppenderConfig} config */
	configure: config => {
		const { hades, handle } = config;

		const path = normalize(config.path);
		const { eol, sizeFileLogMax, numberFileLogBackup } = hades;



		let stream = openRollingFileStream(path, sizeFileLogMax, numberFileLogBackup, config);

		/** @type {import('log4js').AppenderFunction} */
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



export default moduleAppenderFile;
