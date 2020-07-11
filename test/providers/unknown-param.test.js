const { runTest } = require('../../apidiligence');

const helloApi = {
    _$API_() {
        return { hello: (foo) => foo };
    },
};

const routes = [{ name: "hello", verb: "GET", path: "/hello" }];

const testSetup = { modules: { helloApi }, routes, dir: __dirname };

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