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

const utils = require('./utils');
const invoker = require('./invoker');

const { DependencyTracker } = require('./dep-tracker');

const SEGMENT_KEY_REGEX = /^\$\w+$/;
const GROUP_NAME_REGEX = /^[a-z0-9_\$]+$/;
const GETTER_SUFFIX = '__getter';
const DEFAULT_SUFFIX = '__default';

function debug(...args) {
    // console.debug(...args)
}

function isValidGroupName(name) {
    return !!name.match(GROUP_NAME_REGEX) && name.indexOf('__') < 0;
}

function isValidSegmentKey(name) {
    return !!name.match(SEGMENT_KEY_REGEX) && name.indexOf('__') < 0;
}

function validateSegmentKey(segmentKey) {
    if (!isValidSegmentKey(segmentKey)) {
        throw new Error(`Invalid segment key: '${segmentKey}'`);
    }
}

function validateGroupName(groupName) {
    if (!isValidGroupName(groupName)) {
        throw new Error(`Invalid group name: '${groupName}'`);
    }
}

function segmentKeyToGroupName(segmentKey) {
    validateSegmentKey(segmentKey);

    return segmentKey.substring(1);
}

function groupNameToSegmentKey(groupName) {
    validateGroupName(groupName);

    return '$' + groupName;
}

function isValidGetterName(name) {
    return name.endsWith(GETTER_SUFFIX);
}

function getTargetOfGetter(name) {
    return name.substring(0, name.length - GETTER_SUFFIX.length);
}

class DependencyInjection {

    constructor(opts) {
        debug('Initializing DI context...');

        this._createdOn = new Date();
        this._depInfo = new DependencyTracker();
        this._useMocks = opts.useMocks;

        this._components = Object.assign({}, opts.components || {});
        this._mocks = Object.assign({}, opts.mocks || {});

        this._factories = Object.assign({}, opts.factories || {});
        this._mockFactories = Object.assign({}, opts.mockFactories || {});

        this._segmentsByKey = {};
        this._segments = {};
        this._groups = {};
        this._getters = {};

        if (opts.logError !== undefined) {
            // override error handler
            this.logError = opts.logError.bind(this);
        }

        try {
            // load
            if (opts.moduleNames) {
                this._loadSegments(opts.moduleNames);
            }

            // register provided modules
            if (opts.modules) {
                this._registerModules(opts.modules);
            }

            // initialize
            this._init();

            debug('DI context is ready', this.info());

        } catch (e) {
            debug('DI initialization error!', this.info());
            throw e;
        }
    }

    _loadSegments(moduleNames) {
        for (let moduleName of moduleNames) {
            try {
                let importedModule = require(moduleName);

                this._addModuleToSeg(importedModule, moduleName);

            } catch (e) {
                throw new Error(`The module '${moduleName}' could not be imported!`, e);
            }
        }
    }

    _registerModules(modules) {
        if (!utils.isObject(modules)) throw new Error('The modules must be an object, with filenames as keys and modules as values!', modules);

        for (const moduleName in modules) {
            if (modules.hasOwnProperty(moduleName)) {
                const mod = modules[moduleName];
                this._addModuleToSeg(mod, moduleName);
            }
        }
    }

    _addModuleToSeg(mod, moduleName) {
        if (!utils.isObject(mod)) throw new Error(`The module '${moduleName}' must export an object!`);

        let foundSegKey = false;

        for (const segmentKey in mod) {
            if (mod.hasOwnProperty(segmentKey)) {
                validateSegmentKey(segmentKey);
                foundSegKey = true;

                let exportedSeg = mod[segmentKey];

                let dependencies = (typeof exportedSeg === 'function') ? invoker.getParamNames(exportedSeg) : [];

                this._getSegs(segmentKey).push({
                    filename: moduleName,
                    dependencies,
                    exported: exportedSeg,
                });
            }
        }

        if (!foundSegKey) throw new Error(`The module '${moduleName}' must export at least one segment!`, mod);
    }

    _getSegs(segmentKey) {
        return this._segmentsByKey[segmentKey] = this._segmentsByKey[segmentKey] || [];
    }

    _init() {
        if (this._useMocks) {
            this._initComponents(this._segmentsByKey.$mocks, false);
        }

        this._initComponents(this._segmentsByKey.$components, true);

        for (const segmentKey in this._segmentsByKey) {
            if (this._segmentsByKey.hasOwnProperty(segmentKey)) {
                // components have already been initialized (for DI)
                if (segmentKey !== '$components' && segmentKey !== '$mocks') {
                    this._importGroup(segmentKey);
                }
            }
        }
    }

    _initComponents(componentSegments, real) {
        for (const segment of componentSegments || []) {

            const exported = segment.exported;
            segment.real = real;
            segment.value = {}; // the components will be assigned here when ready

            for (const name in exported) {
                if (exported.hasOwnProperty(name)) {
                    const comp = exported[name];

                    if (real) {
                        if ((name in this._components) || (name in this._factories) || (name in this._segments)) {
                            throw new Error(`Detected duplicate definition of the component '${name}'`);
                        }
                    } else {
                        if ((name in this._mocks) || (name in this._mockFactories) || (name in this._segments)) {
                            throw new Error(`Detected duplicate definition of the mock '${name}'`);
                        }
                    }

                    this._segments[name] = segment;

                    if (typeof comp === 'function') {
                        // it is a component factory (function)
                        debug('Registering factory for component: ' + name);

                        if (real) {
                            this._factories[name] = comp;
                        } else {
                            this._mockFactories[name] = comp;
                        }

                    } else {
                        // it is a ready component (not a factory)
                        debug('Registering component: ' + name);

                        if (real) {
                            this._components[name] = comp;
                        } else {
                            this._mocks[name] = comp;
                        }

                        segment.value[name] = comp;
                    }
                }
            }
        }
    }

