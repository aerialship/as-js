
AS.container.set('load', function(options) {
    AS.assertTrue(options, ['url'], 'load');

    var ajaxOptions = options.options || {};

    ajaxOptions.success = function(data) {
        if (options.success) {
            AS.execute(options.dom, options.success, null, data);
        }
    };

    ajaxOptions.complete = function() {
        if (options.complete) {
            AS.execute(options.dom, options.complete);
        }
    };

    ajaxOptions.error = function() {
        if (options.error) {
            AS.execute(options.dom, options.error);
        }
    };

    $.ajax(options.url, ajaxOptions);
});
