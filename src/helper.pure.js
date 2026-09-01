import { vof } from '@danor-lib/error';



/**
 * Return the value and its `vof` type as a combined string
 * @param {unknown} value
 * @returns {string}
 */
export const vtof = (value) => {
	const typeValue = vof(value);

	if(typeValue == 'object') {
		try {
			return `${JSON.stringify(value)}|${vof(value)}`;
		}
		catch {
			return `<stringify-failed object>|${vof(value)}`;
		}
	}

	return `${value}|${vof(value)}`;
};


/**
 * Wrap a field for highlighting in Hades
 * @param {unknown} field
 * @returns {string}
 */
export const wf = (field) => { return `~[${field}]`; };

/**
 * Wrap a value for highlighting in Hades
 * @param {unknown} value
 * @returns {string}
 */
export const wv = (value) => { return `~{${value}}`; };

/**
 * Wrap a value and its `vof` type for highlighting in Hades
 * @param {unknown} value
 * @returns {string}
 */
export const wvt = (value) => { return `~<${vtof(value)}>`; };
