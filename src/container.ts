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

import { forOwn, Function0 } from 'lodash';
import { AppSetup } from '.';
import { AppSetupElements, AppSetupWrappedValue } from './app';
import { DEFAULT_SUFFIX, GETTER_SUFFIX, OPTIONAL_SUFFIX } from './constants';
import { DependencyTracker } from './dep-tracker';
import * as invokers from './invokers';
import utils from './utils';

const EXPORT_KEY_REGEX = /^(SINGLETON|MOCK|MEMBER|API|CONTROLLER|PROVIDER|TYPE)\s+([\w\.\$]+)$/;
const SEGMENT_NAME_REGEX = /^[A-Z][A-Z_]*$/;
const GROUP_NAME_REGEX = /^[a-z_\$][\w\$]*$/;
const MEMBER_SEGMENT_NAME_REGEX = /^[a-z_\$][\w\$]*\.[a-z_\$][\w\$]*$/;

const SINGLETON = 'SINGLETON';
const MOCK = 'MOCK';
const PROVIDER = 'PROVIDER';
const MEMBER = 'MEMBER';

export interface DIContext {
    getDependency(name: string): any;
    getDependencyIfExists(name: string): any;
    getSegments(segmentKey: string): any[];
    getGroup(name: string): any;
}

type Segment = {
    name: string,
    type?: string,
    moduleName?: string,
    dependencies: string[],
    exported: any,
    value?: any,
    real?: boolean,
}

type DepSearchOpts = {
    optional?: boolean,
}

function debug(...args: any[]) {
    // console.debug(...args)
}

function isValidGroupName(name: string) {
    return !!name.match(GROUP_NAME_REGEX) && name.indexOf('__') < 0;
}

function isValidExportKey(name: string) {
    return !!name.match(EXPORT_KEY_REGEX);
}

function isValidSegmentKey(name: string) {
    return !!name.match(SEGMENT_NAME_REGEX) && name.indexOf('__') < 0;
}

function validateExportKey(segmentKey: any) {
    if (!isValidExportKey(segmentKey)) {
        throw new Error(`Invalid export key: '${segmentKey}'`);
    }
}

function validateSegmentKey(segmentKey: any) {
    if (!isValidSegmentKey(segmentKey)) {
        throw new Error(`Invalid segment key: '${segmentKey}'`);
    }
}

function validateMemberSegmentName(name: string) {
    if (!MEMBER_SEGMENT_NAME_REGEX.test(name)) {
        throw new Error(`Invalid member segment name: '${name}'`);
    }
}

function validateGroupName(groupName: string) {
    if (!isValidGroupName(groupName)) {
        throw new Error(`Invalid group name: '${groupName}'`);
    }
}

function segmentKeyToGroupName(segmentKey: any) {
    validateSegmentKey(segmentKey);

    switch (segmentKey) {
        case 'API': return 'api';
        case 'CONTROLLER': return 'controllers';
        case 'PROVIDER': return 'providers';
        case 'TYPE': return 'typedefs';
        default: return segmentKey.toLowerCase();
    }
}

function groupNameToSegmentKey(groupName: string) {
    validateGroupName(groupName);

    switch (groupName) {
        case 'api': return 'API';
        case 'controllers': return 'CONTROLLER';
        case 'providers': return 'PROVIDER';
        case 'typedefs': return 'TYPE';
        default: return null;
    }
}

function isValidGetterName(name: string) {
    return name.endsWith(GETTER_SUFFIX);
}

function getTargetOfGetter(name: string) {
    return name.substring(0, name.length - GETTER_SUFFIX.length);
}

export class DependencyInjection implements DIContext {

    private _createdOn: any;
    private _depInfo: any;
    private _tsTypes: any;
    private _components: any;
    private _componentFactories: any;
    private _mocks: any;
    private _mockFactories: any;
    private _getters: any;
    private _groups: any;
    private _memberSegmentsByTarget: any;
    private _moduleNames: any;
    private _require: any;
    private _segments: any;
    private _segmentsByKey: any;
    private _useMocks: any;
    private _continueOnErrors: any;

