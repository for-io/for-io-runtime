const { runTest } = require('../../apidiligence');

const apiMod = {
    _$API_() {
        return { hello: (foo) => foo };
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

const routes = [{ name: "hello", verb: "GET", path: "/hello" }];

const error = jest.fn(() => { });

const loggerMod = {
    _$COMPONENTS_: {
        logger: () => ({ error }),
    },
};

function onDone() {
    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('Caught exception:', new RangeError("Maximum call stack size exceeded"));
}

const testSetup = { modules: { apiMod, loggerMod, circProvider }, routes, onDone, db: false, dir: __dirname };

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