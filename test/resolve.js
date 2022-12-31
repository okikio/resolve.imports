import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as $imports from '../src';

function pass(pkg, expects, ...args) {
	let out = $imports.resolve(pkg, ...args);
	assert.is(out, expects);
}

function fail(pkg, target, ...args) {
	try {
		$imports.resolve(pkg, ...args);
		assert.unreachable();
	} catch (err) {
		assert.instance(err, Error);
		// assert.is(err.message, `Missing "${target}" import in "${pkg.name}" package`);
	}
}

// ---

const resolve = suite('$.resolve');

resolve('should be a function', () => {
	assert.type($imports.resolve, 'function');
});

resolve('imports=string', () => {
	let pkg = {
		"name": "foobar",
		"imports": "$string",
	};

	fail(pkg, '$string');
	fail(pkg, '$string', '.');
	fail(pkg, '$string', 'foobar');

	fail(pkg, './other', 'other');
	fail(pkg, './other', 'foobar/other');
	fail(pkg, './hello', './hello');
});

resolve('imports = { self }', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			"import": "$import",
			"require": "$require",
		}
	};

	fail(pkg, '$import');
	fail(pkg, '$import', '.');
	fail(pkg, '$import', 'foobar');

	fail(pkg, './other', 'other');
	fail(pkg, './other', 'foobar/other');
	fail(pkg, './hello', './hello');
});

resolve('imports["."] = string', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			".": "$self",
		}
	};

	fail(pkg, '$self');
	fail(pkg, '$self', '.');
	fail(pkg, '$self', 'foobar');

	fail(pkg, './other', 'other');
	fail(pkg, './other', 'foobar/other');
	fail(pkg, './hello', './hello');
});

resolve('imports["."] = object', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			".": {
				"import": "$import",
				"require": "$require",
			}
		}
	};

	fail(pkg, '$import');
	fail(pkg, '$import', '.');
	fail(pkg, '$import', 'foobar');

	fail(pkg, './other', 'other');
	fail(pkg, './other', 'foobar/other');
	fail(pkg, './hello', './hello');
});

resolve('imports["./foo"] = string', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			"./foo": "$import",
		}
	};

	fail(pkg, '$import', './foo');
	fail(pkg, '$import', 'foobar/foo');

	fail(pkg, '.');
	fail(pkg, '.', 'foobar');
	fail(pkg, './other', 'foobar/other');
});

resolve('imports["#foo"] = string', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			"#foo": "$import",
		}
	};

	pass(pkg, '$import', '#foo');
	fail(pkg, '$import', 'foobar/foo');
	fail(pkg, '$import', 'foobar/#foo');

	fail(pkg, '.');
	fail(pkg, '.', 'foobar');
	fail(pkg, './other', 'foobar/other');
});

resolve('imports["./foo"] = object', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			"./foo": {
				"import": "$import",
				"require": "$require",
			}
		}
	};

	fail(pkg, '$import', './foo');
	fail(pkg, '$import', 'foobar/foo');

	fail(pkg, '.');
	fail(pkg, '.', 'foobar');
	fail(pkg, './other', 'foobar/other');
});

resolve('imports["#foo"] = object', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			"#foo": {
				"import": "$import",
				"require": "$require",
			}
		}
	};

	pass(pkg, '$import', '#foo');
	fail(pkg, '$import', 'foobar/foo');
	fail(pkg, '$import', 'foobar/#foo');

	fail(pkg, '.');
	fail(pkg, '.', 'foobar');
	fail(pkg, './other', 'foobar/other');
});

// https://nodejs.org/api/packages.html#packages_nested_conditions
resolve('nested conditions', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			"node": {
				"import": "$node.import",
				"require": "$node.require"
			},
			"default": "$default",
		}
	};

	fail(pkg, '$node.import');
	fail(pkg, '$node.import', 'foobar');

	// browser => no "node" key
	fail(pkg, '$default', '.', { browser: true });
	fail(pkg, '$default', 'foobar', { browser: true });

	fail(pkg, './hello', './hello');
	fail(pkg, './other', 'foobar/other');
	fail(pkg, './other', 'other');
});

resolve('nested conditions :: subpath', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			"./lite": {
				"node": {
					"import": "$node.import",
					"require": "$node.require"
				},
				"browser": {
					"import": "$browser.import",
					"require": "$browser.require"
				},
			}
		}
	};

	fail(pkg, '$node.import', 'foobar/lite');
	fail(pkg, '$node.require', 'foobar/lite', { require: true });

	fail(pkg, '$browser.import', 'foobar/lite', { browser: true });
	fail(pkg, '$browser.require', 'foobar/lite', { browser: true, require: true });
});