    constructor(opts: any) {
        debug('Initializing DI context...');

        this._require = opts.require || require;
        this._createdOn = new Date();
        this._depInfo = new DependencyTracker();
        this._useMocks = opts.useMocks;
        this._continueOnErrors = opts.continueOnErrors;
        this._moduleNames = opts.moduleNames;
        this._tsTypes = {}; // init this before processing the elements

        this._components = {};
        this._componentFactories = {};

        this._mocks = {};
        this._mockFactories = {};

        this._segmentsByKey = {};
        this._memberSegmentsByTarget = {};
        this._segments = {};
        this._groups = {};
        this._getters = {};

        if (opts.logError !== undefined) {
            // override error handler
            this.logError = opts.logError.bind(this);
        }

        const app: AppSetup = opts.app;
        if (!app) {
            throw new Error('The app setup (opts.app) must be provided!');
        }

        try {
            // register provided modules
            if (opts.modules) {
                this._registerModules(opts.modules, app);
            }

            // load modules, based on the provided module names
            if (opts.moduleNames) {
                this._loadModules(opts.moduleNames, app);
            }

            // at this moment, the app: AppSetup is initialized by the loaded modules
            this._registerProvidedElements(app.getElements());

            // initialize the DI context
            this._init();

            debug('DI context is ready', this.info());

        } catch (e) {
            debug('DI initialization error!', this.info());
            throw e;
        }
    }

    private _registerProvidedElements(elements: AppSetupElements) {
        // first init components (order matters for ts types def priority)
        const endpoints = this._extractValuesAndUpdateTsTypes(elements.endpoints);
        const componentFactories = this._extractValuesAndUpdateTsTypes(elements.componentFactories);
        const providerFactories = this._extractValuesAndUpdateTsTypes(elements.providerFactories);
        const memberFactories = this._extractValuesAndUpdateTsTypes(elements.memberFactories);
        const typeDefFactories = this._extractValuesAndUpdateTsTypes(elements.typeDefFactories);

        // then init the mocks (order matters for ts types def priority)
        const mockFactories = this._extractValuesAndUpdateTsTypes(elements.mockFactories);

        // register provided segments (components, mocks, providers etc.)
        forOwn(endpoints, (elem, name) => this._addSegment(elem, name, 'API'));
        forOwn(componentFactories, (elem, name) => this._addSegment(elem, name, SINGLETON));
        forOwn(mockFactories, (elem, name) => this._addSegment(elem, name, MOCK));
        forOwn(providerFactories, (elem, name) => this._addSegment(elem, name, PROVIDER));
        forOwn(memberFactories, (elem, name) => this._addSegment(elem, name, MEMBER));
        forOwn(typeDefFactories, (elem, name) => this._addSegment(elem, name, 'TYPE'));
    }

    _extractValuesAndUpdateTsTypes(wrappedValuesDict: any) {
        const unwrappedValues: any = {};

        forOwn(wrappedValuesDict || {}, (wrappedVal: AppSetupWrappedValue, name) => {
            utils.def(wrappedVal, 'wrappedVal');
            utils.def(wrappedVal.value, 'wrapped value');

            unwrappedValues[name] = wrappedVal.value;

            if (wrappedVal.type && !this._tsTypes[name]) {
                this._tsTypes[name] = wrappedVal.type;
            }
        });

        return wrappedValuesDict;
        // return unwrappedValues;
    }

    _loadModule(moduleName: string) {
        let mod;

        try {
            mod = this._require(moduleName);
        } catch (e) {
            this.logError(e);
            return;
        }

        if (utils.isObject(mod)) {
            let keys = Object.keys(mod);
            if (keys.length > 0) {
                throw new Error('Exporting components from modules is not supported anymore! Exported properties: ' + keys.join(', '));
            }
        }
    }

    _loadModules(moduleNames: any, app: AppSetup) {
        for (let moduleName of moduleNames.src || []) {
            app.executeWithinModule(moduleName, () => {
                this._loadModule(moduleName);
            });
        }

        for (let moduleName of moduleNames.test || []) {
            app.executeWithinModule(moduleName, () => {
                this._loadModule(moduleName);
            });
        }
    }

    _registerModules(modules: any, app: AppSetup) {
        if (!utils.isObject(modules)) throw new Error('The modules must be an object, with filenames as keys and modules as values!');

        for (const moduleName in modules) {
            if (modules.hasOwnProperty(moduleName)) {
                const mod = modules[moduleName];

                app.executeWithinModule(moduleName, () => {
                    this._importSegmentsFromModule(mod, moduleName)
                });
            }
        }
    }

    _importSegmentsFromModule(mod: any, moduleName: string) {
        if (utils.isFunction(mod)) {
            // NEW DESIGN - the provided modules can be functions that simply need to be executed
            mod();
            return;
        } else {
            throw new Error(`The provided modules must be functions, but module "${moduleName}" has type: ${typeof mod}`);
        }
    }

