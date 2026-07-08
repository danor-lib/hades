import type { LoggingEvent } from 'log4js';



export function highlight(string: string, willHighlight?: boolean): string;

export function formatLog(
	event: LoggingEvent,
	willHighlight?: boolean,
	willColorLevel?: boolean,
	templateTime?: string,
	textsHades?: {
		'error-encounter': string;
		level: Record<string, string>;
	}
): [string] | [string, string];
