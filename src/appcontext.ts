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

import { App } from './app';
import { registerBuiltInComponents } from './built-ins';
import { DependencyInjection } from './container';

export type ComponentsSetup = {
    _?: any,
    config?: any,
    router?: any,
    mongodb: any,
    database?: any,
    logger__default?: any,
    HTTP_STATUS_CODES?: any,
}

export type AppContextOpts = {
    modules: any,
    moduleNames: string[],
    components: ComponentsSetup,
    componentFactories: any,
    config: { USE_MOCKS?: boolean, CONTINUE_ON_ERRORS?: boolean },
    require: any,
}

export function createAppContext(opts: AppContextOpts) {
    App.reset(); // reset the default app
    const app = App; // using the default app

    registerBuiltInComponents(app);
    app.addComponents(opts.components || {});
    app.addComponentFactories(opts.componentFactories || {});

    const context = new DependencyInjection({
        app,
        modules: opts.modules,
        moduleNames: opts.moduleNames,
        useMocks: opts.config.USE_MOCKS,
        continueOnErrors: opts.config.CONTINUE_ON_ERRORS,
        require,
    });

    // trigger an initialization of the top-level component
    context.getDependency('routing');

    return context;
}
