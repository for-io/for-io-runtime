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

class Organization {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // _id : string pkey autogen
        this._id = util._has(data._id) ? types.string(data._id, err, prefix + '_id') : null;

        // name : string
        this.name = util._has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');

        // teams : Team[]
        this.teams = util._coll(types.Team, data.teams, err, prefix + 'teams.');
    }
}

class Team {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // _id : string pkey autogen
        this._id = util._has(data._id) ? types.string(data._id, err, prefix + '_id') : null;

        // name : string
        this.name = util._has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');

        // members : object
        this.members = util._has(data.members) ? types.object(data.members, err, prefix + 'members') : err.no(prefix + 'members');
    }
}

class AddOrganizationBody {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // name : string
        this.name = util._has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');
    }
}

class UpdateOrganizationParams {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
    }
}

class UpdateOrganizationBody {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // name : string
        this.name = util._has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');
    }
}

class DeleteOrganizationParams {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
    }
}

class GetOrganizationParams {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
    }
}

class AddTeamToOrganizationParams {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
    }
}

class AddTeamToOrganizationBody {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // name : string
        this.name = util._has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');

        // members : object
        this.members = util._has(data.members) ? types.object(data.members, err, prefix + 'members') : err.no(prefix + 'members');
    }
}

class UpdateTeamOfOrganizationParams {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');

        // teamId2 : string
        this.teamId2 = util._has(data.teamId2) ? types.string(data.teamId2, err, prefix + 'teamId2') : err.no(prefix + 'teamId2');
    }
}

class UpdateTeamOfOrganizationBody {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // name : string
        this.name = util._has(data.name) ? types.string(data.name, err, prefix + 'name') : err.no(prefix + 'name');

        // members : object
        this.members = util._has(data.members) ? types.object(data.members, err, prefix + 'members') : err.no(prefix + 'members');
    }
}

class DeleteTeamOfOrganizationParams {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');

        // teamId2 : string
        this.teamId2 = util._has(data.teamId2) ? types.string(data.teamId2, err, prefix + 'teamId2') : err.no(prefix + 'teamId2');
    }
}

class GetTeamOfOrganizationParams {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');

        // teamId2 : string
        this.teamId2 = util._has(data.teamId2) ? types.string(data.teamId2, err, prefix + 'teamId2') : err.no(prefix + 'teamId2');
    }
}

class ListTeamsOfOrganizationParams {
    constructor({ data = {}, prefix = '', types, err, util }) {

        // organizationId : string
        this.organizationId = util._has(data.organizationId) ? types.string(data.organizationId, err, prefix + 'organizationId') : err.no(prefix + 'organizationId');
    }
}

exports['SINGLETON typedefs'] = {
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