import Chalk from 'chalk';
import Day from 'dayjs';

import DayCustomParseFormatPlugin from 'dayjs/plugin/customParseFormat.js';
Day.extend(DayCustomParseFormatPlugin);

/** @import { LoggingEvent } from 'log4js' */
/** @import { Hades } from '../index.js' */



/**
 * @param {string} string
 * @param {boolean} [willHighlight=true]
 * @returns {string}
 */
export const highlight = (string, willHighlight = true) =>
	String(string)
		.replace(/(?<!\\)~(?<!\\)\[(.*?)(?<!\\)\]/g, willHighlight ? Chalk.underline.bold('$1') : '$1')
		.replace(/(?<!\\)~(?<!\\)\{(.*?)(?<!\\)\}/g, willHighlight ? Chalk.white('[$1]') : '[$1]')
		.replace(/\\([~{}[\]])/g, '$1');



/**
 * Check if a value is an Error-like object
 * @param {any} object
 * @returns {boolean}
 */
const likeError = object => object instanceof Error || (object?.stack && object?.message);



/**
 * Format a logging event into styled log strings
 * @param {LoggingEvent} event
 * @param {boolean} willHighlight
 * @param {boolean} willColorLevel
 * @param {string} templateTime
 * @param {Hades['texts']} textsHades
 * @returns {[string] | [string, string]} The formatted log string, and optionally the error stack string
 */
export const formatLog = (event, willHighlight = true, willColorLevel = true, templateTime = 'MM-DD HH:mm:ss:SSS', textsHades) => {
	const { startTime, level: { colour, levelStr }, data: datas } = event;
	if(!datas.length) { return ['']; }


	const color = colour;
	const level = textsHades.level[levelStr];
	const time = Day(startTime).format(templateTime);


	const texts = [];
	const errors = [];
	for(let i = 2; i < datas.length; i++) {
		const data = datas[i];

		if(data === undefined) { continue; }

		if(likeError(data)) {
			errors.push(data);

			texts.push(String(data.message));

			let causeNow = data.cause;
			while(likeError(causeNow)) {
				errors.push(causeNow);

				texts.push(`--> ${causeNow.message}`);

				causeNow = causeNow.cause;
			}

			if(causeNow) { texts.push(`--> ${causeNow}`); }
		}
		else if(data.message) {
			texts.push(String(data.message));
		}
		else {
			texts.push(String(data));
		}
	}

	if(likeError(datas[2])) { texts[0] = `--> ${texts[0]}`; texts.unshift(`✘ ${textsHades['error-encounter']}`); }


	let where = datas[0];
	let action = datas[1];
	let resultAll = texts.join('\n\t');

	where = highlight(where, willHighlight);
	action = highlight(action, willHighlight);
	resultAll = highlight(resultAll, willHighlight);


	let logFinal =
		`[${time}][${level}] ${where}` +
		(action ? ` => ${action}` : '') +
		(resultAll ? `  ${resultAll}` : '')
		;
	if(willHighlight && willColorLevel) { logFinal = Chalk[color](logFinal); }


	const logError = [
		logFinal,
		'-------------- Stack --------------',
		errors
			.map((error, index) =>
				(willHighlight ? Chalk[color](highlight(error.message)) : error.message) +
				(error.stack && index == errors.length - 1 ? `\n${String(error.stack).replace(/ {4}/g, '\t')}` : '') +
				(error.data ? `\n[Data] ${error.data}` : '')
			)
			.join('\n--------------\n'),
		'===================================\n',
	].join('\n');


	return errors.length ? [logFinal, logError] : [logFinal];
};
