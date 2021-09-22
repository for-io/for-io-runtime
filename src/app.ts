import { forOwn, Function0, isString } from "lodash";
import { DEFAULT_SUFFIX } from "./constants";

const { cloneDeep } = require("lodash");

type AppSetupOpts = {
    name: string,
    moduleName?: string,
    asDefault?: boolean,
    type?: string,
};

type AppSetupOptsOrName = string | AppSetupOpts;

type Func = { (...args: any): any };

export type AppSetupElements = {
    endpoints: any,
    providerFactories: any,
    componentFactories: any,
    mockFactories: any,
    memberFactories: any,
    typeDefFactories: any,
};

export type AppSetupWrappedValue = {
    name: string,
    moduleName?: string,
    value: any,
    asDefault?: boolean,
    type?: string,
};

export class AppSetup {

    private _endpoints: any;
    private _componentFactories: any;
    private _mockFactories: any;
    private _providerFactories: any;
    private _memberFactories: any;
    private _typeDefFactories: any;
    private _currentModuleName?: string;

    constructor() {
        this.reset();
    }

    reset() {
        this._endpoints = {};
        this._componentFactories = {};
        this._mockFactories = {};
        this._providerFactories = {};
        this._memberFactories = {};
        this._typeDefFactories = {};
        this._currentModuleName = undefined;
    }

    setCurrentModuleName(moduleName?: string) {
        this._currentModuleName = moduleName;
    }

    addEndpoint(opts: AppSetupOptsOrName, endpoint: any) {
        this.addEndpointFactory(opts, () => endpoint);
    }

    addEndpointFactory(opts: AppSetupOptsOrName, factory: Func) {
        const item = this.wrapValueWithOpts(opts, factory);
        this._endpoints[item.name] = item;
    }

    addTypeDef(opts: AppSetupOptsOrName, typeDef: any) {
        this.addTypeDefFactory(opts, () => typeDef);
    }

    addTypeDefFactory(opts: AppSetupOptsOrName, factory: Func) {
        const item = this.wrapValueWithOpts(opts, factory);
        this._typeDefFactories[item.name] = item;
    }

    addProvider(opts: AppSetupOptsOrName, provider: Func) {
        this.addProviderFactory(opts, () => provider);
    }

    addProviderFactory(opts: AppSetupOptsOrName, factory: Func) {
        const item = this.wrapValueWithOpts(opts, factory);
        this._providerFactories[item.name] = item;
    }

    addService(opts: AppSetupOptsOrName, service: any) {
        this.addComponent(opts, service);
    }

    addServiceFactory(opts: AppSetupOptsOrName, factory: Func) {
        this.addComponentFactory(opts, factory);
    }

    addComponent(opts: AppSetupOptsOrName, component: any) {
        this.addComponentFactory(opts, () => component);
    }

    addComponentFactory(opts: AppSetupOptsOrName, factory: Func) {
        const item = this.wrapValueWithOpts(opts, factory);
        this._componentFactories[item.name] = item;
    }

    addMock(opts: AppSetupOptsOrName, mock: any) {
        this.addMockFactory(opts, () => mock);
    }

    addMockFactory(opts: AppSetupOptsOrName, factory: Func) {
        const item = this.wrapValueWithOpts(opts, factory);
        this._mockFactories[item.name] = item;
    }

    addComponents(components: any) {
        forOwn(components, (comp, name) => {
            this.addComponent({ name }, comp);
        });
    }

    addComponentFactories(factories: any) {
        forOwn(factories, (factory, name) => {
            this.addComponentFactory({ name }, factory);
        });
    }

    addMember(opts: AppSetupOptsOrName, member: any) {
        this.addMemberFactory(opts, () => member);
    }

    addMemberFactory(opts: AppSetupOptsOrName, factory: Func) {
        const item = this.wrapValueWithOpts(opts, factory);
        this._memberFactories[item.name] = item;
    }

    getElements(): AppSetupElements {
        return {
            endpoints: copyOf(this._endpoints),
            typeDefFactories: copyOf(this._typeDefFactories),
            providerFactories: copyOf(this._providerFactories),
            componentFactories: copyOf(this._componentFactories),
            mockFactories: copyOf(this._mockFactories),
            memberFactories: copyOf(this._memberFactories),
        };
    }

    wrapValueWithOpts(optsOrName: AppSetupOptsOrName, value: any) {
        let wrap: AppSetupWrappedValue;

        const moduleName = this._currentModuleName || 'provided';

        if (isString(optsOrName)) {
            wrap = { name: optsOrName, moduleName, value };

        } else {
            const name = getNameFrom(optsOrName);

            // the module name can be overwritten by the opts
            wrap = { moduleName, ...cloneDeep(optsOrName), name, value };
        }

        return wrap;
    }

    executeWithinModule(moduleName: string, fn: Function0<void>) {
        this.setCurrentModuleName(moduleName);

        try {
            fn();

        } finally {
            this.setCurrentModuleName(undefined);
        }
    }

    print() {
        console.log('App setup', this.getElements());
    }
}

function copyOf(obj: any) {
    return Object.assign({}, obj);
}

function getNameFrom(optsOrName: AppSetupOpts) {
    return optsOrName.asDefault ? `${optsOrName.name}${DEFAULT_SUFFIX}` : optsOrName.name;
}

export const App = new AppSetup();
