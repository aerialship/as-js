
AS.container.set('bs.modal.copy.load', function(options) {

    AS.assertTrue(options, ['load'], 'bs.modal.copy.load');
    AS.assertTrue(options, ['copy'], 'bs.modal.copy.load');

    var loadOptions = $.extend(true, {}, options.load),
        copyOptions = $.extend(true, {}, options.copy)
    ;

    loadOptions.success = {
        'bs.modal.copy': copyOptions,
        html: {
            target: '#' + copyOptions.to + ' .modal-body'
        }
    };
    if (loadOptions.block == 'modal') {
        loadOptions.block = loadOptions.success.html.target;
    }

    AS.execute(options.dom, {
        load: loadOptions
    }, options.domEvent);

});
