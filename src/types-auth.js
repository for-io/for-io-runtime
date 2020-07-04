class User {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // _id : string pkey autogen
        this._id = util._has(data._id) ? types.string(data._id, err, prefix + '_id') : null;

        // email : email
        this.email = util._has(data.email) ? types.email(data.email, err, prefix + 'email') : err.no(prefix + 'email');

        // passwordHash : string
        this.passwordHash = util._has(data.passwordHash) ? types.string(data.passwordHash, err, prefix + 'passwordHash') : err.no(prefix + 'passwordHash');

        // firstName : string
        this.firstName = util._has(data.firstName) ? types.string(data.firstName, err, prefix + 'firstName') : err.no(prefix + 'firstName');

        // lastName : string
        this.lastName = util._has(data.lastName) ? types.string(data.lastName, err, prefix + 'lastName') : err.no(prefix + 'lastName');
    }
}

class UpdateUserProfileParams {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // id : string
        this.id = util._has(data.id) ? types.string(data.id, err, prefix + 'id') : err.no(prefix + 'id');
    }
}

class UpdateUserProfileBody {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // firstName : string
        this.firstName = util._has(data.firstName) ? types.string(data.firstName, err, prefix + 'firstName') : err.no(prefix + 'firstName');

        // lastName : string
        this.lastName = util._has(data.lastName) ? types.string(data.lastName, err, prefix + 'lastName') : err.no(prefix + 'lastName');
    }
}

class DeleteUserParams {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // id : string
        this.id = util._has(data.id) ? types.string(data.id, err, prefix + 'id') : err.no(prefix + 'id');
    }
}

class LoginBody {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // username : string
        this.username = util._has(data.username) ? types.string(data.username, err, prefix + 'username') : err.no(prefix + 'username');

        // password : password
        this.password = util._has(data.password) ? types.password(data.password, err, prefix + 'password') : err.no(prefix + 'password');
    }
}

class GetUserProfileParams {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // id : string
        this.id = util._has(data.id) ? types.string(data.id, err, prefix + 'id') : err.no(prefix + 'id');
    }
}

class AddUserBody {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // username : string
        this.username = util._has(data.username) ? types.string(data.username, err, prefix + 'username') : err.no(prefix + 'username');

        // password : password
        this.password = util._has(data.password) ? types.password(data.password, err, prefix + 'password') : err.no(prefix + 'password');

        // email : email
        this.email = util._has(data.email) ? types.email(data.email, err, prefix + 'email') : err.no(prefix + 'email');

        // firstName : string
        this.firstName = util._has(data.firstName) ? types.string(data.firstName, err, prefix + 'firstName') : err.no(prefix + 'firstName');

        // lastName : string
        this.lastName = util._has(data.lastName) ? types.string(data.lastName, err, prefix + 'lastName') : err.no(prefix + 'lastName');
    }
}

module.exports = {
    User,
    UpdateUserProfileParams,
    UpdateUserProfileBody,
    DeleteUserParams,
    GetUserProfileParams,
    AddUserBody,
    LoginBody,
};