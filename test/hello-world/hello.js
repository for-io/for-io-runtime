exports._$API_ = () => {

    function helloWorld(query) {
        return { msg: `Hello, ${query.name}!` };
    }

    return { helloWorld };

};
