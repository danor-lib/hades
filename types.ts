import type { AppenderModule, LoggingEvent } from 'log4js';

import type { Hades } from './src/Hades.js';



type I18NTexts = { readonly [key: string]: string | I18NTexts; };


export type HadesOption = {
	/**
	 * Specify the name of the Hades instance, which is also the log file name by default
	 * @default 'default'
	 * @type {string}
	 */
	name?: string;
	/**
	 * Specify the minimum log level that Hades will handle
	 * @default 'all'
	 * @type {string}
	 * @see {@link https://log4js-node.github.io/log4js-node/api}
	 */
	level?: string;
	/**
	 * Specify the directory in which logs are stored
	 * - If no directory is specified, logs will not be saved to a file
	 * @type {string}
	 */
	dirn?: string;


	/**
	 * Specify the end-of-line marker of log files
	 * @type {string}
	 */
	eol?: string;
	/**
	 * Specify the time template of logs
	 * @default 'MM-DD HH:mm:ss:SSS'
	 * @type {string}
	 * @see {@link https://day.js.org/docs/en/display/format}
	 */
	templateTime?: string;
	/**
	 * Specify the maximum size of a log file
	 * @default 20971520 // 20MB
	 * @type {number}
	 */
	sizeFileLogMax?: number;
	/**
	 * Specify the number of old log files to keep
	 * @default 0
	 * @type {number}
	 * @see {@link https://github.com/log4js-node/streamroller}
	 */
	numberFileLogBackupMax?: number;


	/**
	 * Specify whether Hades outputs styled and highlighted logs
	 * @default true
	 * @type {boolean}
	 */
	willHighlight?: boolean;
	/**
	 * Specify whether Hades outputs color-coded logs based on log level
	 * @default true
	 * @type {boolean}
	 */
	willColorLevel?: boolean;
	/**
	 * Specify whether Hades outputs initialization information after setup
	 * @default true
	 * @type {boolean}
	 */
	willOutputInitInfo?: boolean;
	/**
	 * Specify whether Hades outputs error logs in the console stream
	 * @default false
	 * @type {boolean}
	 */
	willConsoleOutputError?: boolean;
	/**
	 * Specify whether Hades initializes immediately after construction
	 * @default true
	 * @type {boolean}
	 */
	willInitImmediate?: boolean;


	texts?: I18NTexts;
};


/**
 * Base configuration for custom appender modules
 */
export type BaseAppenderConfig = {
	type: AppenderModule;
	hades: Hades;
	/**
	 * Handle a logging event and produce formatted output
	 * @param event - The logging event to handle
	 * @param config - The appender configuration
	 */
	handle(event: LoggingEvent, config: BaseAppenderConfig): any;
};

/**
 * Configuration for the console appender module
 */
export type ConsoleAppenderConfig = BaseAppenderConfig;

/**
 * Configuration for the file appender module
 */
export type FileAppenderConfig = BaseAppenderConfig & { path: string; };