    private _addSegment(wrappedVal: AppSetupWrappedValue, name: string, segmentKey: string) {
        let dependencies = this._getDependencies(wrappedVal);

        let segment: Segment = {
            name,
            type: wrappedVal.type,
            moduleName: wrappedVal.moduleName,
            dependencies,
            exported: wrappedVal.value,
            real: segmentKey != MOCK,
        };

        this._getSegs(segmentKey).push(segment);

        if (segmentKey === MEMBER) {
            validateMemberSegmentName(name);
            let targetName = name.split('.')[0];
            this._getMemberSegs(targetName).push(segment);
        }
    }

    private _getDependencies(segmentVal: any) {
        return utils.isFunction(segmentVal) ? invokers.getParamNames(segmentVal) : [];
    }

    _getSegs(segmentKey: any): Segment[] {
        return this._segmentsByKey[segmentKey] = this._segmentsByKey[segmentKey] || [];
    }

    _getMemberSegs(targetName: string) {
        return this._memberSegmentsByTarget[targetName] = this._memberSegmentsByTarget[targetName] || [];
    }

    _init() {
        if (this._useMocks) {
            this._initSegments(this._segmentsByKey[MOCK] || [], false);
        }

        this._initSegments(this._segmentsByKey[SINGLETON] || [], true);

        for (const segmentKey in this._segmentsByKey) {
            if (this._segmentsByKey.hasOwnProperty(segmentKey)) {
                // components have already been initialized (for DI)
                if (segmentKey !== SINGLETON && segmentKey !== MOCK && segmentKey !== MEMBER) {
                    let groupName = segmentKeyToGroupName(segmentKey);
                    this._importGroup(groupName, segmentKey);
                }
            }
        }

        // process remaining member segments (some of them might be already initialized by imported components/groups)
        this._importMembers(this._segmentsByKey[MEMBER] || []);
    }

    _initSegments(segments: Segment[], real: boolean) {
        for (const segment of segments) {

            const name = segment.name;
            const comp = segment.exported;

            segment.real = real;

            if (real) {
                if ((name in this._components) || (name in this._componentFactories)) {
                    throw new Error(`Detected duplicate definition of the component '${name}'`);
                }
            } else {
                if ((name in this._mocks) || (name in this._mockFactories)) {
                    throw new Error(`Detected duplicate definition of the mock '${name}'`);
                }
            }

            this._segments[name] = segment;

            if (utils.isFunction(comp)) {
                // it is a component factory (function)
                debug('Registering factory for component: ' + name);

                if (real) {
                    this._componentFactories[name] = comp;
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

                segment.value = comp;
            }
        }
    }

    _createGetterWithCaching(targetName: string) {
        let retrieved = false;
        let value: any; // cache the value

        return () => {
            if (!retrieved) {
                value = this._findDependencyWithTracking(targetName);
                retrieved = true;
            }

            return value;
        }
    }

    _findDependencyWithTracking(name: string, opts: DepSearchOpts = {}) {
        this._depInfo.enter(name);

        try {
            return this._findDependency(name, opts);

        } finally {
            this._depInfo.leave(name);
        }
    }

    // must be called through _findDependencyWithTracking()
    _findDependency(name: string, opts: DepSearchOpts = {}) {
        let isOptional = opts.optional;

        if (name.endsWith(OPTIONAL_SUFFIX)) {
            isOptional = true;
            name = name.substring(0, name.length - OPTIONAL_SUFFIX.length);
        }

        if (!utils.isValidName(name)) throw new Error(`Invalid name: '${name}'`);

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

            if (segmentKey && this._segmentsByKey.hasOwnProperty(segmentKey)) {
                // segments are loaded, but are not merged into a group yet
                let groupName = segmentKeyToGroupName(segmentKey);
                return this._importGroup(groupName, segmentKey);

            } else {
                if (this._memberSegmentsByTarget.hasOwnProperty(name)) {
                    return this._importGroup(name); // no segment key
                }
            }
        }

        // component factory
        if (this._componentFactories.hasOwnProperty(name)) {
            return this._produceComponent(name);
        }

        // default component
        if (this._components.hasOwnProperty(defaultName)) {
            // found a default component that has been initialized
            return this._components[defaultName];
        }

        // default component factory
        if (this._componentFactories.hasOwnProperty(defaultName)) {
            return this._produceComponent(defaultName);
        }

        if (isOptional) {
            return undefined;
        } else {
            const chain = this._depInfo.getChain();
            throw new Error(`Cannot find dependency '${name}' (dependency chain: ${chain})`);
        }
    }

    _produceComponent(name: string) {
        const factory = this._componentFactories[name];
        if (!factory) throw new Error(`The component factory '${name}' doesn't exist!`);

        const chain = this._depInfo.getChain();
        debug(`Creating component '${name}' (dependency chain: ${chain})`);

        const comp = this._produce(factory);
        this._components[name] = comp;

        const segment = this._getOrCreateSegment(name, factory, true);
        segment.value = comp;

        return comp;
    }

