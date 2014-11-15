
AS.container.set('stopPropagation', function(options) {
    if (options.event && typeof option.event.stopPropagation == 'function') {
        option.event.stopPropagation();
    }
});
