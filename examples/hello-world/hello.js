const { App } = require("../../src");

App.addEndpoint({ name: 'hello' }, {
    verb: 'GET',
    path: '/hello',
    controller(name) {
        return { msg: `Hello, ${name}!` };
    },
})
