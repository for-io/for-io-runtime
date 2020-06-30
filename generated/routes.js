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

exports._$ROUTING_ = (router, middleware, api, types, providers, exceptionHandler, logger, _utils) => {

    async function run(name, handler, req, res, next, specification) {

        let _exception; // will be set if the handler throws an exception

        let _dataObjs = {}; // a cache for data objects (params, query, body, headers, cookies)

        function initDataObj(name) {
            let typeName = specification.typeNames[name];

            if (typeName) {
                let type = types[typeName];
                if (type) {
                    let data = type(req[name]);
                    data.validate();
                    return data;
                } else {
                    throw new Error(`Unknown type: '${typeName}'`);
                }
            } else {
                return req[name];
            }
        }

        function provideDataObj(name) {
            if (!(name in _dataObjs)) {
                _dataObjs[name] = initDataObj(name);
            }

            return _dataObjs[name];
        }

        function getDataParam(name) {
            if (req.body.hasOwnProperty(name)) return provideDataObj('body')[name];
            if (req.params.hasOwnProperty(name)) return provideDataObj('params')[name];
            if (req.query.hasOwnProperty(name)) return provideDataObj('query')[name];

            throw new Error(`Unknown parameter: '${name}'`);
        }

        function provide(name) {
            if (providers.hasOwnProperty(name)) {
                return _utils.invoke(providers[name], provide)
            } else {

                switch (name) {
                case 'req':
                case '$req':
                    return req;

                case 'res':
                case '$res':
                    return res;

                case 'next':
                case '$next':
                    return next;

                case 'exception':
                case '$exception':
                    return _exception;

                case 'params':
                case '$params':
                    return provideDataObj('params');

                case 'query':
                case '$query':
                    return provideDataObj('query');

                case 'body':
                case '$body':
                    return provideDataObj('body');

                case 'headers':
                case '$headers':
                    return provideDataObj('headers');

                case 'cookies':
                case '$cookies':
                    return provideDataObj('cookies');

                case 'specification':
                case '$specification':
                    return specification;

                default:
                    return getDataParam(name);
                }
            }
        }

        let result;

        try {

            if (!handler) {
                throw new Error(`Cannot find the handler for API endpoint '${name}'!`);
            }

            result = await _utils.invoke(handler, provide);

        } catch (exception) {
            res._exception = exception; // make the exception accessible through the response (needed for the IDE)
            _exception = exception; // might be requested when invoking the exception handler

            // no custom exception handling if the response headers were already sent
            if (res.headersSent) {
                next(exception);
                return;
            }

            try {
                result = await _utils.invoke(exceptionHandler, provide);
            } catch (err) {
                logger.error('An error was thrown by the exception handler!', err);
                next(err);
                return;
            }
        }

        if (result !== undefined) {
            if (typeof result === 'string') {
                res.send(result);
            } else {
                res.json(result);
            }
        }
    }

    function initRoutes(router) {
        // updateUserProfile:
        {
            const routeSpec = {
                name: "updateUserProfile",
                route: "PATCH /users/:id",
                verb: "PATCH",
                path: "/users/:id",
                title: "Update user profile",
                description: "",
                params: {
                    id: "string"
                },
                query: {},
                body: {
                    firstName: "string",
                    lastName: "string"
                },
                headers: {},
                cookies: {},
                roles: [],
                responses: [200, 403, 404, 422],
                middleware: ["authenticate"],
                tags: ["users"],
                typeNames: {
                    params: "UpdateUserProfileParams",
                    body: "UpdateUserProfileBody"
                },
                model: "User:update"
            };

            router.patch('/users/:id',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('updateUserProfile', api.updateUserProfile, req, res, next, routeSpec);
                });
        }

        // listUsers:
        {
            const routeSpec = {
                name: "listUsers",
                route: "GET /users",
                verb: "GET",
                path: "/users",
                title: "List users",
                description: "",
                params: {},
                query: {},
                body: {},
                headers: {},
                cookies: {},
                roles: [],
                responses: [200, 403],
                middleware: ["authenticate"],
                tags: ["users"],
                typeNames: {},
                model: "User:list"
            };

            router.get('/users',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('listUsers', api.listUsers, req, res, next, routeSpec);
                });
        }

        // deleteUser:
        {
            const routeSpec = {
                name: "deleteUser",
                route: "DELETE /users/:id",
                verb: "DELETE",
                path: "/users/:id",
                title: "Delete user",
                description: "",
                params: {
                    id: "string"
                },
                query: {},
                body: {},
                headers: {},
                cookies: {},
                roles: [],
                responses: [200, 403, 404],
                middleware: ["authenticate"],
                tags: ["users"],
                typeNames: {
                    params: "DeleteUserParams"
                },
                model: "User:remove"
            };

            router.delete('/users/:id',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('deleteUser', api.deleteUser, req, res, next, routeSpec);
                });
        }

        // login:
        {
            const routeSpec = {
                name: "login",
                route: "POST /login",
                verb: "POST",
                path: "/login",
                title: "Login user",
                description: "",
                params: {},
                query: {},
                body: {
                    username: "string",
                    password: "password"
                },
                headers: {},
                cookies: {},
                roles: [],
                responses: [200, 403, 404, 500],
                middleware: [],
                tags: ["users"],
                typeNames: {
                    body: "LoginBody"
                }
            };

            router.post('/login',

                async (req, res, next) => {
                    await run('login', api.login, req, res, next, routeSpec);
                });
        }

        // getUserProfile:
        {
            const routeSpec = {
                name: "getUserProfile",
                route: "GET /users/:id",
                verb: "GET",
                path: "/users/:id",
                title: "Get user profile",
                description: "",
                params: {
                    id: "string"
                },
                query: {},
                body: {},
                headers: {},
                cookies: {},
                roles: [],
                responses: [200, 403, 404],
                middleware: ["authenticate"],
                tags: ["users"],
                typeNames: {
                    params: "GetUserProfileParams"
                },
                model: "User:getProfile"
            };

            router.get('/users/:id',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('getUserProfile', api.getUserProfile, req, res, next, routeSpec);
                });
        }

        // addUser:
        {
            const routeSpec = {
                name: "addUser",
                route: "POST /users",
                verb: "POST",
                path: "/users",
                title: "Create user",
                description: "",
                params: {},
                query: {},
                body: {
                    username: "string",
                    password: "password",
                    email: "email",
                    firstName: "string",
                    lastName: "string"
                },
                headers: {},
                cookies: {},
                roles: [],
                responses: [200, 403, 422],
                middleware: [],
                tags: ["users"],
                typeNames: {
                    body: "AddUserBody"
                },
                model: "User:add"
            };

            router.post('/users',

                async (req, res, next) => {
                    await run('addUser', api.addUser, req, res, next, routeSpec);
                });
        }

        // addOrganization:
        {
            const routeSpec = {
                name: "addOrganization",
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
            };

            router.post('/organizations',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('addOrganization', api.addOrganization, req, res, next, routeSpec);
                });
        }

        // updateOrganization:
        {
            const routeSpec = {
                name: "updateOrganization",
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
            };

            router.patch('/organizations/:organizationId',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('updateOrganization', api.updateOrganization, req, res, next, routeSpec);
                });
        }

        // deleteOrganization:
        {
            const routeSpec = {
                name: "deleteOrganization",
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
            };

            router.delete('/organizations/:organizationId',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('deleteOrganization', api.deleteOrganization, req, res, next, routeSpec);
                });
        }

        // getOrganization:
        {
            const routeSpec = {
                name: "getOrganization",
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
            };

            router.get('/organizations/:organizationId',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('getOrganization', api.getOrganization, req, res, next, routeSpec);
                });
        }

        // listOrganizations:
        {
            const routeSpec = {
                name: "listOrganizations",
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
            };

            router.get('/organizations',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('listOrganizations', api.listOrganizations, req, res, next, routeSpec);
                });
        }

        // addTeamToOrganization:
        {
            const routeSpec = {
                name: "addTeamToOrganization",
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
            };

            router.post('/organizations/:organizationId/teams',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('addTeamToOrganization', api.addTeamToOrganization, req, res, next, routeSpec);
                });
        }

        // updateTeamOfOrganization:
        {
            const routeSpec = {
                name: "updateTeamOfOrganization",
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
            };

            router.patch('/organizations/:organizationId/teams/:teamId2',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('updateTeamOfOrganization', api.updateTeamOfOrganization, req, res, next, routeSpec);
                });
        }

        // deleteTeamOfOrganization:
        {
            const routeSpec = {
                name: "deleteTeamOfOrganization",
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
            };

            router.delete('/organizations/:organizationId/teams/:teamId2',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('deleteTeamOfOrganization', api.deleteTeamOfOrganization, req, res, next, routeSpec);
                });
        }

        // getTeamOfOrganization:
        {
            const routeSpec = {
                name: "getTeamOfOrganization",
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
            };

            router.get('/organizations/:organizationId/teams/:teamId2',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('getTeamOfOrganization', api.getTeamOfOrganization, req, res, next, routeSpec);
                });
        }

        // listTeamsOfOrganization:
        {
            const routeSpec = {
                name: "listTeamsOfOrganization",
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
            };

            router.get('/organizations/:organizationId/teams',
                middleware.authenticate(routeSpec),
                async (req, res, next) => {
                    await run('listTeamsOfOrganization', api.listTeamsOfOrganization, req, res, next, routeSpec);
                });
        }

    }

    function dispatch(request, callbacks) {
        router._dispatch(request, callbacks);
    }

    initRoutes(router);

    return { dispatch };
}
