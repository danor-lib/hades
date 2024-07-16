export function highlight(string: string, willHighlight?: boolean | undefined): string;
export default formatLog;
/**
 *
 * @param {import('log4js').LoggingEvent} event
 * @param {boolean} willHighlight
 * @param {import('@nuogz/i18n').TranslatorWithGlobalLocale} T
 * @returns
 */
declare function formatLog(event: import("log4js").LoggingEvent, willHighlight: boolean, T: import("@nuogz/i18n").TranslatorWithGlobalLocale): string[];
