/*!
 * for-io-runtime
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

const builtInTypes = require("./components/types");
const builtInResponses = require("./components/responses");
const builtInExceptionHandler = require("./components/exceptionHandler");
const builtInPasswordsMock = require("./mocks/passwordsMock");
const builtInMiddlewareMock = require("./mocks/middlewareMock");
const builtInAuthMock = require("./mocks/authMock");
const builtInDbProvider = require("./components/db");
const builtInPageProvider = require("./providers/page");
const builtInLogProvider = require("./providers/log");
const builtInUserProvider = require("./providers/user");
const builtInRouting = require('./components/routing');

export default {
    builtInTypes,
    builtInResponses,
    builtInExceptionHandler,
    builtInPasswordsMock,
    builtInMiddlewareMock,
    builtInAuthMock,
    builtInDbProvider,
    builtInPageProvider,
    builtInLogProvider,
    builtInUserProvider,
    builtInRouting,
};