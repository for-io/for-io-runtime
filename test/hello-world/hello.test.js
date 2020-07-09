const { runTest } = require('../../apidiligence');

const modules = {
    hello: require('./hello')
};

const routes = require('./hello-routes');

const testSetup = { modules, routes, dir: __dirname };

const test = {
    name: 'hello',
    config: {
        useMocks: false,
        JWT_SECRET: 'jwt_secret'
    },
    precondition: {},
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
                    msg: 'Hello, spock!',
                }
            },
        }],
    }],
};

runTest(test, testSetup);