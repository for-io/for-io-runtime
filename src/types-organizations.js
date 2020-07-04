const typeRegistry = require('./type-registry');
const types = typeRegistry.getTypes();
const { _has, _coll } = typeRegistry._internals;

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

typeRegistry.addTypes({
    Organization,
    Team,
    AddOrganizationBody,
    UpdateOrganizationParams,
    UpdateOrganizationBody,
    DeleteOrganizationParams,
    GetOrganizationParams,
    AddTeamToOrganizationParams,
    AddTeamToOrganizationBody,
    UpdateTeamOfOrganizationParams,
    UpdateTeamOfOrganizationBody,
    DeleteTeamOfOrganizationParams,
    GetTeamOfOrganizationParams,
    ListTeamsOfOrganizationParams,
});
