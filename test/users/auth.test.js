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

const { runTest } = require('../../apidiligence/test-runner');

const testSetup = require('./testSetup');

const state = {};

const test = {
    name: 'auth',
    config: {
        useMocks: false,
        noHttpLogging: false,
        JWT_SECRET: 'jwt_secret'
    },
    precondition: {},
    cases: [{
        name: 'add new user and login',
        requests: [{
            request: {
                method: 'POST',
                url: '/users',
                body: {
                    username: "kirk",
                    password: "abc",
                    email: "kirk@example.com",
                    firstName: "James",
                    lastName: "Kirk",
                }
            },
            response: {
                status: 200,
                body: {
                    _id: 'kirk',
                }
            },
            postcondition: {
                users: [{
                    _id: "kirk",
                    email: "kirk@example.com",
                    passwordHash: "***",
                    firstName: "James",
                    lastName: "Kirk",
                }]
            },
        }, {
            request: {
                method: 'POST',
                url: '/login',
                body: {
                    username: "kirk",
                    password: "abc",
                }
            },
            response: {
                status: 200,
                body: {
                    token: (val) => { state.token = val },
                }
            },
        }],
    }],
};

runTest(test, testSetup);