/* eslint-disable const-immutable/no-mutation */
const idCounter = {};

export default function uniqueId(prefix = "$unique$") {
	if (!idCounter[prefix]) {
		idCounter[prefix] = 0;
	}

	const id = ++idCounter[prefix];
	if (prefix === "$unique$") {
		return `${id}`;
	}

	return `${prefix}${id}`;
}