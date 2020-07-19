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

const { DependencyTracker } = require('./dep-tracker');
const invoker = require('./invoker');
const container = require('./container');
const typeRegistry = require('./type-registry');
const builtInModules = require('./builtInModules');

function createAppContext({ modules, moduleNames, components = {}, useMocks = false, require }) {

    const builtInComponents = {
        invoker,
        typeRegistry,
        DependencyTracker,
        typedefs__default: {},
        controllers__default: {},
        api__default: {},
        config__default: {},
        logger__default: console,
    };

    const allModules = Object.assign({}, builtInModules, modules);
    const allComponents = Object.assign(builtInComponents, components);

    const context = new container.DependencyInjection({
        components: allComponents,
        modules: allModules,
        moduleNames,
        useMocks,
        require,
    });

    // trigger initialization of the top-level component
    context.getDependency('routing');

    return context;
}

module.exports = { createAppContext };