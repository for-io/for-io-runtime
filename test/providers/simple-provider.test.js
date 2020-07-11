const { runTest } = require('../../apidiligence');

const helloApi = {
    _$API_() {
        return { hello: (name) => ({ msg: `Hello, ${name}!` }) };
    },
};

const nameProvider = {
    _$PROVIDERS_() {
        return { name: (query) => query.name.toUpperCase() };
    }
}

const routes = [{ name: "hello", verb: "GET", path: "/hello" }];

const testSetup = { modules: { helloApi, nameProvider }, routes, db: false, dir: __dirname };

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