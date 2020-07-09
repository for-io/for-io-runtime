class Organization {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // _id : string pkey autogen
        this._id = util._has(data._id) ? types.string(data._id, err, prefix + '_id') : null;

        // name : string
        this.name = util._has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');

        // teams : Team[]
        this.teams = util._coll(types.Team, data.teams, err, prefix + 'teams.');
    }
}

class Team {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // _id : string pkey autogen
        this._id = util._has(data._id) ? types.string(data._id, err, prefix + '_id') : null;

        // name : string
        this.name = util._has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');

        // members : object
        this.members = util._has(data.members) ? types.object(data.members, err, prefix + 'members') : err.no(prefix + 'members');
    }
}

class AddOrganizationBody {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // name : string
        this.name = util._has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');
    }
}

class UpdateOrganizationParams {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
    }
}

class UpdateOrganizationBody {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // name : string
        this.name = util._has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');
    }
}

class DeleteOrganizationParams {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
    }
}

class GetOrganizationParams {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
    }
}

class AddTeamToOrganizationParams {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
    }
}

class AddTeamToOrganizationBody {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // name : string
        this.name = util._has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');

        // members : object
        this.members = util._has(data.members) ? types.object(data.members, err, prefix + 'members') : err.no(prefix + 'members');
    }
}

class UpdateTeamOfOrganizationParams {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');

        // teamId2 : string
        this.teamId2 = util._has(data.teamId2) ? types.string(data.teamId2, err, prefix + 'teamId2') : err.no(prefix + 'teamId2');
    }
}

class UpdateTeamOfOrganizationBody {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // name : string
        this.name = util._has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');

        // members : object
        this.members = util._has(data.members) ? types.object(data.members, err, prefix + 'members') : err.no(prefix + 'members');
    }
}

class DeleteTeamOfOrganizationParams {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');

        // teamId2 : string
        this.teamId2 = util._has(data.teamId2) ? types.string(data.teamId2, err, prefix + 'teamId2') : err.no(prefix + 'teamId2');
    }
}

class GetTeamOfOrganizationParams {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');

        // teamId2 : string
        this.teamId2 = util._has(data.teamId2) ? types.string(data.teamId2, err, prefix + 'teamId2') : err.no(prefix + 'teamId2');
    }
}

class ListTeamsOfOrganizationParams {
    constructor(data = {}, err = undefined, prefix = '', types, util) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
    }
}

module.exports = {
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
};