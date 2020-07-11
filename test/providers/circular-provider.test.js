const { runTest } = require('../../apidiligence');

const helloApi = {
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

const testSetup = { modules: { helloApi, provider: circProvider }, routes, dir: __dirname };

runTest({
    name: 'circular provider dependencies',
    config: {
        useMocks: false,
        JWT_SECRET: 'jwt_secret'
    },
    precondition: {},
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