
AS.container.set('bs.modal.load', function(options) {

    AS.assertTrue(options, ['url'], 'bs.modal.load');

    AS.execute(options.dom, {
        load: {
            url: options.url,
            success: {
                html: {
                    success: {
                        'bs.modal.show': null
                    }
                }
            }
        }
    }, options.domEvent);

});