resolve('nested conditions (imports) :: subpath', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			"#lite": {
				"node": {
					"import": "$node.import",
					"require": "$node.require"
				},
				"browser": {
					"import": "$browser.import",
					"require": "$browser.require"
				},
			}
		}
	};

	fail(pkg, '$node.import', 'foobar/#lite');
	fail(pkg, '$node.require', 'foobar/#lite', { require: true });

	fail(pkg, '$browser.import', 'foobar/lite', { browser: true });
	fail(pkg, '$browser.require', 'foobar/lite', { browser: true, require: true });

	pass(pkg, '$node.import', '#lite');
	pass(pkg, '$node.require', '#lite', { require: true });

	pass(pkg, '$browser.import', '#lite', { browser: true });
	pass(pkg, '$browser.require', '#lite', { browser: true, require: true });
});

resolve('nested conditions :: subpath :: inverse', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			"./lite": {
				"import": {
					"browser": "$browser.import",
					"node": "$node.import",
				},
				"require": {
					"browser": "$browser.require",
					"node": "$node.require",
				}
			}
		}
	};

	fail(pkg, '$node.import', 'foobar/lite');
	fail(pkg, '$node.require', 'foobar/lite', { require: true });

	fail(pkg, '$browser.import', 'foobar/lite', { browser: true });
	fail(pkg, '$browser.require', 'foobar/lite', { browser: true, require: true });
});

resolve('nested conditions (imports) :: subpath :: inverse', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			"#lite": {
				"import": {
					"browser": "$browser.import",
					"node": "$node.import",
				},
				"require": {
					"browser": "$browser.require",
					"node": "$node.require",
				}
			}
		}
	};

	fail(pkg, '$node.import', 'foobar/#lite');
	fail(pkg, '$node.require', 'foobar/#lite', { require: true });

	fail(pkg, '$browser.import', 'foobar/#lite', { browser: true });
	fail(pkg, '$browser.require', 'foobar/#lite', { browser: true, require: true });

	pass(pkg, '$node.import', '#lite');
	pass(pkg, '$node.require', '#lite', { require: true });

	pass(pkg, '$browser.import', '#lite', { browser: true });
	pass(pkg, '$browser.require', '#lite', { browser: true, require: true });
});

// https://nodejs.org/api/packages.html#packages_subpath_folder_mappings
resolve('imports["#/"]', () => {
	let pkg = {
		"name": "foobar",
		"imports": {
			"#import": {
				"require": "$require",
				"import": "$import"
			},
			"#/package.json": "./package.json",
			"#/": "./"
		}
	};

	pass(pkg, '$import', "#import");
	fail(pkg, '$import', 'foobar');
	fail(pkg, '$require', 'foobar', { require: true });

	pass(pkg, './package.json', '#/package.json');
	fail(pkg, './package.json', 'foobar/#/package.json');

	// "loose" / everything exposed
	fail(pkg, './hello.js', '#/hello.js');
	fail(pkg, './hello.js', 'foobar/#/hello.js');
	fail(pkg, './hello/world.js', '#/hello/world.js');
});

// resolve('imports["#/"] :: w/o "." key', () => {
// 	let pkg = {
// 		"name": "foobar",
// 		"imports": {
// 			"#/package.json": "./package.json",
// 			"#/": "./"
// 		}
// 	};

// 	fail(pkg, '.', "#");
// 	fail(pkg, '.', "foobar");

// 	pass(pkg, './package.json', 'package.json');
// 	pass(pkg, './package.json', 'foobar/package.json');
// 	pass(pkg, './package.json', './package.json');

// 	// "loose" / everything exposed
// 	pass(pkg, './hello.js', 'hello.js');
// 	pass(pkg, './hello.js', 'foobar/hello.js');
// 	pass(pkg, './hello/world.js', './hello/world.js');
// });

// // https://nodejs.org/api/packages.html#packages_subpath_folder_mappings
// resolve('imports["./*"]', () => {
// 	let pkg = {
// 		"name": "foobar",
// 		"imports": {
// 			"./*": "./cheese/*.mjs"
// 		}
// 	};

// 	fail(pkg, '.', ".");
// 	fail(pkg, '.', "foobar");

// 	pass(pkg, './cheese/hello.mjs', 'hello');
// 	pass(pkg, './cheese/hello.mjs', 'foobar/hello');
// 	pass(pkg, './cheese/hello/world.mjs', './hello/world');

