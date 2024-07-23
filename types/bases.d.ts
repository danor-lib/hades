import { AppenderModule, LoggingEvent } from "log4js";
import Hades from "./index.js";
import { NamespacelizedLocalizedTranslator } from "@nuogz/i18n";



export type HadesOption = {
	/**
	 * Specifies the name of the Hades instance, which is also the log file name by default
	 * @default 'default'
	 * @type {string}
	 */
	name?: string;
	/**
	 * Specify the minimum log level at which Hades will handle
	 * @default 'all'
	 * @type {string}
	 * @see {@link https://log4js-node.github.io/log4js-node/api}
	 */
	level?: string;
	/**
	 * Specify the directory in which logs are stored
	 * - If do not specify a directory, logs will not be saved to a file
	 * @type {string}
	 */
	dirLog?: string;


	/**
	 * Specify the end-of-line marker of log files
	 * @type {string}
	 */
	eol?: string;
	/**
	 * Specify the time template of logs
	 * @default 'MM-DD HH:mm:ss:SSS'
	 * @type {string}
	 */
	templateTime?: string;
	/**
	 * Specify the maximum size of a log file
	 * @default 20971520 // 20MB
	 * @type {string}
	 */
	sizeFileLogMax?: number;
	/**
	 * Specify the number of old log files to keep
	 * @default 0
	 * @type {number}
	 * @see {@link https://github.com/log4js-node/streamroller}
	 */
	numberFileLogBackup?: number;


	/**
	 * Specifies whether Hades will output styling highlighted logs
	 * @default true
	 * @type {boolean}
	 */
	willHighlight?: boolean;
	/**
	 * Specifies whether Hades will output colorful logs based on log level
	 * @default true
	 * @type {boolean}
	 */
	willColorfulLevel?: boolean;
	/**
	 * Specifies whether Hades will output initialized information after initialization
	 * @default true
	 * @type {boolean}
	 */
	willOutputInitInfo?: boolean;
	/**
	 * Specifies whether Hades will output the directory where logs are located after initialization
	 * @default false
	 * @type {boolean}
	 */
	willOutputLogDir?: boolean;
	/**
	 * Specifies whether Hades will output error logs in console stream
	 * @default false
	 * @type {boolean}
	 */
	willOutputConsoleError?: boolean;
	/**
	 * Specifies whether Hades will be initialized immediately after construct
	 * @default true
	 * @type {boolean}
	 */
	willInitImmediate?: boolean;
};


export type BaseAppenderConfig = {
	type: AppenderModule;
	hades: Hades;
	T: NamespacelizedLocalizedTranslator;
	handle(event: LoggingEvent, config: BaseAppenderConfig): any;
}

export type ConsoleAppenderConfig = BaseAppenderConfig
export type FileAppenderConfig = BaseAppenderConfig & { path: string; }
