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

exports._$TYPES_ = (types__getter, _utils) => {

    const ERR_DATA_VALIDATION = 'Data validation errors!';

    let types;

    class Organization {
        constructor(data = {}, err = undefined, prefix = '') {

            // _id : string pkey autogen
            this._id = _has(data._id) ? types.string(data._id, err, prefix + '_id') : null;

            // name : string
            this.name = _has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');

            // teams : Team[]
            this.teams = _coll(types.Team, data.teams, err, prefix + 'teams.');
        }
    }

    class Team {
        constructor(data = {}, err = undefined, prefix = '') {

            // _id : string pkey autogen
            this._id = _has(data._id) ? types.string(data._id, err, prefix + '_id') : null;

            // name : string
            this.name = _has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');

            // members : object
            this.members = _has(data.members) ? types.object(data.members, err, prefix + 'members') : err.no(prefix + 'members');
        }
    }

    class User {
        constructor(data = {}, err = undefined, prefix = '') {

            // _id : string pkey autogen
            this._id = _has(data._id) ? types.string(data._id, err, prefix + '_id') : null;

            // email : email
            this.email = _has(data.email) ? types.email(data.email, err, prefix + 'email') : err.no(prefix + 'email');

            // passwordHash : string
            this.passwordHash = _has(data.passwordHash) ? types.string(data.passwordHash, err, prefix + 'passwordHash') : err.no(prefix + 'passwordHash');

            // firstName : string
            this.firstName = _has(data.firstName) ? types.string(data.firstName, err, prefix + 'firstName') : err.no(prefix + 'firstName');

            // lastName : string
            this.lastName = _has(data.lastName) ? types.string(data.lastName, err, prefix + 'lastName') : err.no(prefix + 'lastName');
        }
    }

    class UpdateUserProfileParams {
        constructor(data = {}, err = undefined, prefix = '') {

            // id : string
            this.id = _has(data.id) ? types.string(data.id, err, prefix + 'id') : err.no(prefix + 'id');
        }
    }

    class UpdateUserProfileBody {
        constructor(data = {}, err = undefined, prefix = '') {

            // firstName : string
            this.firstName = _has(data.firstName) ? types.string(data.firstName, err, prefix + 'firstName') : err.no(prefix + 'firstName');

            // lastName : string
            this.lastName = _has(data.lastName) ? types.string(data.lastName, err, prefix + 'lastName') : err.no(prefix + 'lastName');
        }
    }

    class DeleteUserParams {
        constructor(data = {}, err = undefined, prefix = '') {

            // id : string
            this.id = _has(data.id) ? types.string(data.id, err, prefix + 'id') : err.no(prefix + 'id');
        }
    }

    class LoginBody {
        constructor(data = {}, err = undefined, prefix = '') {

            // username : string
            this.username = _has(data.username) ? types.string(data.username, err, prefix + 'username') : err.no(prefix + 'username');

            // password : password
            this.password = _has(data.password) ? types.password(data.password, err, prefix + 'password') : err.no(prefix + 'password');
        }
    }

    class GetUserProfileParams {
        constructor(data = {}, err = undefined, prefix = '') {

            // id : string
            this.id = _has(data.id) ? types.string(data.id, err, prefix + 'id') : err.no(prefix + 'id');
        }
    }

    class AddUserBody {
        constructor(data = {}, err = undefined, prefix = '') {

            // username : string
            this.username = _has(data.username) ? types.string(data.username, err, prefix + 'username') : err.no(prefix + 'username');

            // password : password
            this.password = _has(data.password) ? types.password(data.password, err, prefix + 'password') : err.no(prefix + 'password');

            // email : email
            this.email = _has(data.email) ? types.email(data.email, err, prefix + 'email') : err.no(prefix + 'email');

            // firstName : string
            this.firstName = _has(data.firstName) ? types.string(data.firstName, err, prefix + 'firstName') : err.no(prefix + 'firstName');

            // lastName : string
            this.lastName = _has(data.lastName) ? types.string(data.lastName, err, prefix + 'lastName') : err.no(prefix + 'lastName');
        }
    }

    class AddOrganizationBody {
        constructor(data = {}, err = undefined, prefix = '') {

            // name : string
            this.name = _has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');
        }
    }

    class UpdateOrganizationParams {
        constructor(data = {}, err = undefined, prefix = '') {

            // organizationId : string
            this.organizationId = _has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
        }
    }

    class UpdateOrganizationBody {
        constructor(data = {}, err = undefined, prefix = '') {

            // name : string
            this.name = _has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');
        }
    }

    class DeleteOrganizationParams {
        constructor(data = {}, err = undefined, prefix = '') {

            // organizationId : string
            this.organizationId = _has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
        }
    }

    class GetOrganizationParams {
        constructor(data = {}, err = undefined, prefix = '') {

            // organizationId : string
            this.organizationId = _has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
        }
    }

    class AddTeamToOrganizationParams {
        constructor(data = {}, err = undefined, prefix = '') {

            // organizationId : string
            this.organizationId = _has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
        }
    }

    class AddTeamToOrganizationBody {
        constructor(data = {}, err = undefined, prefix = '') {

            // name : string
            this.name = _has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');

            // members : object
            this.members = _has(data.members) ? types.object(data.members, err, prefix + 'members') : err.no(prefix + 'members');
        }
    }

    class UpdateTeamOfOrganizationParams {
        constructor(data = {}, err = undefined, prefix = '') {

            // organizationId : string
            this.organizationId = _has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');

            // teamId2 : string
            this.teamId2 = _has(data.teamId2) ? types.string(data.teamId2, err, prefix + 'teamId2') : err.no(prefix + 'teamId2');
        }
    }

    class UpdateTeamOfOrganizationBody {
        constructor(data = {}, err = undefined, prefix = '') {

            // name : string
            this.name = _has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');

            // members : object
            this.members = _has(data.members) ? types.object(data.members, err, prefix + 'members') : err.no(prefix + 'members');
        }
    }

    class DeleteTeamOfOrganizationParams {
        constructor(data = {}, err = undefined, prefix = '') {

            // organizationId : string
            this.organizationId = _has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');

            // teamId2 : string
            this.teamId2 = _has(data.teamId2) ? types.string(data.teamId2, err, prefix + 'teamId2') : err.no(prefix + 'teamId2');
        }
    }

    class GetTeamOfOrganizationParams {
        constructor(data = {}, err = undefined, prefix = '') {

            // organizationId : string
            this.organizationId = _has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');

            // teamId2 : string
            this.teamId2 = _has(data.teamId2) ? types.string(data.teamId2, err, prefix + 'teamId2') : err.no(prefix + 'teamId2');
        }
    }

    class ListTeamsOfOrganizationParams {
        constructor(data = {}, err = undefined, prefix = '') {

            // organizationId : string
            this.organizationId = _has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
        }
    }

    const NO_VAL = null;

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
            if (!name) {
                throw new Error('Invalid name')
            }
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

    function _has(val) {
        return val !== undefined && val !== null;
    }

    const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    const _builtInTypes = {

        _float(val, err, name) {
            if (_utils.isNumber(val)) {
                return parseFloat(val);
            } else {
                err.wrongType(name, 'float', val);
                return NO_VAL;
            }
        },

        _int(val, err, name) {
            if (_utils.isNumber(val)) {
                let n = parseFloat(val);

                if (Number.isInteger(n)) {
                    return n;
                }
            }

            err.wrongType(name, 'integer', val);
            return NO_VAL;
        },

        _uint(val, err, name) {
            if (_utils.isNumber(val)) {
                let n = parseFloat(val);

                if (Number.isInteger(n)) {
                    if (n >= 0) {
                        return n;
                    } else {
                        err.error(name, 'Cannot be negative');
                        return NO_VAL;
                    }
                }
            }

            err.wrongType(name, 'integer', val);
            return NO_VAL;
        },

        _byte(val, err, name) {
            if (_utils.isNumber(val)) {
                let n = parseFloat(val);

                if (Number.isInteger(n)) {
                    if (n >= 256) {
                        err.error(name, 'Must be < 256');
                        return NO_VAL;
                    } else if (n < 0) {
                        err.error(name, 'Cannot be negative');
                        return NO_VAL;
                    } else {
                        return n;
                    }
                }
            }

            err.wrongType(name, 'byte', val);
            return NO_VAL;
        },

        _string(val, err, name) {
            if (_utils.isString(val)) {
                return val;
            } else {
                err.wrongType(name, 'string', val);
                return NO_VAL;
            }
        },

        _email(val, err, name) {
            if (_utils.isString(val) && EMAIL_REGEX.test(val)) {
                return val;
            } else {
                err.wrongType(name, 'email', val);
                return NO_VAL;
            }
        },

        _boolean(val, err, name) {
            if (_utils.isBoolean(val)) {
                return val;
            } else {
                if (val === 'true' || val === 'y' || val == 1) {
                    return true;
                } else if (val === 'false' || val === 'n' || val == 0) {
                    return false;
                } else {
                    err.wrongType(name, 'boolean', val);
                    return NO_VAL;
                }
            }
        },

        _object(val, err, name) {
            if (_utils.isObject(val)) {
                return val;
            } else {
                err.wrongType(name, 'object', val);
                return {};
            }
        },

    };

    function _coll(factory, val, err, name) {
        if (val !== undefined && val !== null) {

            if (_utils.isArray(val)) {
                return val.map((item, index) => factory(item, err, name + index + '.'));
            } else {
                err.wrongType(name, 'array', val);
                return [];
            }

        } else {
            return [];
        }
    }

    function _arrayFactory(typeName, factory) {
        return (arr, err, name) => _coll(factory, arr, err, name || '');
    }

    function _wrap(factory) {
        return (value, _err, _name) => {
            if (types === undefined) types = types__getter();

            const isRoot = _err === undefined;
            if (isRoot) _err = new _ValidationErrors();

            const result = factory(value, _err, _name);

            function validate() {
                if (_err.hasErrors()) {
                    const e = new Error(ERR_DATA_VALIDATION);
                    e.body = { error: ERR_DATA_VALIDATION, details: _err.details() };
                    e.statusCode = 422;
                    throw e;
                }

                return this;
            }

            function isValid() {
                return !_err.hasErrors();
            }

            function getValidationErrors() {
                return _err.details();
            }

            if (isRoot && (_utils.isObject(result) || _utils.isArray(result))) {
                result.validate = validate.bind(result);
                result.isValid = isValid.bind(result);
                result.getValidationErrors = getValidationErrors.bind(result);
            }

            return result;
        };
    }

    const _types = {
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
        'Organization': (data, err, name = '') => new Organization(data, err, name),
        'Team': (data, err, name = '') => new Team(data, err, name),
        'User': (data, err, name = '') => new User(data, err, name),
        'UpdateUserProfileParams': (data, err, name = '') => new UpdateUserProfileParams(data, err, name),
        'UpdateUserProfileBody': (data, err, name = '') => new UpdateUserProfileBody(data, err, name),
        'DeleteUserParams': (data, err, name = '') => new DeleteUserParams(data, err, name),
        'LoginBody': (data, err, name = '') => new LoginBody(data, err, name),
        'GetUserProfileParams': (data, err, name = '') => new GetUserProfileParams(data, err, name),
        'AddUserBody': (data, err, name = '') => new AddUserBody(data, err, name),
        'AddOrganizationBody': (data, err, name = '') => new AddOrganizationBody(data, err, name),
        'UpdateOrganizationParams': (data, err, name = '') => new UpdateOrganizationParams(data, err, name),
        'UpdateOrganizationBody': (data, err, name = '') => new UpdateOrganizationBody(data, err, name),
        'DeleteOrganizationParams': (data, err, name = '') => new DeleteOrganizationParams(data, err, name),
        'GetOrganizationParams': (data, err, name = '') => new GetOrganizationParams(data, err, name),
        'AddTeamToOrganizationParams': (data, err, name = '') => new AddTeamToOrganizationParams(data, err, name),
        'AddTeamToOrganizationBody': (data, err, name = '') => new AddTeamToOrganizationBody(data, err, name),
        'UpdateTeamOfOrganizationParams': (data, err, name = '') => new UpdateTeamOfOrganizationParams(data, err, name),
        'UpdateTeamOfOrganizationBody': (data, err, name = '') => new UpdateTeamOfOrganizationBody(data, err, name),
        'DeleteTeamOfOrganizationParams': (data, err, name = '') => new DeleteTeamOfOrganizationParams(data, err, name),
        'GetTeamOfOrganizationParams': (data, err, name = '') => new GetTeamOfOrganizationParams(data, err, name),
        'ListTeamsOfOrganizationParams': (data, err, name = '') => new ListTeamsOfOrganizationParams(data, err, name),
    };

    for (const typeName in _types) {
        if (_types.hasOwnProperty(typeName)) {
            const factory = _types[typeName];

            _types[typeName] = _wrap(factory);
            _types[`${typeName}Array`] = _wrap(_arrayFactory(`${typeName}Array`, factory));
        }
    }

    return _types;
};
