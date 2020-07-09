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

const helper = require('./helper');

const SEGMENT_KEY_REGEX = /^_\$[A-Z0-9_]+_$/;
const GROUP_NAME_REGEX = /^[a-z0-9_\$]+$/;
const GETTER_SUFFIX = '__getter';

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

    return segmentKey.toLowerCase().substring(2, segmentKey.length - 1);
}

function groupNameToSegmentKey(groupName) {
    validateGroupName(groupName);

    return '_$' + groupName.toUpperCase() + '_';
}

function isValidGetterName(name) {
    return name.endsWith(GETTER_SUFFIX);
}

function getTargetOfGetter(name) {
    return name.substring(0, name.length - GETTER_SUFFIX.length);
}

class DependencyInfo {

    constructor() {
        this._chain = [];
    }

    getChain(startingPos = 0) {
        return this._chain.slice(startingPos).join(' -> ');
    }

    checkForCircularDependencyAndRegister(name) {
        let pos = this._chain.indexOf(name);

        if (pos >= 0) {
            let chain = this.getChain(pos) + ' -> ' + name;
            let fullChain = this.getChain() + ' -> ' + name;
            let e = new Error(`Detected circular dependency: ${chain}`);
            e.details = { 'Full chain': fullChain };
            throw e;
        }

        this._chain.push(name);
    }

    finishInitialization(name) {
        let pos = this._chain.indexOf(name);

        if (pos < 0) {
            throw new Error(`Dependency was not registered: '${name}'`);
        }

        this._chain.splice(pos, 1);
    }

}

class DependencyInjection {

    constructor(opts) {
        debug('Initializing DI context...');

        this._createdOn = new Date();
        this._depInfo = new DependencyInfo();
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
            this._loadSegments(opts.moduleNames);

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
        if (!helper.isObject(modules)) throw new Error('The modules must be an object, with filenames as keys and modules as values!', modules);

        for (const moduleName in modules) {
            if (modules.hasOwnProperty(moduleName)) {
                const mod = modules[moduleName];
                this._addModuleToSeg(mod, moduleName);
            }
        }
    }

    _addModuleToSeg(mod, moduleName) {
        if (!helper.isObject(mod)) throw new Error(`The module '${moduleName}' must export an object!`);

        let foundSegKey = false;

        for (const segmentKey in mod) {
            if (mod.hasOwnProperty(segmentKey)) {
                validateSegmentKey(segmentKey);
                foundSegKey = true;

                let exportedSeg = mod[segmentKey];

                let dependencies = (typeof exportedSeg === 'function') ? helper.getParamNames(exportedSeg) : [];

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
            this._initComponents(this._segmentsByKey._$MOCKS_, false);
        }

        this._initComponents(this._segmentsByKey._$COMPONENTS_, true);

        for (const segmentKey in this._segmentsByKey) {
            if (this._segmentsByKey.hasOwnProperty(segmentKey)) {
                // components have already been initialized (for DI)
                if (segmentKey !== '_$COMPONENTS_' && segmentKey !== '_$MOCKS_') {
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
                value = this.getDependency(targetName);
                retrieved = true;
            }

            return value;
        }
    }

    _findDependency(name) {
        if (!helper.isValidName(name)) {
            throw new Error(`Invalid name: '${name}'`);
        }

        if (name === '_context') {
            return this;
        } else if (name === '_utils') {
            return helper;
        }

        if (this._mocks.hasOwnProperty(name)) {
            // found a mock that has been initialized
            return this._mocks[name];
        }

        const mock = this._findAndInitMock(name);
        if (mock !== undefined) return mock;

        if (isValidGetterName(name)) {
            let targetName = getTargetOfGetter(name);

            if (!this._getters.hasOwnProperty(targetName)) {
                this._getters[targetName] = this._createGetterWithCaching(targetName);
            }

            return this._getters[targetName];
        }

        if (this._groups.hasOwnProperty(name)) {
            // found a group that has been initialized
            return this._groups[name];
        }

        if (this._components.hasOwnProperty(name)) {
            // found a component that has been initialized
            return this._components[name];
        }

        if (isValidGroupName(name)) {
            let segmentKey = groupNameToSegmentKey(name);

            if (this._segmentsByKey.hasOwnProperty(segmentKey)) {
                // segments are loaded, but are not merged into a group yet
                return this._importGroup(segmentKey);
            }
        }

        const component = this._findAndInitComponent(name);
        if (component !== undefined) return component;

        const chain = this._depInfo.getChain();
        throw new Error(`Cannot find dependency '${name}' (dependency chain: ${chain})`);
    }

    _findAndInitComponent(name) {
        if (!this._factories.hasOwnProperty(name)) return undefined;
        const factory = this._factories[name];

        const chain = this._depInfo.getChain();
        debug(`Creating component '${name}' (dependency chain: ${chain})`);

        const comp = helper.invoke(factory, name => this.getDependency(name));
        this._components[name] = comp;

        const segment = this._segments[name];
        segment.value[name] = comp;

        return comp;
    }

    _findAndInitMock(name) {
        if (!this._mockFactories.hasOwnProperty(name)) return undefined;
        const factory = this._mockFactories[name];

        const chain = this._depInfo.getChain();
        debug(`Creating mock '${name}' (dependency chain: ${chain})`);

        const mock = helper.invoke(factory, name => this.getDependency(name));
        this._mocks[name] = mock;

        const segment = this._segments[name];
        segment.value[name] = mock;

        return mock;
    }

    _importGroup(segmentKey) {
        const groupName = segmentKeyToGroupName(segmentKey);
        if (this._groups.hasOwnProperty(groupName)) return this._groups[groupName];

        debug(`Importing segments of '${segmentKey}' into '${groupName}'`);

        this._depInfo.checkForCircularDependencyAndRegister(segmentKey);

        try {
            const group = this._groups[groupName] = this._components[groupName] || {};
            const segments = this._segmentsByKey[segmentKey] || [];

            for (const segment of segments) {
                debug('Importing segment: ', segment);

                const hasValue = ('value' in segment);

                if (!hasValue) {
                    const exported = segment.exported;

                    let exportedMembers;
                    if (typeof exported === 'function') {
                        exportedMembers = helper.invoke(exported, name => this.getDependency(name));
                    } else {
                        exportedMembers = exported;
                    }

                    segment.value = exportedMembers;

                    Object.assign(group, exportedMembers);
                }

                debug('Imported segment: ', segment);
            }

            return group;

        } finally {
            this._depInfo.finishInitialization(segmentKey);
        }
    }

    getDependency(name) {
        this._depInfo.checkForCircularDependencyAndRegister(name);

        try {
            return this._findDependency(name);

        } finally {
            this._depInfo.finishInitialization(name);
        }
    }

    getSegments(segmentKey) {
        validateSegmentKey(segmentKey);
        return this._segmentsByKey[segmentKey];
    }

    getGroup(name) {
        return this._groups[name.toLowerCase()];
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
        helper.invoke(func, name => this.getDependency(name));
    }

}

module.exports = { DependencyInjection };
