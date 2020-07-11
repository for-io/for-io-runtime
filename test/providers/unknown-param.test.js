const { runTest } = require('../../apidiligence');

const apiMod = {
    _$API_: {
        hello: (foo) => foo
    },
};

const routes = [{ name: "hello", verb: "GET", path: "/hello" }];

const error = jest.fn(() => { });

const loggerMod = {
    _$COMPONENTS_: {
        logger: () => ({ error }),
    },
};

function onDone() {
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('Caught exception:', new Error("Unknown parameter: 'foo'"));
}

const testSetup = { modules: { apiMod, loggerMod }, routes, onDone, db: false, dir: __dirname };

runTest({
    name: 'unknown param',
    config: {
        useMocks: false,
        JWT_SECRET: 'jwt_secret'
    },
    precondition: {},
    cases: [{
        name: 'should fail on unknown param "foo"',
        requests: [{
            request: {
                method: 'GET',
                url: '/hello',
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