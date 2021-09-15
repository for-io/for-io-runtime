const { cloneDeep } = require("lodash");

export class AppSetup {
    _componentFactories: any;
    _components: any;
    _endpoints: any;
    _mockFactories: any;
    _mocks: any;
    _providers: any;
    _typeDefs: any;
    _types: any;

    constructor() {
        this.reset();
    }

    reset() {
        this._endpoints = {};
        this._types = {};
        this._providers = {};
        this._components = {};
        this._componentFactories = {};
        this._mocks = {};
        this._mockFactories = {};
    }

    addEndpoint(opts: any, endpoint: any) {
        this._endpoints[opts.name] = wrapValueWithOpts(opts, endpoint);
    }

    addTypeDef(opts: any, typeDef: any) {
        this._typeDefs[opts.name] = wrapValueWithOpts(opts, typeDef);
    }

    addProvider(opts: any, provider: any) {
        this._providers[opts.name] = wrapValueWithOpts(opts, provider);
    }

    addComponent(opts: any, component: any) {
        this._components[opts.name] = wrapValueWithOpts(opts, component);
    }

    addComponentFactory(opts: any, factory: any) {
        this._componentFactories[opts.name] = wrapValueWithOpts(opts, factory);
    }

    addMock(opts: any, component: any) {
        this._mocks[opts.name] = wrapValueWithOpts(opts, component);
    }

    addMockFactory(opts: any, factory: any) {
        this._mockFactories[opts.name] = wrapValueWithOpts(opts, factory);
    }

    getSetup() {
        return {
            endpoints: cloneDeep(this._endpoints),
            typeDefs: cloneDeep(this._typeDefs),
            providers: cloneDeep(this._providers),
            components: cloneDeep(this._components),
            componentFactories: cloneDeep(this._componentFactories),
            mocks: cloneDeep(this._mocks),
            mockFactories: cloneDeep(this._mockFactories),
        };
    }
}

function wrapValueWithOpts(opts: any, value: any) {
    let obj = cloneDeep(opts);

    obj.type = obj.type || 'any';
    obj.value = value;

    return obj;
}

export const App = new AppSetup();
