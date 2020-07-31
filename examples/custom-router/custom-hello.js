module.exports = {
    'API hello': {
        'GET /hello'(name) {
            return { msg: `Hello, ${name}!` };
        },
    },
};