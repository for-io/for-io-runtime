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
const request = require("supertest");
const { MongoClient } = require('mongodb');

const { initDB, exportDB } = require('./mongo-test-setup');
const { unmask } = require('./test-case-comparator');
const { preprocess } = require('./test-data-preprocessor');

const SUPPORTED_HTTP_METHODS = ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'];

const HDR_MOCK_USER = 'x-mock-user';

function runTest(test, opts = {}) {
    describe(test.name, () => {

        let connection;
        let db;

        beforeAll(async () => {
            connection = await MongoClient.connect(global.__MONGO_URI__, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            db = await connection.db(global.__MONGO_DB_NAME__);
        });

        beforeEach(async () => {
            for (const coll of await db.collections()) {
                coll.drop();
            }
        });

        afterAll(async () => {
            await connection.close();
            await db.close();
        });

        for (const testCase of test.cases) {

            it(testCase.name, async () => {
                const config = test.config || {};

                const appOpts = opts.appOpts || {};
                Object.assign(appOpts, { db, config });
                const app = await opts.createApp(appOpts);
                const agent = request.agent(app);

                const assertedPrecondition = preprocess(testCase.precondition || test.precondition);

                // set precondition
                await initDB(db, assertedPrecondition);

                // verify precondition (sanity check)
                const realPrecondition = await exportDB(db);
                expect(realPrecondition).toEqual(test.precondition);

                for (let i = 0; i < testCase.requests.length; i++) {
                    // pre-process test case data
                    const reqCase = testCase.requests[i];

                    if (reqCase.skip === true) continue;

                    const username = reqCase.username || testCase.username || test.username;

                    const assertedPostcondition = reqCase.postcondition || testCase.postcondition || test.postcondition;

                    // init asserted request
                    const defaultReq = { headers: {} };
                    const assertedReq = Object.assign(defaultReq, preprocess(reqCase.request));
                    validateReq(assertedReq);

                    // init asserted response
                    const defaultResp = { headers: {} };
                    const assertedResp = Object.assign(defaultResp, reqCase.response);

                    // prepare a request
                    const method = assertedReq.method.toLowerCase();

                    let pendingReq = agent[method](assertedReq.url)
                        .set(assertedReq.headers || {});

                    if (username) {
                        pendingReq = pendingReq.set(HDR_MOCK_USER, username);
                    }

                    if (assertedReq.body) {
                        pendingReq = pendingReq.query(assertedReq.query).sortQuery();
                    }

                    if (assertedReq.body) {
                        pendingReq = pendingReq.send(assertedReq.body);
                    }

                    if (assertedReq.cookies) {
                        pendingReq = pendingReq.set('Cookie', constructCookieList(assertedReq.cookies));
                    }

                    // send the request and receive response
                    const result = await pendingReq
                        .timeout({ deadline: assertedReq.timeout || 1000 })
                        .catch(err => {
                            console.error(err);
                            throw err;
                        });

                    // verify response
                    const realResp = refineResponse(result, assertedResp);
                    const unmaskedResp = unmask(assertedResp, realResp);
                    expect(realResp).toEqual(unmaskedResp);

                    // verify postcondition
                    if (assertedPostcondition) {
                        const realPostcondition = await exportDB(db);
                        const unmaskedPostcondition = unmask(assertedPostcondition, realPostcondition);
                        expect(realPostcondition).toEqual(unmaskedPostcondition);
                    }
                }
            });
        }
    });
}

function constructCookieList(cookies) {
    const cookieList = [];

    for (const key in cookies) {
        if (cookies.hasOwnProperty(key)) {
            cookieList.push(`${key}=${cookies[key]}`);
        }
    }

    return cookieList;
}

function refineResponse(result, assertedResp) {
    const refinedResp = {
        status: result.statusCode,
        body: result.body,
        headers: {},
    };

    for (const hdr of Object.keys(assertedResp.headers || {})) {
        if (result.headers[hdr] !== undefined) {
            refinedResp.headers[hdr] = result.headers[hdr];
        }
    }

    return refinedResp;
}

function validateReq(req) {
    if (SUPPORTED_HTTP_METHODS.indexOf(req.method) < 0) {
        throw new Error('Unsupported HTTP method: ' + req.method);
    }
}

module.exports = { runTest };