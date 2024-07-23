export function highlight(string: string, willHighlight?: boolean | undefined): string;
export default formatLog;
/**
 *
 * @param {import('log4js').LoggingEvent} event
 * @param {boolean} willHighlight
 * @param {boolean} willColorfulLevel
 * @param {string} templateTime
 * @param {import('@nuogz/i18n').NamespacelizedLocalizedTranslator} T
 * @returns
 */
declare function formatLog(event: import("log4js").LoggingEvent, willHighlight: boolean | undefined, willColorfulLevel: boolean | undefined, templateTime: string | undefined, T: import("@nuogz/i18n").NamespacelizedLocalizedTranslator): string[];
