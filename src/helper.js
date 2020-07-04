const STRIP_COMMENTS_REGEX = /((\/\/.*$)|(\/\*[\S\s]*?\*\/))/mg;
const ARGUMENT_NAMES_REGEX = /([^\s,]+)/g;

module.exports = {

    isValidName(name) {
        return /^[\w_$]+$/.test(name);
    },

    getParamNames(func) {
        const fnStr = func.toString().replace(STRIP_COMMENTS_REGEX, '').trim();

        let leftParPos = fnStr.indexOf('(');
        let rightParPos = fnStr.indexOf(')');
        let arrowPos = fnStr.indexOf('=>');

        let paramsStr;

        if (arrowPos < 0 || (leftParPos >= 0 && leftParPos < rightParPos && rightParPos < arrowPos)) {
            paramsStr = fnStr.slice(leftParPos + 1, rightParPos);

        } else {
            paramsStr = fnStr.slice(0, arrowPos);
        }

        paramsStr = paramsStr.trim();

        const paramNames = paramsStr.match(ARGUMENT_NAMES_REGEX) || [];

        for (const name of paramNames) {
            if (!this.isValidName(name)) {
                throw new Error(`Invalid parameter names: '${paramsStr}'`);
            }
        }

        return paramNames;
    },

    invoke(func, argProvider, thiz) {
        if (!func) throw new Error('Invalid func: ' + func);
        if (!argProvider) throw new Error('Invalid argProvider: ' + argProvider);

        thiz = thiz || func;

        const paramNames = this.getParamNames(func);
        const args = paramNames.map(argProvider);

        return func.apply(thiz, args);
    },

    orElse(val, alternative) {
        return val !== undefined ? val : alternative;
    },

    isArray(x) {
        return Array.isArray(x);
    },

    isString(x) {
        return typeof x === 'string' || (x instanceof String);
    },

    isNumber(x) {
        return !isNaN(x - parseFloat(x));
    },

    isBoolean(x) {
        return typeof x === 'boolean' || (x instanceof Boolean);
    },

    isFunction(x) {
        let s = Object.prototype.toString.call(x);
        return s === '[object Function]' || s === '[object AsyncFunction]';
    },

    isObject(x) {
        return x !== null && (typeof x === 'object') && !Array.isArray(x);
    },

};
