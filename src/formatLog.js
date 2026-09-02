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
export const highlight = (string, willHighlight = true) => {
	const white = (text) => (willHighlight ? Chalk.white(text) : text);
	const gray = (text) => (willHighlight ? Chalk.gray(text) : text);
	const boldUnderline = (text) => willHighlight ? Chalk.underline.bold(text) : text;


	const length = string.length;


	const readUntil = (indexBorn, charDead) => {
		let content = '';

		for(let indexRead = indexBorn; indexRead < length; indexRead++) {
			const char = string[indexRead];

			if(char == '\\' && indexRead + 1 < length) {
				content += string[indexRead + 1];
				indexRead++;
			}
			else if(char == charDead) {
				return { content, indexNext: indexRead + 1 };
			}
			else {
				content += char;
			}
		}

		return null;
	};


	let result = '';
	for(let index = 0; index < length; index++) {
		const char = string[index];
		const charNext = string[index + 1];


		// \x -> x
		if(char == '\\' && index + 1 < length) {
			result += charNext;
			index++;

			continue;
		}


		// ~{content}
		if(char == '~' && charNext == '{') {
			const field = readUntil(index + 2, '}');

			if(field) {
				result += boldUnderline(field.content);
				index = field.indexNext - 1;
			}
			else {
				result += '~{';
				index += 1;
			}

			continue;
		}


		// ~[content]
		if(char == '~' && charNext == '[') {
			const value = readUntil(index + 2, ']');

			if(value) {
				result += white(`[${value.content}]`);
				index = value.indexNext - 1;
			}
			else {
				result += '~[';
				index += 1;
			}

			continue;
		}

		// ~<left|right> → left 白色，|right 灰色，整体方括号包裹
		if(char == '~' && charNext == '<') {
			let indexRead = index + 2; // 从 '<' 之后开始扫描

			let value = '';
			let vtype = null;

			let partNow = '';
			let hasSplit = false;
			let isDead = false;

			for(; indexRead < length; indexRead++) {
				const charRead = string[indexRead];

				if(charRead == '\\' && indexRead + 1 < length) {
					partNow += string[indexRead + 1];
					indexRead += 1;
				}
				else if(charRead == '>') {
					if(hasSplit) {
						vtype = partNow;
					}
					else {
						value = partNow;
					}

					isDead = true;
					indexRead += 1;

					break;
				}
				else if(charRead == '|' && !hasSplit) {
					hasSplit = true;

					value = partNow;
					partNow = '|';
				}
				else {
					partNow += charRead;
				}
			}

			if(isDead) {
				if(vtype === null) {
					result += white(`[${value}]`);
				}
				else {
					result +=
						white(`[${value}`) + gray(vtype) + white(']');
				}

				index = indexRead - 1;
			}
			else {
				result += '~<';
				index++;
			}
			continue;
		}


		result += char;
	}


	return result;
};



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
