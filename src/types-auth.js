const typeRegistry = require('./type-registry');
const types = typeRegistry.getTypes();
const { _has, _coll } = typeRegistry._internals;

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

typeRegistry.addTypes({
    User,
    UpdateUserProfileParams,
    UpdateUserProfileBody,
    DeleteUserParams,
    GetUserProfileParams,
    AddUserBody,
    LoginBody,
});
