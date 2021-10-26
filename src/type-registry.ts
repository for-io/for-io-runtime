/*!
 * for-io-runtime
 *
 * Copyright (c) 2019-2021 Nikolche Mihajlovski and EPFL
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

import { forOwn } from 'lodash';
import utils from './utils';

const ERR_DATA_VALIDATION = 'Data validation errors!';

const NO_VAL = null;

type InternalTypeInstanceFactory = (
    data: any,
    opts?: EntityOptions,
    err?: ValidationErrors,
    name?: string,
    types?: TypeFactories,
    util?: TypeImplUtils
) => any;

export type TypeInstanceFactory = (
    data: any,
    opts?: EntityOptions,
    err?: ValidationErrors,
    name?: string,
) => any;

export type ForIoType = {
    validate(): void;
    isValid(): boolean;
    getValidationErrors(): any;
}

type DataTypeOptions = {
    name?: string,
    validation?: boolean,
};

export type EntityOptions = {
    name?: string,
    validation?: boolean,
    defaults?: true,
};

export type TypeImplOpts = {
    data: any,
    prefix: string,
    opts?: EntityOptions,
    err?: ValidationErrors,
    types: TypeFactories,
    util: TypeImplUtils,
};

export type TypeImplUtils = {
    _has(val: any): boolean;
    _coll(factory: InternalTypeInstanceFactory, val: any, opts: EntityOptions, err?: ValidationErrors): any[];
    _no(name: string, opts?: EntityOptions, err?: ValidationErrors): any;
};

type TypeFactories = Record<string, InternalTypeInstanceFactory>;

const _types: TypeFactories = {};

const _util: TypeImplUtils = { _has, _coll, _no };

function _registerType(typeName: string, factory: TypeInstanceFactory, isBuiltIn: boolean) {
    _types[typeName] = _wrap(factory, isBuiltIn);
    _types[`${typeName}Array`] = _wrap(_arrayFactory(factory), isBuiltIn);
}

type ErrorsHolder = {
    hasErrors: boolean,
    details: any,
};

export class ValidationErrors {

    private errors: ErrorsHolder;

    private prefix: string;

    constructor(errors?: ErrorsHolder, prefix: string = '') {
        this.errors = errors || {
            hasErrors: false,
            details: {},
        };

        this.prefix = prefix;
    }

    error(name: string, msg: string) {
        this.errors.hasErrors = true;

        const key = this.prefix + name;

        if (!this.errors.details.hasOwnProperty(key)) {
            this.errors.details[key] = msg;
        }
    }

    missing(name: string) {
        this.error(name, 'Missing value');
        return NO_VAL;
    }

    wrongType(name: string, type: string, val: any) {
        this.error(name, `Must be ${type}`);
    }

    verify(cond: boolean, name: string, msg: string) {
        if (!cond) {
            this.error(name, msg);
        }
    }

    nested(name: string) {
        return new ValidationErrors(this.errors, this.prefix + name + '.');
    }

    hasErrors() {
        return this.errors.hasErrors;
    }

    details() {
        return this.errors.details;
    }
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function _validationErr(details: any) {
    const e = new Error(ERR_DATA_VALIDATION);
    (e as any).body = { error: ERR_DATA_VALIDATION, details };
    (e as any).statusCode = 422;
    return e;
}

function _error(err: ValidationErrors, opts: DataTypeOptions, msg: string) {
    let name = opts ? opts.name : undefined;

    if (err) {
        if (name === undefined || name === null) throw new Error('The name of the type instance be must defined!');
        err.error(name, msg);

    } else {
        let validate = opts && opts.validation;
        let errMsg = name ? `${name}: ${msg}` : msg;
        throw validate ? _validationErr(errMsg) : new Error(errMsg);
    }
}

function _wrongType(err: ValidationErrors | undefined, opts: DataTypeOptions | undefined, type: string, val: any) {
    let name = opts ? opts.name : undefined;

    if (err) {
        if (name === undefined || name === null) throw new Error('The name of the type instance be must defined!');
        err.wrongType(name, type, val);

    } else {
        let validate = opts && opts.validation;
        let errMsg = name ? `'${name}' must be ${type}!` : `Must be ${type}!`;
        throw validate ? _validationErr(errMsg) : new Error(errMsg);
    }
}

const _builtInTypes = {

    _float(val: any, opts: DataTypeOptions, err: ValidationErrors): number | null {
        if (utils.isNumber(val)) {
            return parseFloat(val);
        } else {
            _wrongType(err, opts, 'float', val);
            return NO_VAL;
        }
    },

    _int(val: any, opts: DataTypeOptions, err: ValidationErrors) {
        if (utils.isNumber(val)) {
            let n = parseFloat(val);

            if (Number.isInteger(n)) {
                return n;
            }
        }

        _wrongType(err, opts, 'integer', val);
        return NO_VAL;
    },

    _uint(val: any, opts: DataTypeOptions, err: ValidationErrors) {
        if (utils.isNumber(val)) {
            let n = parseFloat(val);

            if (Number.isInteger(n)) {
                if (n >= 0) {
                    return n;
                } else {
                    _error(err, opts, 'Cannot be negative');
                    return NO_VAL;
                }
            }
        }

        _wrongType(err, opts, 'integer', val);
        return NO_VAL;
    },

    _byte(val: any, opts: DataTypeOptions, err: ValidationErrors) {
        if (utils.isNumber(val)) {
            let n = parseFloat(val);

            if (Number.isInteger(n)) {
                if (n >= 256) {
                    _error(err, opts, 'Must be < 256');
                    return NO_VAL;
                } else if (n < 0) {
                    _error(err, opts, 'Cannot be negative');
                    return NO_VAL;
                } else {
                    return n;
                }
            }
        }

        _wrongType(err, opts, 'byte', val);
        return NO_VAL;
    },

    _string(val: any, opts: DataTypeOptions, err: ValidationErrors) {
        if (utils.isString(val)) {
            return val;
        } else {
            _wrongType(err, opts, 'string', val);
            return NO_VAL;
        }
    },

    _email(val: any, opts: DataTypeOptions, err: ValidationErrors) {
        if (utils.isString(val) && EMAIL_REGEX.test(val)) {
            return val;
        } else {
            _wrongType(err, opts, 'email', val);
            return NO_VAL;
        }
    },

    _boolean(val: any, opts: DataTypeOptions, err: ValidationErrors) {
        if (utils.isBoolean(val)) {
            return val;
        } else {
            if (val === 'true' || val === 'y' || val == 1) {
                return true;
            } else if (val === 'false' || val === 'n' || val == 0) {
                return false;
            } else {
                _wrongType(err, opts, 'boolean', val);
                return NO_VAL;
            }
        }
    },

    _object(val: any, opts: DataTypeOptions, err: ValidationErrors) {
        if (utils.isObject(val)) {
            return val;
        } else {
            _wrongType(err, opts, 'object', val);
            return {};
        }
    },

};

function _has(val: any) {
    return val !== undefined && val !== null;
}

function _no(name: string, opts?: EntityOptions, err?: ValidationErrors) {
    if (err) {
        if (name === undefined || name === null) throw new Error('The name of the type instance must be defined!');
        err.missing(name);

    } else {
        let validate = opts && opts.validation;
        let errMsg = name ? `A value for '${name}' must be specified!` : `A value must be specified!`;
        throw validate ? _validationErr(errMsg) : new Error(errMsg);
    }
}

function _coll(factory: InternalTypeInstanceFactory, val: any, opts?: EntityOptions, err?: ValidationErrors, name?: string): any[] {
    name = opts?.name || name || '';

    if (val !== undefined && val !== null) {

        if (utils.isArray(val)) {
            return val.map((item: any, index: any) => factory(item, opts, err, name + index + '.', _types, _util));
        } else {
            _wrongType(err, opts, 'array', val);
            return [];
        }

    } else {
        return [];
    }
}

function _arrayFactory(itemFactory: InternalTypeInstanceFactory): TypeInstanceFactory {
    return (arr: any, opts?: EntityOptions, err?: ValidationErrors, name?: string) => _coll(itemFactory, arr, opts, err, name);
}

function _wrap(factory: InternalTypeInstanceFactory, isBuiltIn: boolean): TypeInstanceFactory {
    return function (value: any, opts?: EntityOptions, err?: ValidationErrors, name?: string): ForIoType {

        const isRoot = err === undefined && name === undefined;
        if (isRoot && !isBuiltIn) err = new ValidationErrors();
        if (isRoot && opts && opts.name) name = opts.name;

        const result: ForIoType = factory(value, opts, err, name, _types, _util);

        if (isRoot && err !== undefined && (utils.isObject(result) || utils.isArray(result))) {
            bindValidationMethods(result, err);
        }

        return result;
    };
}

function bindValidationMethods(result: ForIoType, errors: ValidationErrors) {

    function validate(this: ForIoType) {
        if (errors.hasErrors()) {
            throw _validationErr(errors.details());
        }

        return this;
    }

    function isValid() {
        return !errors.hasErrors();
    }

    function getValidationErrors() {
        return errors.details();
    }

    result.validate = validate.bind(result);
    result.isValid = isValid.bind(result);
    result.getValidationErrors = getValidationErrors.bind(result);
}


export type PrimitiveTypes = {
    float(val: any, opts?: DataTypeOptions, err?: ValidationErrors): number | null,
    double(val: any, opts?: DataTypeOptions, err?: ValidationErrors): number | null,
    number(val: any, opts?: DataTypeOptions, err?: ValidationErrors): number | null,
    int(val: any, opts?: DataTypeOptions, err?: ValidationErrors): number | null,
    int32(val: any, opts?: DataTypeOptions, err?: ValidationErrors): number | null,
    int64(val: any, opts?: DataTypeOptions, err?: ValidationErrors): number | null,
    integer(val: any, opts?: DataTypeOptions, err?: ValidationErrors): number | null,
    uint(val: any, opts?: DataTypeOptions, err?: ValidationErrors): number | null,
    byte(val: any, opts?: DataTypeOptions, err?: ValidationErrors): number | null,
    string(val: any, opts?: DataTypeOptions, err?: ValidationErrors): string | null,
    text(val: any, opts?: DataTypeOptions, err?: ValidationErrors): string | null,
    email(val: any, opts?: DataTypeOptions, err?: ValidationErrors): string | null,
    userid(val: any, opts?: DataTypeOptions, err?: ValidationErrors): string | null,
    username(val: any, opts?: DataTypeOptions, err?: ValidationErrors): string | null,
    boolean(val: any, opts?: DataTypeOptions, err?: ValidationErrors): boolean | null,
    date(val: any, opts?: DataTypeOptions, err?: ValidationErrors): string | null,
    datetime(val: any, opts?: DataTypeOptions, err?: ValidationErrors): string | null,
    object(val: any, opts?: DataTypeOptions, err?: ValidationErrors): object | null,
    binary(val: any, opts?: DataTypeOptions, err?: ValidationErrors): string | null,
    base64(val: any, opts?: DataTypeOptions, err?: ValidationErrors): string | null,
    password(val: any, opts?: DataTypeOptions, err?: ValidationErrors): string | null,
    uri(val: any, opts?: DataTypeOptions, err?: ValidationErrors): string | null,
    uuid(val: any, opts?: DataTypeOptions, err?: ValidationErrors): string | null,
};

const _defaultTypes: PrimitiveTypes = {
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

forOwn(_defaultTypes, (factory: InternalTypeInstanceFactory, typeName: string) => {
    _registerType(typeName, factory, true);
});

function getTypes() {
    return _types;
}

function addTypes(types: Record<string, any>) {
    forOwn(types, (typeClass: new (args: TypeImplOpts) => any, typeName: string) => {
        _registerType(typeName, (data: any, opts?: EntityOptions, err?: ValidationErrors, name: string = '') => new typeClass({
            data,
            prefix: name,
            types: _types,
            opts,
            err,
            util: _util,
        }), false);
    });
}

export const typeRegistry = {
    getTypes,
    addTypes,
    _internals: { _has, _coll }
};
