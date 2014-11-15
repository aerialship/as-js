
AS.container.set('preventDefault', function(options) {
    if (options.event && typeof option.event.preventDefault == 'function') {
        option.event.preventDefault();
    }
});
