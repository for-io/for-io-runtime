const express = require('express');

const router = express.Router();
router.get('/hello2', (req, res) => res.send({ msg: `Hello, ${req.query.name}!` }))

module.exports = {
    router, // providing custom router with additional routes
    dir: __dirname,
    moduleNames: { src: ['./custom-hello'] }
};