// 	// evaluate as defined, not wrong
// 	pass(pkg, './cheese/hello.js.mjs', 'hello.js');
// 	pass(pkg, './cheese/hello.js.mjs', 'foobar/hello.js');
// 	pass(pkg, './cheese/hello/world.js.mjs', './hello/world.js');
// });

// // https://nodejs.org/api/packages.html#packages_subpath_folder_mappings
// resolve('imports["./features/"]', () => {
// 	let pkg = {
// 		"name": "foobar",
// 		"imports": {
// 			"./features/": "./features/"
// 		}
// 	};

// 	pass(pkg, './features/', 'features/');
// 	pass(pkg, './features/', 'foobar/features/');

// 	pass(pkg, './features/hello.js', 'foobar/features/hello.js');

// 	fail(pkg, './features', 'features');
// 	fail(pkg, './features', 'foobar/features');

// 	fail(pkg, './package.json', 'package.json');
// 	fail(pkg, './package.json', 'foobar/package.json');
// 	fail(pkg, './package.json', './package.json');
// });

// // https://nodejs.org/api/packages.html#packages_subpath_folder_mappings
// resolve('imports["./features/"] :: with "./" key', () => {
// 	let pkg = {
// 		"name": "foobar",
// 		"imports": {
// 			"./features/": "./features/",
// 			"./package.json": "./package.json",
// 			"./": "./"
// 		}
// 	};

// 	pass(pkg, './features', 'features'); // via "./"
// 	pass(pkg, './features', 'foobar/features'); // via "./"

// 	pass(pkg, './features/', 'features/'); // via "./features/"
// 	pass(pkg, './features/', 'foobar/features/'); // via "./features/"

// 	pass(pkg, './features/hello.js', 'foobar/features/hello.js');

// 	pass(pkg, './package.json', 'package.json');
// 	pass(pkg, './package.json', 'foobar/package.json');
// 	pass(pkg, './package.json', './package.json');

// 	// Does NOT hit "./" (match Node)
// 	fail(pkg, '.', '.');
// 	fail(pkg, '.', 'foobar');
// });

// resolve('imports["./features/"] :: conditions', () => {
// 	let pkg = {
// 		"name": "foobar",
// 		"imports": {
// 			"./features/": {
// 				"browser": {
// 					"import": "./browser.import/",
// 					"require": "./browser.require/",
// 				},
// 				"import": "./import/",
// 				"require": "./require/",
// 			},
// 		}
// 	};

// 	// import
// 	pass(pkg, './import/', 'features/');
// 	pass(pkg, './import/', 'foobar/features/');

// 	pass(pkg, './import/hello.js', './features/hello.js');
// 	pass(pkg, './import/hello.js', 'foobar/features/hello.js');

// 	// require
// 	pass(pkg, './require/', 'features/', { require: true });
// 	pass(pkg, './require/', 'foobar/features/', { require: true });

// 	pass(pkg, './require/hello.js', './features/hello.js', { require: true });
// 	pass(pkg, './require/hello.js', 'foobar/features/hello.js', { require: true });

// 	// require + browser
// 	pass(pkg, './browser.require/', 'features/', { browser: true, require: true });
// 	pass(pkg, './browser.require/', 'foobar/features/', { browser: true, require: true });

// 	pass(pkg, './browser.require/hello.js', './features/hello.js', { browser: true, require: true });
// 	pass(pkg, './browser.require/hello.js', 'foobar/features/hello.js', { browser: true, require: true });
// });

// // https://nodejs.org/api/packages.html#packages_subpath_folder_mappings
// resolve('imports["./features/*"]', () => {
// 	let pkg = {
// 		"name": "foobar",
// 		"imports": {
// 			"./features/*": "./features/*.js",
// 		}
// 	};

// 	fail(pkg, './features', 'features');
// 	fail(pkg, './features', 'foobar/features');

// 	fail(pkg, './features/', 'features/');
// 	fail(pkg, './features/', 'foobar/features/');

// 	pass(pkg, './features/a.js', 'foobar/features/a');
// 	pass(pkg, './features/ab.js', 'foobar/features/ab');
// 	pass(pkg, './features/abc.js', 'foobar/features/abc');

// 	pass(pkg, './features/hello.js', 'foobar/features/hello');
// 	pass(pkg, './features/world.js', 'foobar/features/world');

// 	// incorrect, but matches Node. evaluate as defined
// 	pass(pkg, './features/hello.js.js', 'foobar/features/hello.js');
// 	pass(pkg, './features/world.js.js', 'foobar/features/world.js');

