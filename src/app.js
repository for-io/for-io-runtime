const { cloneDeep } = require("lodash");

class AppSetup {

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

    addEndpoint(opts, endpoint) {
        this._endpoints[opts.name] = wrapValueWithOpts(opts, endpoint);
    }

    addTypeDef(opts, typeDef) {
        this._typeDefs[opts.name] = wrapValueWithOpts(opts, typeDef);
    }

    addProvider(opts, provider) {
        this._providers[opts.name] = wrapValueWithOpts(opts, provider);
    }

    addComponent(opts, component) {
        this._components[opts.name] = wrapValueWithOpts(opts, component);
    }

    addComponentFactory(opts, factory) {
        this._componentFactories[opts.name] = wrapValueWithOpts(opts, factory);
    }

    addMock(opts, component) {
        this._mocks[opts.name] = wrapValueWithOpts(opts, component);
    }

    addMockFactory(opts, factory) {
        this._mockFactories[opts.name] = wrapValueWithOpts(opts, factory);
    }

    getSetup() {
        return {
            endpoints: copyOf(this._endpoints),
            typeDefs: copyOf(this._typeDefs),
            providers: copyOf(this._providers),
            components: copyOf(this._components),
            componentFactories: copyOf(this._componentFactories),
            mocks: copyOf(this._mocks),
            mockFactories: copyOf(this._mockFactories),
        };
    }

}

function wrapValueWithOpts(opts, value) {
    let obj = cloneDeep(opts);

    obj.type = obj.type || 'any';
    obj.value = value;

    return obj;
}

const App = new AppSetup();

module.exports = { App };