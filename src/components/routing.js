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

const { sortRoutes } = require('../route-sorter');
const utils = require('../utils');

exports['SINGLETON routing'] = (__context, router, api, auth, config, controllers,
    types, providers, exceptionHandler, logger, invokers, DependencyTracker) => {

    async function run(name, controller, req, res, next, specification) {

        let _exception; // will be set if the controller throws an exception

        let _dataObjs = {}; // a cache for data objects (params, query, body, headers, cookies)

        function initDataObj(name) {
            let typeName = specification.typeNames ? specification.typeNames[name] : undefined;

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

        async function provide(name, depTracker) {
            depTracker.enter(name);

            try {
                return await _provide(name, depTracker);

            } finally {
                depTracker.leave(name);
            }
        }

        // must be called only by provide(...)
        async function _provide(name, depTracker) {
            if (providers.hasOwnProperty(name)) {
                return await invokers.invokeAsync(providers[name], async depName => await provide(depName, depTracker))
            }

            switch (name) {
                case 'req':
                    return req;

                case 'res':
                    return res;

                case 'next':
                    return next;

                case 'exception':
                    return _exception;

                case 'params':
                    return provideDataObj('params');

                case 'query':
                    return provideDataObj('query');

                case 'body':
                    return provideDataObj('body');

                case 'headers':
                    return provideDataObj('headers');

                case 'cookies':
                    return provideDataObj('cookies');

                case 'specification':
                    return specification;

                default:
                    return getDataParam(name);
            }
        }

        let result;

        const apiDepTracker = new DependencyTracker();
        apiDepTracker.enter(name);

        try {

            if (!controller) {
                throw new Error(`Undefined controller for API endpoint '${name}'!`);
            }

            result = await invokers.invokeAsync(controller, async depName => await provide(depName, apiDepTracker));

        } catch (exception) {
            res._exception = exception; // make the exception accessible through the response (needed for the IDE)
            _exception = exception; // might be requested when invoking the exception handler

            // no custom exception handling if the response headers were already sent
            if (res.headersSent) {
                next(exception);
                return;
            }

            try {
                apiDepTracker.enter('exceptionHandler');
                result = await invokers.invokeAsync(exceptionHandler, async depName => await provide(depName, apiDepTracker));
            } catch (err) {
                logger.error('An error was thrown by the exception handler!', err);
                next(err);
                return;
            }
        }

        if (result !== undefined) {
            res.json(result);
        }
    }

    function _fnToRoute(name, fn) {
        const { verb, path } = utils.extractRoute(name);

        return { name, verb, path, run: fn };
    }

    function _getRoutes() {
        const routes = [];

        for (const name in api) {
            if (api.hasOwnProperty(name)) {
                let route = api[name];

                if (utils.isFunction(route)) {
                    route = _fnToRoute(name, route);

                } else if (utils.isObject(route)) {
                    let keys = Object.keys(route);

                    if (keys.length === 1 && utils.isFunction(route[keys[0]])) {
                        route = _fnToRoute(keys[0], route[keys[0]]);
                    } else {
                        route.name = name;
                    }

                } else {
                    throw new Error('The route must be an object or function: ' + route);
                }

                routes.push(route);
            }
        }

        return routes;
    }

    function initRoutes() {
        const routes = _getRoutes();

        if (routes.length == 0) {
            if (config.NODE_ENV !== 'test') logger.warn(`No routes were defined!`);
            return;
        }

        sortRoutes(routes);

        for (const route of routes) {

            utils.def(route.name, 'route.name');
            utils.def(route.verb, 'route.verb');
            utils.def(route.path, 'route.path');

            const controller = _findController(route, controllers);

            const method = router[route.verb.toLowerCase()].bind(router);

            if (controller) {

                const args = [route.path];

                for (const middName of route.middleware || []) {
                    const middFactoryName = `${middName}MiddlewareFactory`;
                    const middlewareFactoryObj = __context.getDependency(middFactoryName);

                    if (!middlewareFactoryObj) throw new Error(`Cannot find a middleware factory with name: "${middFactoryName}"`);

                    args.push(middlewareFactoryObj.createMiddleware(route));
                }

                args.push(async (req, res, next) => {
                    await run(route.name, controller, req, res, next, route);
                });

                method(...args);

            } else {
                const errMsg = `Cannot find a controller for API endpoint: "${route.name}"`;

                if (config.NODE_ENV === 'dev' || config.NODE_ENV === 'test') {
                    method(route.path, async (req, res, next) => {
                        await run(route.name, () => { throw new Error(errMsg); }, req, res, next, route);
                    });
                } else {
                    throw new Error(errMsg);
                }
            }

        }
    }

    function _findController(route, controllers) {
        if (route.run) {
            return route.run;
        } else {
            return controllers[route.name];
        }
    }

    function dispatch(request, callbacks) {
        router._dispatch(request, callbacks);
    }

    initRoutes();

    return { dispatch };

};