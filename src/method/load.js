
AS.container.set('load', function(options) {
    AS.assertTrue(options, ['url'], 'load');

    var ajaxOptions = options.ajaxOptions || {},
        blockOptions, $block,
        name, method, selector, $jq, m, value,
        buffer, timer, $dom
    ;

    if (options.block) {
        blockOptions = options.blockOptions || {};
        if (options.block == true && typeof $.blockUI == 'function') {
            $.blockUI(blockOptions);
        } else {
            $block = $(options.block);
            if ($block.length && typeof $block.block == 'function') {
                $block.block(blockOptions);
            }
        }
    }

    ajaxOptions.data = ajaxOptions.data || {};
    if (options.data) {
        for (name in options.data) {
            method = options.data[name][0];
            selector = options.data[name][1];
            $jq = $(selector);
            m = $jq[method];
            value = m.bind($jq)();
            ajaxOptions.data[name] = value;
        }
    }

    ajaxOptions.success = function(data) {
        if (options.success) {
            AS.execute(options.dom, options.success, null, data);
        }
    };

    ajaxOptions.complete = function() {
        if ($block && typeof $block.unblock == 'function') {
            $block.unblock();
        }
        if (typeof $.unblockUI == 'function') {
            $.unblockUI();
        }
        if (options.complete) {
            AS.execute(options.dom, options.complete);
        }
    };

    ajaxOptions.error = function() {
        if (options.error) {
            AS.execute(options.dom, options.error);
        }
    };

    buffer = options.buffer || 0;
    buffer = parseInt(buffer, 10);

    if (buffer < 1) {
        $.ajax(options.url, ajaxOptions);
    } else {
        $dom = options.$dom || $('body');
        timer = $dom.data('asLoadTimer');
        clearTimeout(timer);
        timer = setTimeout(function() {
            $.ajax(options.url, ajaxOptions);
        }, buffer);
        $dom.data('asLoadTimer', timer);
    }

});
