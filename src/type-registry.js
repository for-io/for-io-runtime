/*!
 * for.io
 *
 * Copyright (c) 2019-2020 Nikolche Mihajlovski and EPFL
 * 
 * MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const utils = require('./utils');

const ERR_DATA_VALIDATION = 'Data validation errors!';

const NO_VAL = null;

const _types = {};

const _util = { _has, _coll };

function _registerType(typeName, factory, isBuiltIn) {
    _types[typeName] = _wrap(factory, isBuiltIn);
    _types[`${typeName}Array`] = _wrap(_arrayFactory(factory), isBuiltIn);
}

class _ValidationErrors {

    constructor(errors, prefix = '') {
        this.errors = errors || {
            hasErrors: false,
            details: {},
        };

        this.prefix = prefix;
    }

    error(name, msg) {
        this.errors.hasErrors = true;

        const key = this.prefix + name;

        if (!this.errors.details.hasOwnProperty(key)) {
            this.errors.details[key] = msg;
        }
    }

    no(name) {
        this.error(name, 'Missing value');
        return NO_VAL;
    }

    wrongType(name, type, val) {
        this.error(name, `Must be ${type}`);
    }

    verify(cond, name, msg) {
        if (!cond) {
            this.error(name, msg);
        }
    }

    nested(name) {
        return new _ValidationErrors(this.errors, this.prefix + name + '.');
    }

    hasErrors() {
        return this.errors.hasErrors;
    }

    details() {
        return this.errors.details;
    }
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function _validationErr(details) {
    const e = new Error(ERR_DATA_VALIDATION);
    e.body = { error: ERR_DATA_VALIDATION, details };
    e.statusCode = 422;
    return e;
}

function _error(err, opts, name, msg) {
    if (err) {
        err.error(name, msg);
    } else {
        let validate = opts && opts.validation;
        let errMsg = name ? `${name}: ${msg}` : msg;
        throw validate ? _validationErr(errMsg) : new Error(errMsg);
    }
}

function _wrongType(err, opts, name, type, val) {
    if (err) {
        err.wrongType(name, type, val)
    } else {
        let validate = opts && opts.validation;
        let errMsg = name ? `'${name}' must be ${type}!` : `Must be ${type}!`;
        throw validate ? _validationErr(errMsg) : new Error(errMsg);
    }
}

const _builtInTypes = {

    _float(val, opts, err, name) {
        if (utils.isNumber(val)) {
            return parseFloat(val);
        } else {
            _wrongType(err, opts, name, 'float', val);
            return NO_VAL;
        }
    },

    _int(val, opts, err, name) {
        if (utils.isNumber(val)) {
            let n = parseFloat(val);

            if (Number.isInteger(n)) {
                return n;
            }
        }

        _wrongType(err, opts, name, 'integer', val);
        return NO_VAL;
    },

    _uint(val, opts, err, name) {
        if (utils.isNumber(val)) {
            let n = parseFloat(val);

            if (Number.isInteger(n)) {
                if (n >= 0) {
                    return n;
                } else {
                    _error(err, opts, name, 'Cannot be negative');
                    return NO_VAL;
                }
            }
        }

        _wrongType(err, opts, name, 'integer', val);
        return NO_VAL;
    },

    _byte(val, opts, err, name) {
        if (utils.isNumber(val)) {
            let n = parseFloat(val);

            if (Number.isInteger(n)) {
                if (n >= 256) {
                    _error(err, opts, name, 'Must be < 256');
                    return NO_VAL;
                } else if (n < 0) {
                    _error(err, opts, name, 'Cannot be negative');
                    return NO_VAL;
                } else {
                    return n;
                }
            }
        }

        _wrongType(err, opts, name, 'byte', val);
        return NO_VAL;
    },

    _string(val, opts, err, name) {
        if (utils.isString(val)) {
            return val;
        } else {
            _wrongType(err, opts, name, 'string', val);
            return NO_VAL;
        }
    },

    _email(val, opts, err, name) {
        if (utils.isString(val) && EMAIL_REGEX.test(val)) {
            return val;
        } else {
            _wrongType(err, opts, name, 'email', val);
            return NO_VAL;
        }
    },

    _boolean(val, opts, err, name) {
        if (utils.isBoolean(val)) {
            return val;
        } else {
            if (val === 'true' || val === 'y' || val == 1) {
                return true;
            } else if (val === 'false' || val === 'n' || val == 0) {
                return false;
            } else {
                _wrongType(err, opts, name, 'boolean', val);
                return NO_VAL;
            }
        }
    },

    _object(val, opts, err, name) {
        if (utils.isObject(val)) {
            return val;
        } else {
            _wrongType(err, opts, name, 'object', val);
            return {};
        }
    },

};

function _has(val) {
    return val !== undefined && val !== null;
}

function _coll(factory, val, opts, err, name) {
    if (val !== undefined && val !== null) {

        if (utils.isArray(val)) {
            return val.map((item, index) => factory(item, opts, err, name + index + '.', _types, _util));
        } else {
            _wrongType(err, opts, name, 'array', val);
            return [];
        }

    } else {
        return [];
    }
}

function _arrayFactory(itemFactory) {
    return (arr, opts, err, name) => _coll(itemFactory, arr, opts, err, name || '');
}

function _wrap(factory, isBuiltIn) {
    return function (value, opts) {
        // NOTE opts can be undefined!
        const isRoot = arguments.length <= 2;

        let _err = arguments[2];
        if (isRoot && !isBuiltIn) _err = new _ValidationErrors();

        let _name = arguments[3];
        if (isRoot && opts && opts.name) _name = opts.name;

        const result = factory(value, opts, _err, _name, _types, _util);

        function validate() {
            if (_err.hasErrors()) {
                throw _validationErr(_err.details());
            }

            return this;
        }

        function isValid() {
            return !_err.hasErrors();
        }

        function getValidationErrors() {
            return _err.details();
        }

        if (isRoot) {
            if (utils.isObject(result) || utils.isArray(result)) {
                result.validate = validate.bind(result);
                result.isValid = isValid.bind(result);
                result.getValidationErrors = getValidationErrors.bind(result);
            }
        }

        return result;
    };
}

const _defaultTypes = {
    'float': _builtInTypes._float,
    'double': _builtInTypes._float,
    'number': _builtInTypes._float,
    'int': _builtInTypes._int,
    'int32': _builtInTypes._int,
    'int64': _builtInTypes._int,
    'integer': _builtInTypes._int,
    'uint': _builtInTypes._uint,
    'byte': _builtInTypes._byte,
    'string': _builtInTypes._string,
    'text': _builtInTypes._string,
    'email': _builtInTypes._email,
    'userid': _builtInTypes._string,
    'username': _builtInTypes._string,
    'boolean': _builtInTypes._boolean,
    'date': _builtInTypes._string,
    'datetime': _builtInTypes._string,
    'object': _builtInTypes._object,
    'binary': _builtInTypes._string,
    'base64': _builtInTypes._string,
    'password': _builtInTypes._string,
    'uri': _builtInTypes._string,
    'uuid': _builtInTypes._string,
};

for (const typeName in _defaultTypes) {
    if (_defaultTypes.hasOwnProperty(typeName)) {
        const factory = _defaultTypes[typeName];
        _registerType(typeName, factory, true);
    }
}

function getTypes() {
    return _types;
}

function addTypes(types) {
    for (const typeName in types) {
        if (types.hasOwnProperty(typeName)) {
            const typeClass = types[typeName];
            _registerType(typeName, (data, opts, err, name = '') => new typeClass({
                data,
                prefix: name,
                types: _types,
                opts,
                err,
                util: _util,
            }), false);
        }
    }
}

module.exports = {
    getTypes,
    addTypes,
    _internals: { _has, _coll }
};
