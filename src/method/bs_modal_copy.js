
AS.container.set('bs.modal.copy', function(options) {
    AS.assertTrue(options, ['from', 'to'], 'bs.modal.copy');

    var $source = $(options.from), $modal, $parent, selector;

    if ($source.length != 1) {
        throw new SyntaxError('bs.modal.copy from selector must evaluate to one element');
    }
    if (!$source.hasClass('modal')) {
        throw new SyntaxError('bs.modal.copy source element does not have modal class - is it really a modal?');
    }

    $modal = $source.clone();
    $modal.attr('id', options.to);

    if (options.parent) {
        $parent = $(options.parent);
    } else {
        $parent = $('body');
        options.append = true;
    }
    if ($parent.length != 1) {
        throw new SyntaxError('ms.modal.copy parent selector must evaluate to one element');
    }

    if (options.class) {
        for (selector in options.class) {
            $modal.find(selector).addClass(options.class[selector]);
        }
    }

    if (options.append) {
        $parent.append($modal);
    } else {
        $parent.html($modal);
    }

    AS.bind($modal);

    if (typeof $modal.modal != 'function') {
        throw new SyntaxError('bs.modal.show missing modal function - bootstrap not loaded?');
    }

    $modal.modal('show');

    if (options.removeOnClose || typeof options.removeOnClose == 'undefined') {
        $modal.on('hidden.bs.modal', function() {
            $(this).remove();
        });
    }

    return options.result;
});
