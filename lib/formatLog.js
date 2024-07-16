import Chalk from 'chalk';
import Day from 'dayjs';

import DayCustomParseFormatPlugin from 'dayjs/plugin/customParseFormat.js';



Day.extend(DayCustomParseFormatPlugin);



/**
 * @param {string} string
 * @param {boolean} [willHighlight=true]
 * @returns {string}
 */
export const highlight = (string, willHighlight = true) =>
	String(string)
		.replace(/(?<!\\)~(?<!\\)\[(.*?)(?<!\\)\]/g, willHighlight ? Chalk.underline.bold('$1') : '$1')
		.replace(/(?<!\\)~(?<!\\)\{(.*?)(?<!\\)\}/g, willHighlight ? Chalk.white('[$1]') : '[$1]')
		.replace(/\\([~{}[\]])/g, '$1')
	;


const isErrorLike = object => object instanceof Error || (object?.stack && object?.message);



/**
 *
 * @param {import('log4js').LoggingEvent} event
 * @param {boolean} willHighlight
 * @param {import('@nuogz/i18n').TranslatorWithGlobalLocale} T
 * @returns
 */
const formatLog = (event, willHighlight, T) => {
	const { startTime, level: { colour, levelStr }, data: datas } = event;
	if(!datas.length) { return ['']; }


	const color = colour;
	const level = T(`level.${levelStr}`);
	const time = Day(startTime).format('YY-MM-DD HH:mm:ss:SSS');


	const texts = [];
	const errors = [];
	for(let i = 2; i < datas.length; i++) {
		const data = datas[i];

		if(data === undefined) { continue; }

		if(isErrorLike(data)) {
			errors.push(data);

			texts.push(String(data.message));

			let causeNow = data.cause;
			while(isErrorLike(causeNow)) {
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


	let where = datas[0];
	let action = datas[1];
	let resultAll = texts.join('\n\t');

	where = highlight(where, willHighlight);
	action = highlight(action, willHighlight);
	resultAll = highlight(resultAll, willHighlight);


	let logFinal =
		`[${time}][${level}] ${where}` +
		(action ? ` => ${action}` : '') +
		(resultAll ? `\t${resultAll}` : '')
		;
	if(willHighlight) { logFinal = Chalk[color](logFinal); }


	const logError = [
		logFinal,
		'-------------- Stack --------------',
		errors
			.map(error =>
				(willHighlight ? Chalk[color](highlight(error.message)) : error.message) +
				(error.stack ? `\n${String(error.stack).replace(/ {4}/g, '\t')}` : '') +
				(error.data ? `\n[Data] ${error.data}` : '')
			)
			.join('\n--------------\n'),
		'===================================\n',
	].join('\n');


	return errors.length ? [logFinal, logError] : [logFinal];
};



export default formatLog;
