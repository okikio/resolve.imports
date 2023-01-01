/** Based on `resolve.exports` by @lukeed */
/**
 * @param {object} imports
 * @param {Set<string>} keys
 */
function loop(imports, keys) {
	if (typeof imports === 'string') {
		return imports;
	}

	if (imports) {
		let idx, tmp;
		if (Array.isArray(imports)) {
			for (idx=0; idx < imports.length; idx++) {
				if (tmp = loop(imports[idx], keys)) return tmp;
			}
		} else {
			for (idx in imports) {
				if (keys.has(idx)) {
					return loop(imports[idx], keys);
				}
			}
		}
	}
}

/**
 * @param {string} name The package name
 * @param {string} entry The target entry, eg "#deps"
 * @param {number} [condition] Unmatched condition?
 */
function bail(name, entry, condition) {
	throw new Error(
		condition
		? `No known conditions for "${entry}" entry in "${name}" package`
		: `Missing "${entry}" import in "${name}" package`
	);
}

/**
 * @param {object} pkg package.json contents
 * @param {string} entry entry name or import path
 * @param {object} [options]
 * @param {boolean} [options.browser]
 * @param {boolean} [options.require]
 * @param {string[]} [options.conditions]
 * @param {boolean} [options.unsafe]
 */
export function resolve(pkg, entry, options = {}) {
	let { name, imports } = pkg;

	if (imports) {
		let { browser, require, unsafe, conditions=[] } = options;

		if (!entry) throw new Error('Missing entry name or import path');
		if (entry[0] !== '#') throw new Error(`"${entry}" is not a valid subpath import; the entry doesn\'t start with "#"`);

		if (typeof imports === 'string') {
			throw new Error(`package.json "imports" must be an object and cannot be a string`);
		}

		let allows = new Set(['default', ...conditions]);
		unsafe || allows.add(require ? 'require' : 'import');
		unsafe || allows.add(browser ? 'browser' : 'node');

		let key, tmp;

		for (key in imports) {
			if (key[0] !== '#') {
				console.warn(`package.json "imports" key "${key}" does not start with "#"`);
			}
		}

		if (tmp = imports[entry]) {
			return loop(tmp, allows) || bail(name, entry, 1);
		}

		for (key in imports) {
			tmp = key[key.length - 1];
			if (tmp === '/' && entry.startsWith(key)) {
				return (tmp = loop(imports[key], allows))
					? (tmp + entry.substring(key.length))
					: bail(name, entry, 1);
			}
			if (tmp === '*' && entry.startsWith(key.slice(0, -1))) {
				// do not trigger if no *content* to inject
				if (entry.substring(key.length - 1).length > 0) {
					return (tmp = loop(imports[key], allows))
						? tmp.replace('*', entry.substring(key.length - 1))
						: bail(name, entry, 1);
				}
			}
		}

		return bail(name, entry);
	}
}