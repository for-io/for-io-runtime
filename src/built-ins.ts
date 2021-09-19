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

import { AppSetup } from ".";
import { registerDb } from "./components/db";
import { registerExceptionHandler } from "./components/exceptionHandler";
import { registerResponses } from "./components/responses";
import { registerRouting } from "./components/routing";
import { registerTypes } from "./components/types";
import { DependencyTracker } from './dep-tracker';
import * as invokers from './invokers';
import { registerAuthMock } from "./mocks/authMock";
import { registerAuthMiddlewareFactoryMock } from "./mocks/middlewareMock";
import { registerPasswordsMock } from "./mocks/passwordsMock";
import { registerLog } from "./providers/log";
import { registerPageProvider } from "./providers/page";
import { registerUser } from "./providers/user";
import { typeRegistry } from './type-registry';

export function registerBuiltInComponents(app: AppSetup) {
    app.addService({ name: 'invokers' }, invokers);
    app.addService({ name: 'typeRegistry' }, typeRegistry);
    app.addService({ name: 'DependencyTracker' }, DependencyTracker);

    app.addComponent({ name: 'typedefs', asDefault: true }, {});
    app.addComponent({ name: 'controllers', asDefault: true }, {});
    app.addComponent({ name: 'api', asDefault: true }, {});

    registerTypes(app);
    registerResponses(app);
    registerPasswordsMock(app);
    registerAuthMiddlewareFactoryMock(app);
    registerAuthMock(app);
    registerExceptionHandler(app);
    registerDb(app); // fixme complete members
    registerPageProvider(app);
    registerLog(app);
    registerUser(app);
    registerRouting(app);
}
