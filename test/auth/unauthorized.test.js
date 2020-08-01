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

const { runTest } = require('api-diligence');
const appFactory = require('../../src/appFactory');

const mod = {
    'API hello': {
        verb: "GET",
        path: "/hello",
        middleware: ['authenticate'],
        run(userId) {
            return { msg: `Hello, ${userId}!` };
        }
    },
};

const appSetup = { modules: { mod } };

runTest({
    name: 'unauthorized with mock auth & without mock user',
    opts: { appSetup, appFactory },
    config: {
        useMocks: true,
        JWT_SECRET: 'jwt_secret'
    },
    cases: [{
        name: 'unauthorized request',
        steps: [{
            request: 'GET /hello',
            401: {},
        }],
    }],
});

runTest({
    name: 'unauthorized without mock auth & without mock user',
    opts: { appSetup, appFactory },
    config: {
        useMocks: false,
        JWT_SECRET: 'jwt_secret'
    },
    cases: [{
        name: 'unauthorized request',
        steps: [{
            request: 'GET /hello',
            401: {},
        }],
    }],
});

runTest({
    name: 'unauthorized without mock auth & with mock user',
    opts: { appSetup, appFactory },
    config: {
        useMocks: false,
        JWT_SECRET: 'jwt_secret'
    },
    cases: [{
        name: 'unauthorized request',
        steps: [{
            username: 'spock',
            request: 'GET /hello',
            401: {},
        }],
    }],
});

runTest({
    name: 'authorized with mock auth & with mock user',
    opts: { appSetup, appFactory, mockAuth: true },
    config: {
        useMocks: true,
        JWT_SECRET: 'jwt_secret'
    },
    cases: [{
        name: 'authorized request',
        steps: [{
            username: 'spock',
            request: 'GET /hello',
            200: { msg: 'Hello, spock!' },
        }],
    }],
});