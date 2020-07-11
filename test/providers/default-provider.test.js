const { runTest } = require('../../apidiligence');

const helloApi = {
    _$API_() {
        return { hello: (name) => ({ msg: `Hello, ${name}!` }) };
    },
};

const routes = [{ name: "hello", verb: "GET", path: "/hello" }];

const testSetup = { modules: { helloApi }, routes, db: false, dir: __dirname };

runTest({
    name: 'default provider',
    config: {
        useMocks: false,
        JWT_SECRET: 'jwt_secret'
    },
    cases: [{
        name: 'should provide the value for the "name" provider ',
        requests: [{
            request: {
                method: 'GET',
                url: '/hello?name=kirk',
            },
            response: {
                status: 200,
                body: {
                    msg: 'Hello, kirk!',
                }
            },
        }],
    }],
}, testSetup);