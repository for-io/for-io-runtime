const { runTest } = require('../../apidiligence');

const helloApi = {
    _$API_() {
        return { hello: (name) => ({ msg: `Hello, ${name}!` }) };
    },

    _$ROUTES_: {
        hello: { verb: "GET", path: "/hello" },
    },
};

const nameProvider = {
    _$PROVIDERS_() {
        return { name: (query) => query.name.toUpperCase() };
    }
}

const testSetup = { modules: { helloApi, nameProvider }, db: false, dir: __dirname };

runTest({
    name: 'simple provider',
    config: {
        useMocks: false,
        JWT_SECRET: 'jwt_secret'
    },
    cases: [{
        name: 'say hello',
        requests: [{
            request: {
                method: 'GET',
                url: '/hello?name=spock',
            },
            response: {
                status: 200,
                body: {
                    msg: 'Hello, SPOCK!',
                }
            },
        }],
    }],
}, testSetup);