    _createGetterWithCaching(targetName) {
        let retrieved = false;
        let value; // cache the value

        return () => {
            if (!retrieved) {
                value = this._findDependencyWithTracking(targetName);
                retrieved = true;
            }

            return value;
        }
    }

    _findDependencyWithTracking(name) {
        this._depInfo.enter(name);

        try {
            return this._findDependency(name);

        } finally {
            this._depInfo.leave(name);
        }
    }

    // must be called through _findDependencyWithTracking()
    _findDependency(name) {
        if (!utils.isValidName(name)) {
            throw new Error(`Invalid name: '${name}'`);
        }

        const defaultName = name + DEFAULT_SUFFIX;

        // context
        if (name === '__context') {
            return this;
        }

        if (this._useMocks) {
            // mock
            if (this._mocks.hasOwnProperty(name)) {
                // found a mock that has been initialized
                return this._mocks[name];
            }

            // mock factory
            if (this._mockFactories.hasOwnProperty(name)) {
                return this._produceMock(name);
            }

            // default mock
            if (this._mocks.hasOwnProperty(defaultName)) {
                // found a default mock that has been initialized
                return this._mocks[defaultName];
            }

            // default mock factory
            if (this._mockFactories.hasOwnProperty(defaultName)) {
                return this._produceMock(defaultName);
            }
        }

        // getter
        if (isValidGetterName(name)) {
            let targetName = getTargetOfGetter(name);

            if (!this._getters.hasOwnProperty(targetName)) {
                this._getters[targetName] = this._createGetterWithCaching(targetName);
            }

            return this._getters[targetName];
        }

        // group (initialized)
        if (this._groups.hasOwnProperty(name)) {
            // found a group that has been initialized
            return this._groups[name];
        }

        // component
        if (this._components.hasOwnProperty(name)) {
            // found a component that has been initialized
            return this._components[name];
        }

        // group (to initialize)
        if (isValidGroupName(name)) {
            let segmentKey = groupNameToSegmentKey(name);

            if (this._segmentsByKey.hasOwnProperty(segmentKey)) {
                // segments are loaded, but are not merged into a group yet
                return this._importGroup(segmentKey);
            }
        }

        // component factory
        if (this._factories.hasOwnProperty(name)) {
            return this._produceComponent(name);
        }

        // default component
        if (this._components.hasOwnProperty(defaultName)) {
            // found a default component that has been initialized
            return this._components[defaultName];
        }

        // default component factory
        if (this._factories.hasOwnProperty(defaultName)) {
            return this._produceComponent(defaultName);
        }

        const chain = this._depInfo.getChain();
        throw new Error(`Cannot find dependency '${name}' (dependency chain: ${chain})`);
    }

    _produceComponent(name) {
        const factory = this._factories[name];
        if (!factory) throw new Error(`The factory '${name}' doesn't exist!`);

        const chain = this._depInfo.getChain();
        debug(`Creating component '${name}' (dependency chain: ${chain})`);

        const comp = invoker.invoke(factory, name => this._findDependencyWithTracking(name));
        this._components[name] = comp;

        const segment = this._segments[name];
        segment.value[name] = comp;

        return comp;
    }

    _produceMock(name) {
        const factory = this._mockFactories[name];
        if (!factory) throw new Error(`The mock factory '${name}' doesn't exist!`);

        const chain = this._depInfo.getChain();
        debug(`Creating mock '${name}' (dependency chain: ${chain})`);

        const mock = invoker.invoke(factory, name => this._findDependencyWithTracking(name));
        this._mocks[name] = mock;

        const segment = this._segments[name];
        segment.value[name] = mock;

        return mock;
    }

    _importGroup(segmentKey) {
        const groupName = segmentKeyToGroupName(segmentKey);
        if (this._groups.hasOwnProperty(groupName)) return this._groups[groupName];

        debug(`Importing segments of '${segmentKey}' into '${groupName}'`);

        this._depInfo.enter(segmentKey);

        try {
            const group = this._components[groupName] || {};
            const segments = this._segmentsByKey[segmentKey] || [];

            for (const segment of segments) {
                debug('Importing segment: ', segment);

                const hasValue = ('value' in segment);

                if (!hasValue) {
                    const exported = segment.exported;

                    let exportedMembers;
                    if (typeof exported === 'function') {
                        exportedMembers = invoker.invoke(exported, name => this._findDependencyWithTracking(name));
                    } else {
                        exportedMembers = exported;
                    }

                    segment.value = exportedMembers;

                    Object.assign(group, exportedMembers);
                }

                debug('Imported segment: ', segment);
            }

            // assign the group after it has been fully initialized, to prevent returning incomplete group
            this._groups[groupName] = group;

            return group;

        } finally {
            this._depInfo.leave(segmentKey);
        }
    }

    getDependency(name) {
        return this._findDependencyWithTracking(name);
    }

    getSegments(segmentKey) {
        validateSegmentKey(segmentKey);
        return this._segmentsByKey[segmentKey];
    }

    getGroup(name) {
        return this._groups[name];
    }

    logError(e) {
        console.trace(e);
    }

    info() {
        return {
            createdOn: this._createdOn,
            segments: Object.keys(this._segments),
            segmentsByKey: Object.keys(this._segmentsByKey),
            components: Object.keys(this._components),
            mocks: Object.keys(this._mocks),
            factories: Object.keys(this._factories),
            mockFactories: Object.keys(this._mockFactories),
            groups: Object.keys(this._groups),
            getters: Object.keys(this._getters),
        };
    }

    execute(func) {
        invoker.invoke(func, name => this._findDependencyWithTracking(name));
    }

}

module.exports = { DependencyInjection };
