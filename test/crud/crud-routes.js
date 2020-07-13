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

exports._$ROUTES_ = {

    addOrganization: {
        route: "POST /organizations",
        verb: "POST",
        path: "/organizations",
        title: "Create organization",
        description: "",
        params: {},
        query: {},
        body: {
            name: "string"
        },
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 422],
        middleware: ["authenticate"],
        tags: [],
        typeNames: {
            body: "AddOrganizationBody"
        },
        model: "Organization:add",
        cache: {}
    },

    updateOrganization: {
        route: "PATCH /organizations/:organizationId",
        verb: "PATCH",
        path: "/organizations/:organizationId",
        title: "Update organization",
        description: "",
        params: {
            organizationId: "string"
        },
        query: {},
        body: {
            name: "string"
        },
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 404, 422],
        middleware: ["authenticate"],
        tags: [],
        typeNames: {
            params: "UpdateOrganizationParams",
            body: "UpdateOrganizationBody"
        },
        model: "Organization:update",
        cache: {}
    },

    deleteOrganization: {
        route: "DELETE /organizations/:organizationId",
        verb: "DELETE",
        path: "/organizations/:organizationId",
        title: "Delete organization",
        description: "",
        params: {
            organizationId: "string"
        },
        query: {},
        body: {},
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 404],
        middleware: ["authenticate"],
        tags: [],
        typeNames: {
            params: "DeleteOrganizationParams"
        },
        model: "Organization:remove"
    },

    getOrganization: {
        route: "GET /organizations/:organizationId",
        verb: "GET",
        path: "/organizations/:organizationId",
        title: "Get organization",
        description: "",
        params: {
            organizationId: "string"
        },
        query: {},
        body: {},
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 404],
        middleware: ["authenticate"],
        tags: [],
        typeNames: {
            params: "GetOrganizationParams"
        },
        model: "Organization:read"
    },

    listOrganizations: {
        route: "GET /organizations",
        verb: "GET",
        path: "/organizations",
        title: "List organizations",
        description: "",
        params: {},
        query: {},
        body: {},
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403],
        middleware: ["authenticate"],
        tags: [],
        typeNames: {},
        model: "Organization:list"
    },

    addTeamToOrganization: {
        route: "POST /organizations/:organizationId/teams",
        verb: "POST",
        path: "/organizations/:organizationId/teams",
        title: "Add new team to organization",
        description: "",
        params: {
            organizationId: "string"
        },
        query: {},
        body: {
            name: "string",
            members: "object"
        },
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 404, 422],
        middleware: ["authenticate"],
        tags: [],
        typeNames: {
            params: "AddTeamToOrganizationParams",
            body: "AddTeamToOrganizationBody"
        },
        model: "Organization#teams:add",
        cache: {}
    },

    updateTeamOfOrganization: {
        route: "PATCH /organizations/:organizationId/teams/:teamId2",
        verb: "PATCH",
        path: "/organizations/:organizationId/teams/:teamId2",
        title: "Update team of organization",
        description: "",
        params: {
            organizationId: "string",
            teamId2: "string"
        },
        query: {},
        body: {
            name: "string",
            members: "object"
        },
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 404, 422],
        middleware: ["authenticate"],
        tags: [],
        typeNames: {
            params: "UpdateTeamOfOrganizationParams",
            body: "UpdateTeamOfOrganizationBody"
        },
        model: "Organization#teams:update",
        cache: {}
    },

    deleteTeamOfOrganization: {
        route: "DELETE /organizations/:organizationId/teams/:teamId2",
        verb: "DELETE",
        path: "/organizations/:organizationId/teams/:teamId2",
        title: "Delete team of organization",
        description: "",
        params: {
            organizationId: "string",
            teamId2: "string"
        },
        query: {},
        body: {},
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 404],
        middleware: ["authenticate"],
        tags: [],
        typeNames: {
            params: "DeleteTeamOfOrganizationParams"
        },
        model: "Organization#teams:remove"
    },

    getTeamOfOrganization: {
        route: "GET /organizations/:organizationId/teams/:teamId2",
        verb: "GET",
        path: "/organizations/:organizationId/teams/:teamId2",
        title: "Get single team of organization",
        description: "",
        params: {
            organizationId: "string",
            teamId2: "string"
        },
        query: {},
        body: {},
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 404],
        middleware: ["authenticate"],
        tags: [],
        typeNames: {
            params: "GetTeamOfOrganizationParams"
        },
        model: "Organization#teams:read"
    },

    listTeamsOfOrganization: {
        route: "GET /organizations/:organizationId/teams",
        verb: "GET",
        path: "/organizations/:organizationId/teams",
        title: "List teams of organization",
        description: "",
        params: {
            organizationId: "string"
        },
        query: {},
        body: {},
        headers: {},
        cookies: {},
        roles: [],
        responses: [200, 403, 404],
        middleware: ["authenticate"],
        tags: [],
        typeNames: {
            params: "ListTeamsOfOrganizationParams"
        },
        model: "Organization#teams:list"
    }
};