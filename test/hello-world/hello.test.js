const { runTest } = require('../../apidiligence');

const helloApi = {
    _$API_() {
        return { helloWorld: (query) => ({ msg: `Hello, ${query.name}!` }) };
    },

    _$ROUTES_: {
        helloWorld: { verb: "GET", path: "/hello" },
    },
};

const testSetup = { modules: { helloApi }, db: false, dir: __dirname };

runTest({
    name: 'hello',
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
                    msg: 'Hello, spock!',
                }
            },
        }],
    }],
}, testSetup);