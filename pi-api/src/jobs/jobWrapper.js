module.exports = (fn) => {
    if (!global.configSuccess) {
        return;
    }
    return fn;
};
