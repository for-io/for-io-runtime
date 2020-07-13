const { runTest } = require('../../apidiligence');

const apiMod = {
    _$API_() {
        return { hello: (foo) => foo };
    },

    _$ROUTES_: {
        hello: { verb: "GET", path: "/hello" },
    },
};

const circProvider = {
    _$PROVIDERS_() {
        return {
            foo: (bar) => bar + 'x',
            bar: (foo) => foo + 'y',
        };
    }
}

const error = jest.fn(() => { });

const loggerMod = {
    _$COMPONENTS_: {
        logger: () => ({ error }),
    },
};

function onDone() {
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('Caught exception:', new Error("Detected circular dependency: foo -> bar -> foo"));
}

const testSetup = { modules: { apiMod, loggerMod, circProvider }, onDone, db: false, dir: __dirname };

runTest({
    name: 'circular provider dependencies',
    config: {
        useMocks: false,
        JWT_SECRET: 'jwt_secret'
    },
    cases: [{
        name: 'should fail on circular provider dependencies',
        requests: [{
            request: {
                method: 'GET',
                url: '/hello?name=spock',
            },
            response: {
                status: 500,
                body: {
                    status: 'Internal Server Error',
                }
            },
        }],
    }],
}, testSetup);