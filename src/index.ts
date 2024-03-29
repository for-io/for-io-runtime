/*!
 * for-io-runtime
 *
 * Copyright (c) 2019-2021 Nikolche Mihajlovski and EPFL
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

export { App, AppSetup } from './app';
export { ExtendedMongoCollection } from './components/db';
export { EntityOptions, ForIoType, PrimitiveTypes, TypeImplOpts, TypeImplUtils, TypeInstanceFactory, ValidationErrors } from './type-registry';
import { appFactory as createApp } from './appFactory';
import server from './server';

export const appFactory = createApp;

async function initAndStartServer(opts: any) {
    const { app, config } = opts.app ? opts : await createApp(opts);

    server.listen({ app, config });
}

export const ForIo = {
    start(opts: any) {
        initAndStartServer(opts).catch(e => console.log('Error while starting the server!', e));
    }
};