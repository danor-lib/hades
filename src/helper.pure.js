import { vof } from '@danor-lib/error';



/**
 * Return the value and its `vof` type as a combined string
 * @param {unknown} value
 * @returns {string}
 */
export const vtof = (value) => {
	const vtype = vof(value);

	if(vtype == 'object') {
		try {
			return `${JSON.stringify(value)}|${vtype}`;
		}
		catch {
			return `<stringify-failed object>|${vtype}`;
		}
	}

	return `${value}|${vtype}`;
};

/**
 * Escape special characters in a string for highlighting in Hades
 * @param {string} string
 * @returns {string}
 */
export const escapeHighlight = (string) => { return string.replace(/[\\~}\]>|]/g, '\\$&'); };

/**
 * Wrap a field for highlighting in Hades
 * @param {unknown} field
 * @returns {string}
 */
export const wf = (field) => { return `~[${escapeHighlight(String(field))}]`; };

/**
 * Wrap a value for highlighting in Hades
 * @param {unknown} value
 * @returns {string}
 */
export const wv = (value) => { return `~{${escapeHighlight(String(value))}}`; };

/**
 * Wrap a value and its `vof` type for highlighting in Hades
 * @param {unknown} value
 * @returns {string}
 */
export const wvt = (value) => {
	const vtype = vof(value);

	if(vtype == 'object') {
		try {
			return `${JSON.stringify(value)}|${vtype}`;
		}
		catch {
			return `<stringify-failed object>|${vtype}`;
		}
	}

	return `~<${escapeHighlight(String(value))}|${vtype}>`;
};
