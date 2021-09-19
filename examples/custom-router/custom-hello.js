const { App } = require("../../src");

App.addEndpoint('GET /hello', (name) => {
    return { msg: `Hello, ${name}!` };
})
