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

import utils from './utils';
import invokers from './invokers';
import { DependencyTracker } from './dep-tracker';

const EXPORT_KEY_REGEX = /^(SINGLETON|MOCK|MEMBER|API|CONTROLLER|PROVIDER|TYPE)\s+([\w\.\$]+)$/;
const SEGMENT_NAME_REGEX = /^[A-Z][A-Z_]*$/;
const GROUP_NAME_REGEX = /^[a-z_\$][\w\$]*$/;
const MEMBER_SEGMENT_NAME_REGEX = /^[a-z_\$][\w\$]*\.[a-z_\$][\w\$]*$/;

const SINGLETON = 'SINGLETON';
const MOCK = 'MOCK';
const MEMBER = 'MEMBER';

const GETTER_SUFFIX = '__getter';
const DEFAULT_SUFFIX = '__default';
const OPTIONAL_SUFFIX = '__optional';

function debug(...args: any[]) {
    // console.debug(...args)
}

function isValidGroupName(name: any) {
    return !!name.match(GROUP_NAME_REGEX) && name.indexOf('__') < 0;
}

function isValidExportKey(name: any) {
    return !!name.match(EXPORT_KEY_REGEX);
}

function isValidSegmentKey(name: any) {
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

function validateMemberSegmentName(name: any) {
    if (!MEMBER_SEGMENT_NAME_REGEX.test(name)) {
        throw new Error(`Invalid member segment name: '${name}'`);
    }
}

function validateGroupName(groupName: any) {
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

function groupNameToSegmentKey(groupName: any) {
    validateGroupName(groupName);

    switch (groupName) {
        case 'api': return 'API';
        case 'controllers': return 'CONTROLLER';
        case 'providers': return 'PROVIDER';
        case 'typedefs': return 'TYPE';
        default: return null;
    }
}

function isValidGetterName(name: any) {
    return name.endsWith(GETTER_SUFFIX);
}

function getTargetOfGetter(name: any) {
    return name.substring(0, name.length - GETTER_SUFFIX.length);
}

export class DependencyInjection {
    _components: any;
    _continueOnErrors: any;
    _createdOn: any;
    _depInfo: any;
    _factories: any;
    _getters: any;
    _groups: any;
    _memberSegmentsByTarget: any;
    _mockFactories: any;
    _mocks: any;
    _moduleNames: any;
    _require: any;
    _segments: any;
    _segmentsByKey: any;
    _useMocks: any;

    constructor(opts: any) {
        debug('Initializing DI context...');

        this._require = opts.require || require;
        this._createdOn = new Date();
        this._depInfo = new DependencyTracker();
        this._useMocks = opts.useMocks;
        this._continueOnErrors = opts.continueOnErrors;
        this._moduleNames = opts.moduleNames;

        this._components = Object.assign({}, opts.components || {});
        this._mocks = Object.assign({}, opts.mocks || {});

        this._factories = Object.assign({}, opts.factories || {});
        this._mockFactories = Object.assign({}, opts.mockFactories || {});

        this._segmentsByKey = {};
        this._memberSegmentsByTarget = {};
        this._segments = {};
        this._groups = {};
        this._getters = {};

        if (opts.logError !== undefined) {
            // override error handler
            this.logError = opts.logError.bind(this);
        }

        try {
            // register provided modules
            if (opts.modules) {
                this._registerModules(opts.modules);
            }

            // load modules
            if (opts.moduleNames) {
                this._loadModules(opts.moduleNames);
            }

            // initialize
            this._init();

            debug('DI context is ready', this.info());

        } catch (e) {
            debug('DI initialization error!', this.info());
            throw e;
        }
    }

    _loadModule(moduleName: any) {
        try {
            this._addModuleToSeg(this._require(moduleName), moduleName);

        } catch (e) {
            this.logError(e);
        }
    }

    _loadModules(moduleNames: any) {
        for (let moduleName of moduleNames.src || []) {
            this._loadModule(moduleName);
        }

        for (let moduleName of moduleNames.test || []) {
            this._loadModule(moduleName);
        }
    }

    _registerModules(modules: any) {
        if (!utils.isObject(modules)) throw new Error('The modules must be an object, with filenames as keys and modules as values!');

        for (const moduleName in modules) {
            if (modules.hasOwnProperty(moduleName)) {
                const mod = modules[moduleName];
                this._addModuleToSeg(mod, moduleName);
            }
        }
    }

    _addModuleToSeg(mod: any, moduleName: any) {
        if (!utils.isObject(mod)) throw new Error(`The module '${moduleName}' must export an object!`);

        let foundSegKey = false;

        for (const exportKey in mod) {
            if (mod.hasOwnProperty(exportKey)) {
                validateExportKey(exportKey);

                foundSegKey = true;
                let exportedVal = mod[exportKey];

                let m: any = exportKey.match(EXPORT_KEY_REGEX);
                utils.must(!!m);
                let segmentKey = m[1];
                let name = m[2];

                let dependencies = utils.isFunction(exportedVal) ? invokers.getParamNames(exportedVal) : [];

                let segment = {
                    name,
                    moduleName,
                    dependencies,
                    exported: exportedVal,
                };

                this._getSegs(segmentKey).push(segment);

                if (segmentKey === MEMBER) {
                    validateMemberSegmentName(name);
                    let targetName = name.split('.')[0];
                    this._getMemberSegs(targetName).push(segment);
                }
            }
        }

        if (!foundSegKey) throw new Error(`The module '${moduleName}' must export at least one segment!`);
    }

    _getSegs(segmentKey: any) {
        return this._segmentsByKey[segmentKey] = this._segmentsByKey[segmentKey] || [];
    }

    _getMemberSegs(targetName: any) {
        return this._memberSegmentsByTarget[targetName] = this._memberSegmentsByTarget[targetName] || [];
    }

    _init() {
        if (this._useMocks) {
            this._initComponents(this._segmentsByKey[MOCK] || [], false);
        }

        this._initComponents(this._segmentsByKey[SINGLETON] || [], true);

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

    _initComponents(segments: any, real: any) {
        for (const segment of segments) {

            const name = segment.name;
            const comp = segment.exported;

            segment.real = real;

            if (real) {
                if ((name in this._components) || (name in this._factories)) {
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

                segment.value = comp;
            }
        }
    }

    _createGetterWithCaching(targetName: any) {
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

    _findDependencyWithTracking(name: any) {
        this._depInfo.enter(name);

        try {
            return this._findDependency(name);

        } finally {
            this._depInfo.leave(name);
        }
    }

    // must be called through _findDependencyWithTracking()
    _findDependency(name: any) {
        let isOptional = name.endsWith(OPTIONAL_SUFFIX);
        if (isOptional) name = name.substring(0, name.length - OPTIONAL_SUFFIX.length);

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

        if (isOptional) {
            return undefined;
        } else {
            const chain = this._depInfo.getChain();
            throw new Error(`Cannot find dependency '${name}' (dependency chain: ${chain})`);
        }
    }

    _produceComponent(name: any) {
        const factory = this._factories[name];
        if (!factory) throw new Error(`The factory '${name}' doesn't exist!`);

        const chain = this._depInfo.getChain();
        debug(`Creating component '${name}' (dependency chain: ${chain})`);

        const comp = this._produce(factory);
        this._components[name] = comp;

        const segment = this._segments[name];
        segment.value = comp;

        return comp;
    }

    _produceMock(name: any) {
        const factory = this._mockFactories[name];
        if (!factory) throw new Error(`The mock factory '${name}' doesn't exist!`);

        const chain = this._depInfo.getChain();
        debug(`Creating mock '${name}' (dependency chain: ${chain})`);

        const mock = this._produce(factory);
        this._mocks[name] = mock;

        const segment = this._segments[name];
        segment.value = mock;

        return mock;
    }

    _produce(factory: any) {
        return invokers.invoke(factory, (name: any) => this._findDependencyWithTracking(name));
    }

    _isInitialized(segment: any) {
        return ('value' in segment);
    }

    _initSegment(segment: any) {
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

    _importGroup(groupName: any, segmentKey?: string) {
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

    _importMembers(segments: any) {
        debug(`Importing ${segments.length} members`);

        const pendingSegments = segments.filter((s: any) => !this._isInitialized(s));

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

    getDependency(name: any) {
        return this._findDependencyWithTracking(name);
    }

    getSegments(segmentKey: any) {
        validateSegmentKey(segmentKey);
        return this._segmentsByKey[segmentKey];
    }

    getGroup(name: any) {
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
            mocks: Object.keys(this._mocks),
            factories: Object.keys(this._factories),
            mockFactories: Object.keys(this._mockFactories),
            groups: Object.keys(this._groups),
            getters: Object.keys(this._getters),
        };
    }

    execute(func: any) {
        invokers.invoke(func, (name: any) => this._findDependencyWithTracking(name));
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
