
AS.container.set('result', function(options) {
    if (typeof options != 'object') {
        return options;
    } else if (options.result) {
        return options.result;
    } else if (options.data) {
        return options.data;
    }

    return null;
});
