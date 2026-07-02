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


const likeError = object => object instanceof Error || (object?.stack && object?.message);



/**
 *
 * @param {import('log4js').LoggingEvent} event
 * @param {boolean} willHighlight
 * @param {boolean} willColorfulLevel
 * @param {string} templateTime
 * @param {import('@nuogz/i18n').NamespacelizedLocalizedTranslator} T
 * @returns
 */
const formatLog = (event, willHighlight = true, willColorfulLevel = true, templateTime = 'MM-DD HH:mm:ss:SSS', T) => {
	const { startTime, level: { colour, levelStr }, data: datas } = event;
	if(!datas.length) { return ['']; }


	const color = colour;
	const level = T(`level.${levelStr}`);
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

	if(likeError(datas[2])) { texts[0] = `--> ${texts[0]}`; texts.unshift(T('default-error')); }


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
	if(willHighlight && willColorfulLevel) { logFinal = Chalk[color](logFinal); }


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



export default formatLog;