// 	fail(pkg, './package.json', 'package.json');
// 	fail(pkg, './package.json', 'foobar/package.json');
// 	fail(pkg, './package.json', './package.json');
// });

// // https://nodejs.org/api/packages.html#packages_subpath_folder_mappings
// resolve('imports["./features/*"] :: with "./" key', () => {
// 	let pkg = {
// 		"name": "foobar",
// 		"imports": {
// 			"./features/*": "./features/*.js",
// 			"./": "./"
// 		}
// 	};

// 	pass(pkg, './features', 'features'); // via "./"
// 	pass(pkg, './features', 'foobar/features'); // via "./"

// 	pass(pkg, './features/', 'features/'); // via "./"
// 	pass(pkg, './features/', 'foobar/features/'); // via "./"

// 	pass(pkg, './features/hello.js', 'foobar/features/hello');
// 	pass(pkg, './features/world.js', 'foobar/features/world');

// 	// incorrect, but matches Node. evaluate as defined
// 	pass(pkg, './features/hello.js.js', 'foobar/features/hello.js');
// 	pass(pkg, './features/world.js.js', 'foobar/features/world.js');

// 	pass(pkg, './package.json', 'package.json');
// 	pass(pkg, './package.json', 'foobar/package.json');
// 	pass(pkg, './package.json', './package.json');

// 	// Does NOT hit "./" (match Node)
// 	fail(pkg, '.', '.');
// 	fail(pkg, '.', 'foobar');
// });

// resolve('imports["./features/*"] :: conditions', () => {
// 	let pkg = {
// 		"name": "foobar",
// 		"imports": {
// 			"./features/*": {
// 				"browser": {
// 					"import": "./browser.import/*.mjs",
// 					"require": "./browser.require/*.js",
// 				},
// 				"import": "./import/*.mjs",
// 				"require": "./require/*.js",
// 			},
// 		}
// 	};

// 	// import
// 	fail(pkg, './features/', 'features/'); // no file
// 	fail(pkg, './features/', 'foobar/features/'); // no file

// 	pass(pkg, './import/hello.mjs', './features/hello');
// 	pass(pkg, './import/hello.mjs', 'foobar/features/hello');

// 	// require
// 	fail(pkg, './features/', 'features/', { require: true }); // no file
// 	fail(pkg, './features/', 'foobar/features/', { require: true }); // no file

// 	pass(pkg, './require/hello.js', './features/hello', { require: true });
// 	pass(pkg, './require/hello.js', 'foobar/features/hello', { require: true });

// 	// require + browser
// 	fail(pkg, './features/', 'features/', { browser: true, require: true }); // no file
// 	fail(pkg, './features/', 'foobar/features/', { browser: true, require: true }); // no file

// 	pass(pkg, './browser.require/hello.js', './features/hello', { browser: true, require: true });
// 	pass(pkg, './browser.require/hello.js', 'foobar/features/hello', { browser: true, require: true });
// });

// resolve('should handle mixed path/conditions', () => {
// 	let pkg = {
// 		"name": "foobar",
// 		"imports": {
// 			".": [
// 				{
// 					"import": "$root.import",
// 				},
// 				"$root.string"
// 			],
// 			"./foo": [
// 				{
// 					"require": "$foo.require"
// 				},
// 				"$foo.string"
// 			]
// 		}
// 	}

// 	pass(pkg, '$root.import');
// 	pass(pkg, '$root.import', 'foobar');

// 	pass(pkg, '$foo.string', 'foo');
// 	pass(pkg, '$foo.string', 'foobar/foo');
// 	pass(pkg, '$foo.string', './foo');

// 	pass(pkg, '$foo.require', 'foo', { require: true });
// 	pass(pkg, '$foo.require', 'foobar/foo', { require: true });
// 	pass(pkg, '$foo.require', './foo', { require: true });
// });

resolve.run();

// ---

// const requires = suite('options.requires', {
// 	"imports": {
// 		"require": "$require",
// 		"import": "$import",
// 	}
// });

// requires('should ignore "require" keys by default', pkg => {
// 	pass(pkg, '$import');
// });

// requires('should use "require" key when defined first', pkg => {
// 	pass(pkg, '$require', '.', { require: true });
// });

// requires('should ignore "import" key when enabled', () => {
// 	let pkg = {
// 		"imports": {
// 			"import": "$import",
// 			"require": "$require",
// 		}
// 	};
// 	pass(pkg, '$require', '.', { require: true });
// 	pass(pkg, '$import', '.');
// });