    _produceMock(name: string) {
        const factory = this._mockFactories[name];
        if (!factory) throw new Error(`The mock factory '${name}' doesn't exist!`);

        const chain = this._depInfo.getChain();
        debug(`Creating mock '${name}' (dependency chain: ${chain})`);

        const mock = this._produce(factory);
        this._mocks[name] = mock;

        const segment = this._getOrCreateSegment(name, factory, false);
        segment.value = mock;

        return mock;
    }

    private _getOrCreateSegment(name: string, exportedVal: any, real: boolean) {
        let segment: Segment = this._segments[name];

        if (!segment) {
            throw new Error(`Found uninitialized segment: '${name}'`);
        }

        return segment;
    }

    _produce(factory: any) {
        return invokers.invoke(factory, (name: string) => this._findDependencyWithTracking(name));
    }

    _isInitialized(segment: Segment) {
        return ('value' in segment);
    }

    _initSegment(segment: Segment) {
        const segmentName = segment.moduleName ? `${segment.moduleName}/${segment.name}` : segment.name;

        this._depInfo.enter(segmentName);

        try {
            if (!this._isInitialized(segment)) {
                debug(`Initializing segment "${segmentName}"`, segment);

                const exportedValOrFactory = segment.exported;

                const exportedVal = utils.isFunction(exportedValOrFactory)
                    ? this._produce(exportedValOrFactory)
                    : exportedValOrFactory;

                segment.value = exportedVal;
            }

        } finally {
            this._depInfo.leave(segmentName);
        }

        utils.must(this._isInitialized(segment));

        return segment.value;
    }

    _importGroup(groupName: string, segmentKey?: string) {
        if (this._groups.hasOwnProperty(groupName)) return this._groups[groupName];

        debug(`Importing group '${groupName}' (segment key: '${segmentKey}')`);

        const group = this._components[groupName] || {};

        if (segmentKey) {
            for (const segment of this._segmentsByKey[segmentKey] || []) {
                group[segment.name] = this._initSegment(segment);
            }
        }

        for (const segment of this._memberSegmentsByTarget[groupName] || []) {
            const [targetName, memberName] = segment.name.split('.');

            utils.must(groupName === targetName);

            group[memberName] = this._initSegment(segment);
        }

        // assign the group after it has been fully initialized, to prevent returning incomplete group
        this._groups[groupName] = group;

        return group;
    }

    _importMembers(segments: Segment[]) {
        debug(`Importing ${segments.length} members`);

        const pendingSegments = segments.filter(seg => !this._isInitialized(seg));

        for (const segment of pendingSegments) {
            const [targetName, memberName] = segment.name.split('.');

            const newTarget = {};
            const target = this._groups[targetName] || this._components[targetName] || this._mocks[targetName] || newTarget;

            target[memberName] = this._initSegment(segment);

            // if it is a new target
            if (target === newTarget) {
                // assign the group after setting the member, to prevent circular dependencies
                this._groups[targetName] = target;
            }
        }
    }

    getDependency(name: string) {
        return this._findDependencyWithTracking(name);
    }

    getDependencyIfExists(name: string) {
        return this._findDependencyWithTracking(name, { optional: true });
    }

    getSegments(segmentKey: string) {
        validateSegmentKey(segmentKey);
        return this._segmentsByKey[segmentKey];
    }

    getGroup(name: string) {
        return this._groups[name];
    }

    logError(e: any) {
        console.trace(e);
    }

    info() {
        return {
            createdOn: this._createdOn,
            segments: Object.keys(this._segments),
            segmentsByKey: Object.keys(this._segmentsByKey),
            memberSegmentsByTarget: Object.keys(this._memberSegmentsByTarget),
            components: Object.keys(this._components),
            componentFactories: Object.keys(this._componentFactories),
            mocks: Object.keys(this._mocks),
            mockFactories: Object.keys(this._mockFactories),
            groups: Object.keys(this._groups),
            getters: Object.keys(this._getters),
        };
    }

    execute(func: any) {
        invokers.invoke(func, (name: string) => this._findDependencyWithTracking(name));
    }

    iterateSegments(fn: any) {
        for (const segmentKey in this._segmentsByKey) {
            if (this._segmentsByKey.hasOwnProperty(segmentKey)) {
                let cs = this._segmentsByKey[segmentKey];
                for (const c of cs) {
                    fn(segmentKey, c);
                }
            }
        }
    }
}
