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

const { runTest } = require('../../apidiligence');

const api = {
    _$API_: {
        hello: (userId) => ({ msg: `Hello, ${userId}!` })
    },

    _$ROUTES_: {
        hello: {
            verb: "GET", path: "/hello", middleware: ['authenticate'],
        },
    },
};

const testSetup = { modules: { api }, db: false, dir: __dirname };

runTest({
    name: 'unauthorized with mock auth & without mock user',
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
}, testSetup);

runTest({
    name: 'unauthorized without mock auth & without mock user',
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
}, testSetup);

runTest({
    name: 'unauthorized without mock auth & with mock user',
    config: {
        useMocks: false,
        JWT_SECRET: 'jwt_secret'
    },
    cases: [{
        name: 'unauthorized request',
        steps: [{
            request: {
                method: 'GET',
                url: '/hello',
                headers: { 'x-mock-user': 'spock' },
            },
            401: {},
        }],
    }],
}, testSetup);

runTest({
    name: 'authorized with mock auth & with mock user',
    config: {
        useMocks: true,
        JWT_SECRET: 'jwt_secret'
    },
    cases: [{
        name: 'authorized request',
        steps: [{
            request: {
                method: 'GET',
                url: '/hello',
                headers: { 'x-mock-user': 'spock' },
            },
            200: { msg: 'Hello, spock!' },
        }],
    }],
}, testSetup);