// requires('should match "default" if "require" is after', () => {
// 	let pkg = {
// 		"imports": {
// 			"default": "$default",
// 			"require": "$require",
// 		}
// 	};
// 	pass(pkg, '$default', '.', { require: true });
// });

// requires.run();

// ---

// const browser = suite('options.browser', {
// 	"imports": {
// 		"browser": "$browser",
// 		"node": "$node",
// 	}
// });

// browser('should ignore "browser" keys by default', pkg => {
// 	pass(pkg, '$node');
// });

// browser('should use "browser" key when defined first', pkg => {
// 	pass(pkg, '$browser', '.', { browser: true });
// });

// browser('should ignore "node" key when enabled', () => {
// 	let pkg = {
// 		"imports": {
// 			"node": "$node",
// 			"import": "$import",
// 			"browser": "$browser",
// 		}
// 	};
// 	// import defined before browser
// 	pass(pkg, '$import', '.', { browser: true });
// });

// browser.run();

// ---

// const conditions = suite('options.conditions', {
// 	"imports": {
// 		"production": "$prod",
// 		"development": "$dev",
// 		"default": "$default",
// 	}
// });

// conditions('should ignore unknown conditions by default', pkg => {
// 	pass(pkg, '$default');
// });

// conditions('should recognize custom field(s) when specified', pkg => {
// 	pass(pkg, '$dev', '.', {
// 		conditions: ['development']
// 	});

// 	pass(pkg, '$prod', '.', {
// 		conditions: ['development', 'production']
// 	});
// });

// conditions('should throw an error if no known conditions', ctx => {
// 	let pkg = {
// 		"name": "hello",
// 		"imports": {
// 			...ctx.imports
// 		},
// 	};

// 	delete pkg.imports.default;

// 	try {
// 		$imports.resolve(pkg);
// 		assert.unreachable();
// 	} catch (err) {
// 		assert.instance(err, Error);
// 		assert.is(err.message, `No known conditions for "." entry in "hello" package`);
// 	}
// });

// conditions.run();

// ---

// const unsafe = suite('options.unsafe', {
// 	"imports": {
// 		".": {
// 			"production": "$prod",
// 			"development": "$dev",
// 			"default": "$default",
// 		},
// 		"./spec/type": {
// 			"import": "$import",
// 			"require": "$require",
// 			"default": "$default"
// 		},
// 		"./spec/env": {
// 			"worker": {
// 				"default": "$worker"
// 			},
// 			"browser": "$browser",
// 			"node": "$node",
// 			"default": "$default"
// 		}
// 	}
// });

// unsafe('should ignore unknown conditions by default', pkg => {
// 	pass(pkg, '$default', '.', {
// 		unsafe: true,
// 	});
// });

// unsafe('should ignore "import" and "require" conditions by default', pkg => {
// 	pass(pkg, '$default', './spec/type', {
// 		unsafe: true,
// 	});

// 	pass(pkg, '$default', './spec/type', {
// 		unsafe: true,
// 		require: true,
// 	});
// });

// unsafe('should ignore "node" and "browser" conditions by default', pkg => {
// 	pass(pkg, '$default', './spec/type', {
// 		unsafe: true,
// 	});

// 	pass(pkg, '$default', './spec/type', {
// 		unsafe: true,
// 		browser: true,
// 	});
// });

// unsafe('should respect/accept any custom condition(s) when specified', pkg => {
// 	// root, dev only
// 	pass(pkg, '$dev', '.', {
// 		unsafe: true,
// 		conditions: ['development']
// 	});

// 	// root, defined order
// 	pass(pkg, '$prod', '.', {
// 		unsafe: true,
// 		conditions: ['development', 'production']
// 	});

// 	// import vs require, defined order
// 	pass(pkg, '$require', './spec/type', {
// 		unsafe: true,
// 		conditions: ['require']
// 	});

// 	// import vs require, defined order
// 	pass(pkg, '$import', './spec/type', {
// 		unsafe: true,
// 		conditions: ['import', 'require']
// 	});

// 	// import vs require, defined order
// 	pass(pkg, '$node', './spec/env', {
// 		unsafe: true,
// 		conditions: ['node']
// 	});

// 	// import vs require, defined order
// 	pass(pkg, '$browser', './spec/env', {
// 		unsafe: true,
// 		conditions: ['browser', 'node']
// 	});

// 	// import vs require, defined order
// 	pass(pkg, '$worker', './spec/env', {
// 		unsafe: true,
// 		conditions: ['browser', 'node', 'worker']
// 	});
// });

// unsafe.run();
