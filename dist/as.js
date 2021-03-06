(function(window, $) {

    var AS = window.AS = {};

    AS.debug = false;

    AS.container = {
        _actions: {},
        _listeners: {},
        _bindListeners: []
    };

    AS.container.set = function(name, fn, scope) {
        AS.log({
            msg: 'AS - container - set',
            name: name,
            fn: fn,
            scope: scope
        });
        AS.container._actions[name] = {
            fn: fn,
            scope: scope ? scope : null
        };
    };

    AS.container.remove = function(name) {
        AS.log({
            msg: 'AS - container - remove',
            name: name
        });
        delete AS.container._actions[name];
    };

    AS.container.call = function(name, options) {
        var scope, result;

        AS.log({
            msg: 'AS - container - call',
            name: name,
            options: options
        });

        if (AS.container._actions[name] &&
            typeof AS.container._actions[name].fn &&
            typeof AS.container._actions[name].fn.apply == 'function'
        ) {
            scope = AS.container._actions[name].scope ? AS.container._actions[name].scope : null;

            if (scope) {
                result = AS.container._actions[name].fn.apply(scope, [options]);
            } else {
                result = AS.container._actions[name].fn(options);
            }

            AS.log({
                msg: 'AS - container - call - result',
                name: name,
                result: result,
                options: options
            });

            return result;
        }
    };

    AS.container.getEventListeners = function(eventName) {
        return typeof AS.container._listeners[eventName] != 'undefined'
            ? AS.container._listeners[eventName]
            : [];
    };

    AS.container.addBindListener = function(callback) {
        AS.container._bindListeners.push(callback);
    };

    AS.container.callBindListeners = function(root) {
        var r = root;
        $.each(AS.container._bindListeners, function() {
            this(r);
        })
    };

    AS.log = function() {
        if (AS.debug) {
            console.log(arguments);
        }
    };

    AS.execute = function(dom, cmd, domEvent, result) {
        var $dom = $(dom).first(),
            fn, options, tmp, obj;
        if (cmd == null || typeof cmd == 'undefined') {
            cmd = {};
        }
        if (typeof cmd == 'string') {
            tmp = {};
            tmp[cmd] = null;
            cmd = tmp;
        }
        AS.log({
            msg: 'AS - execute - start',
            dom: dom,
            cmd: cmd
        });
        for (fn in cmd) {
            if (cmd.hasOwnProperty(fn)) {
                obj = cmd[fn];
                if (typeof obj == 'object') {
                    options = $.extend(true, {}, obj);
                } else {
                    options = { result: obj };
                }
                options = options ? options : {};
                options.dom = $dom.get(0);
                options.$dom = $dom;
                options.domEvent = domEvent;
                options.result = options.result ? options.result : result;
                result = AS.container.call(fn, options);
            }
        }

        return result;
    };

    AS.bind = function(root, reset) {
        var $root = root ? $(root) : $('body');
        AS.container.callBindListeners($root);
        $root.find('[data-as]').each(function() {
            var $dom = $(this),
                index = $dom.data('asIndex'),
                stopPropagation = $dom.data('asStopPropagation'),
                preventDefault = $dom.data('asPreventDefault'),
                data = $dom.data('as'),
                eventName, cmd, listenerAdded
            ;

            if (typeof data != 'object') {
                throw new SyntaxError('data-as must be an object');
            }

            index = index ? index : {};
            stopPropagation = typeof stopPropagation == 'undefined' ? true : stopPropagation;
            preventDefault = typeof preventDefault == 'undefined' ? true : preventDefault;

            for (eventName in data) {
                if (data.hasOwnProperty(eventName)) {
                    if (typeof AS.container._listeners[eventName] == 'undefined') {
                        AS.container._listeners[eventName] = [];
                    }
                    listenerAdded = false;
                    $(AS.container._listeners[eventName]).each(function() {
                        if (this == $dom.get(0)) {
                            listenerAdded = true;
                            return false;
                        }
                    });
                    if (!listenerAdded) {
                        AS.container._listeners[eventName].push($dom.get(0));
                    }

                    cmd = data[eventName];

                    if (reset) {
                        $dom.off(eventName);
                    } else {
                        if (index[eventName]) {
                            return;
                        }
                    }

                    index[eventName] = 1;
                    $dom.data('asIndex', index);

                    $dom.on(eventName, (function(c) {
                        return function(e) {
                            if (stopPropagation) {
                                e.stopPropagation();
                            }
                            if (preventDefault) {
                                e.preventDefault();
                            }
                            AS.execute($dom, c, e);
                        }
                    })(cmd));

                }
            }
        });
    };

    AS.prepareOptions = function(options, spec) {
        var name, value, i = 0, altName;
        for (name in spec) {
            if (spec.hasOwnProperty(name)) {
                value = options[name];

                while (typeof value == 'undefined') {
                    altName = spec[name][i++];
                    value = options[altName];
                }

                if (typeof value != 'undefined') {
                    options[name] = value;
                }
            }
        }
    };

    AS.assertTrue = function(options, names, origin) {
        var i, name;
        for (i in names) {
            if (names.hasOwnProperty(i)) {
                name = names[i];
                if (!options[name]) {
                    throw new SyntaxError(origin + ' not allowed null option "' + name + '"');
                }
            }
        }
    };

    AS.assertDefined = function(options, names, origin) {
        var i, name;
        for (i in names) {
            if (names.hasOwnProperty(i)) {
                name = names[i];
                if (typeof options[name] == 'undefined') {
                    throw new SyntaxError(origin + ' not allowed undefined option ' + name);
                }
            }
        }
    };

    AS.assertSelector = function(selector, msg) {
        var jq = $(selector);

        if (jq.length == 0) {
            throw new SyntaxError(msg);
        }

        return jq;
    };

})(window, jQuery);


$(function() {
    function xReload(xhr) {
        var value = xhr.getResponseHeader('X-AS-Reload');
        if (value) {
            value = parseInt(value, 10);
            if (value && value > 0) {
                if (typeof $.blockUI == 'function') {
                    $.blockUI();
                }
                setTimeout(function() {
                    window.location.reload()
                }, value);
            }
        }
    }

    function xExecute(xhr) {
        var header = xhr.getResponseHeader('X-AS-Execute'),
            json = header ? JSON.parse(header) : null
            ;
        json = typeof json == 'string' ? [json] : json;
        $(json).each(function(index, value) {
            if (typeof value.dom != 'undefined' && value.cmd != 'undefined') {
                AS.execute(value.dom, value.cmd, $.Event('click'));
            }
        });
    }

    function xTrigger(xhr) {
        var header = xhr.getResponseHeader('X-AS-Trigger'),
            json = header ? JSON.parse(header) : null
            ;
        json = typeof json == 'string' ? [json] : json;
        $(json).each(function(index, value) {
            if (typeof value.event != 'undefined') {
                AS.execute('body', {
                    trigger: {
                        event: value.event,
                        selector: value.selector
                    }
                }, $.Event('click'));
            }
        });
    }

    $(document).ajaxComplete(function(event, xhr, options) {
        xReload(xhr);
        xExecute(xhr);
        xTrigger(xhr);
    });

});


AS.container.addBindListener(function(root) {
    $(root).find('form[data-ajax-form]').each(function() {
        var _this = this,
            $form = $(_this),
            options = $form.data('dataAjaxForm'),
            $parent = $form.parent(),
            beforeSubmit, success
        ;
        if (!options) {
            options = {
                target: $form,
                replaceTarget: true
            };
        }

        beforeSubmit = options.beforeSubmit;
        success = options.success;

        options.beforeSubmit = function() {
            if (typeof $.blockUI == 'function') {
                $.blockUI();
            }
            if (beforeSubmit) {
                beforeSubmit.apply(this, arguments);
            }
        };

        options.success = function(responseText, statusText, xhr, jqForm) {
            AS.bind($parent);
            if (typeof $.unblockUI == 'function') {
                $.unblockUI();
            }
            if (typeof success == 'function') {
                success.apply(this, arguments);
            } else if (typeof success == 'object') {
                AS.execute(jqForm, success);
            }
        };

        setTimeout(function() {
            $form.ajaxForm(options);
        }, 100);
    });
});

AS.container.set('ajax.submit', function(options) {

    var $form, opt, $target, $block, blockOptions, $parent;

    AS.ajaxSubmit = {
        setDefaultButton: function(frm, btn) {
            var $frm = $(frm).first(),
                $btn = $(btn).first();

            $frm.on('submit', function(e) {
                var $frm = $(this);
                if (!$frm.data('asSubmit')) {
                    e.preventDefault();
                    e.stopPropagation();
                    setTimeout(function() {
                        $btn.click();
                    }, 20);
                    return false;
                }
            })
        }
    };

    if (options.form) {
        $form = $(options.form);
    } else {
        $form = options.$dom.closest('form');
    }

    if (!$form || !$form.length) {
        throw new SyntaxError('No form for ajax.submit');
    }

    $form = $form.first();

    $form.data('asSubmit', true);

    opt = typeof 'options.options' == 'object' ? options.options : {
        target: $form,
        replaceTarget: true
    };

    if (options.block) {
        if (options.block === true && typeof $.blockUI == 'function') {
            $.blockUI(options.blockOptions);
        } else if (options.block == '$target') {
            $block = $target;
        } else {
            $block = $(options.block);
        }
        if ($block && typeof $block.block == 'function') {
            $block.block(options.blockOptions)
        }
    }

    $target = $(opt.target);
    $parent = $target.parent();

    opt.success = function(response, statusText, jqXHR, jqForm) {
        AS.bind($parent);
        if (typeof $form.unblock == 'function') {
            $form.unblock();
        }
        if (options.block && typeof $.unblockUI == 'function') {
            $.unblockUI();
        }
        if ($block && typeof $block.unblock == 'function') {
            $block.unblock();
        }

        if (options.success) {
            AS.execute(options.dom, options.success, null, jqForm);
        }
    };

    $form.ajaxSubmit(opt);
});


AS.container.set('block', function(options) {
    var $target;

    if (typeof options.target != 'undefined') {
        $target = $(options.target);
        if (typeof $target.block == 'function') {
            $target.block(options.options);
        }
    } else {
        if (typeof $.blockUI == 'function') {
            $.blockUI();
        }
    }
});


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
    if (options.title) {
        $modal.find('.modal-title').html(options.title);
    }
    if (options.body) {
        $modal.find('.modal-body').html(options.body);
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


AS.container.set('bs.modal.hide', function(options) {
    AS.assertTrue(options, ['selector'], 'bs.modal.close');

    $(options.selector).modal('hide');
});


AS.container.set('bs.modal.load', function(options) {

    AS.assertTrue(options, ['url'], 'bs.modal.load');

    var arg = $.extend(true, {}, options);
    if (typeof arg.success == 'undefined') {
        arg.success = {};
    }
    arg.success.html = {
        success: {
            'bs.modal.show': null
        }
    };

    AS.execute(options.dom, {
        load: arg
    }, options.domEvent);

});


AS.container.set('bs.modal.show', function(options) {

    if (!options.target) {
        options.target = $(options.dom);
    }

    var $modal = $(options.target);

    if ($modal.length == 0) {
        throw new SyntaxError('bs.modal.show missing content or not html');
    }

    AS.bind($modal);

    if (typeof $modal.modal != 'function') {
        throw new SyntaxError('bs.modal.show missing modal function - bootstrap not loaded?');
    }

    if ($modal.closest('body').length == 0) {
        $('body').append($modal);
    }

    $modal.modal('show');

    if (options.removeOnClose || typeof options.removeOnClose == 'undefined') {
        $modal.on('hidden.bs.modal', function() {
            $(this).remove();
        });
    }
});


AS.container.set('class.add', function(options) {

    AS.assertTrue(options, ['class', 'target'], 'class.add');

    var $target = AS.assertSelector(options.target, 'class.add empty target');

    $target.addClass(options.class);

    if (options.success) {
        AS.execute(options.dom, options.success);
    }

    return $target.length;
});


AS.container.set('class.has', function(options) {

    AS.assertTrue(options, ['class', 'target'], 'class.add');

    var $target = AS.assertSelector(options.target, 'class.add empty target');

    return $target.hasClass(options.class);
});


AS.container.set('class.remove', function(options) {

    AS.assertTrue(options, ['class', 'target'], 'class.add');

    var $target = AS.assertSelector(options.target, 'class.add empty target');

    $target.removeClass(options.class);

    if (options.success) {
        AS.execute(options.dom, options.success);
    }

    return $target.length;
});


AS.container.set('class.toggle', function(options) {

    AS.assertTrue(options, ['target'], 'class.toggle');
    AS.assertDefined(options, ['class'], 'class.toggle');

    var $target = AS.assertSelector(options.target, 'class.toggle empty target'),
        $parent, $children, result
        ;

    if (options.parent) {
        $parent = options.parent === true ? $target.parent() : $(options.parent);
        $children = options.children ? $parent.find(options.children) : $parent.children();
        $children.removeClass(options.class);
        $target.addClass(options.class);
    } else {
        $target.toggleClass(options.class);
    }

    return $target;
});


AS.container.set('data.set', function(options) {
    AS.assertTrue(options, ['data'], 'data.set');

    var $dom = options.selector ? $(options.selector) : options.$dom,
        name, value
        ;

    if (typeof options.data != 'object') {
        throw new SyntaxError('data.set option.data must be an object');
    }

    for (name in options.data) {
        if (options.data.hasOwnProperty(name)) {
            value = options.data[name];
            $dom.data(name, value);
        }
    }
});


AS.container.set('eval', function(options) {

    AS.assertTrue(options.exp);

    return eval(options.exp);

});


AS.container.set('fade', function(options) {

    AS.assertTrue(options, ['type'], 'fade');

    if (options.type != 'in' && options.type != 'out') {
        throw new SyntaxError('Fade type must be in or out');
    }

    if (typeof options.target == 'undefined') {
        options.target = options.dom;
    }
    if (typeof options.duration == 'undefined') {
        options.duration = 300;
    }

    var oldComplete = options.complete,
        type = options.type,
        $target
    ;

    delete options.type;

    options.complete = function() {
        AS.log({
            msg: 'AS - fadeIn - complete',
            options: options
        });
        if (oldComplete) {
            AS.execute(options.dom, oldComplete);
        }
    };

    $target = AS.assertSelector(options.target, 'fade empty target');

    if (type == 'in') {
        $target.fadeIn(options);
    } else {
        $target.fadeOut(options);
    }
});

AS.container.set('fadeIn', function(options) {

    options.type = 'in';
    AS.execute(options.dom, {
        fade: options
    }, options.domEvent);

});

AS.container.set('fadeOut', function(options) {

    options.type = 'out';
    AS.execute(options.dom, {
        fade: options
    }, options.domEvent);

});


AS.container.set('false', function(options) {

    return false;

});


AS.container.set('html', function(options) {
    AS.assertDefined(options, ['result']);

    var html = typeof options.result == 'object' ? options.result.body : options.result,
        $result,
        $target
    ;

    if (html.trim().indexOf('<') != 0) {
        html = '<span>' + html + '</span>';
    }
    $result = $(html);

    if (options.target) {
        $target = $(options.target);
    } else {
        $target = $('body');
        options.append = true;
    }

    if ($result.length == 0) {
        throw new SyntaxError('html not valid - must be enclosed in an html tag')
    }

    if (options.append) {
        $target.append($result);
    } else {
        $target.html($result);
    }
    AS.bind($target);

    if (options.success) {
        AS.execute($result, options.success);
    }
    if (options.complete) {
        AS.execute($result, options.complete);
    }

});


AS.container.set('if', function(options) {

    AS.assertTrue(options, ['arg'], 'if');

    options.then = typeof options.then == 'undefined' ? {} : options.then;
    options.else = typeof options.else == 'undefined' ? {} : options.else;

    var target = AS.execute(options.dom, options.arg)
        ? options.then
        : options.else
    ;

    return AS.execute(options.dom, target);

});


AS.container.set('load', function(options) {
    AS.assertTrue(options, ['url'], 'load');

    var ajaxOptions = options.ajaxOptions || {},
        blockOptions, $block,
        name, method, selector, args, $jq, m, value,
        buffer, timer, $dom
    ;

    AS.log({
        msg: 'AS - load',
        options: options
    });

    if (options.block) {
        AS.log({
            msg: 'AS - load - block',
            block: options.block
        });
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

    if (options.data) {
        ajaxOptions.data = ajaxOptions.data || {};
        for (name in options.data) {
            if (options.data.hasOwnProperty(name)) {
                selector = options.data[name][0];
                method = options.data[name][1];
                args = options.data[name][2] || [];
                $jq = $(selector);
                m = $jq[method];
                if (!m) {
                    throw new SyntaxError('jQuery of selector "' + selector + '" does not have a method "' + method + '"');
                }
                value = m.apply($jq, args);
                ajaxOptions.data[name] = value;
                AS.log({
                    msg: 'AS - load - data',
                    selector: selector,
                    method: method,
                    args: args,
                    value: value
                })
            }
        }
    }

    ajaxOptions.success = function(data) {
        AS.log({
            msg: 'AS - load - success',
            options: options,
            data: data
        });
        if (options.success) {
            AS.execute(options.dom, options.success, null, data);
        }
    };

    ajaxOptions.complete = function() {
        AS.log({
            msg: 'AS - load - complete',
            options: options
        });
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

    ajaxOptions.error = function(jqXHR, textStatus, errorThrown) {
        AS.log({
            msg: 'AS - load - error',
            textStatus: textStatus,
            errorThrown: errorThrown,
            jqXHR: jqXHR,
            options: options
        });
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


AS.container.set('preventDefault', function(options) {
    if (options.domEvent && typeof option.domEvent.preventDefault == 'function') {
        option.domEvent.preventDefault();
    }
});


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


AS.container.set('stopPropagation', function(options) {
    if (options.domEvent && typeof option.domEvent.stopPropagation == 'function') {
        option.domEvent.stopPropagation();
    }
});


AS.container.set('trigger', function(options) {

    AS.assertTrue(options, ['event'], 'trigger');

    var $obj, arr;

    if (options.selector) {
        $obj = $(options.selector);
        $obj.trigger(options.event);
        return $obj.length;
    } else {
        arr = AS.container.getEventListeners(options.event);
        $(arr).each(function() {
            $(this).trigger(options.event);
        });
    }

});


AS.container.set('true', function(options) {

    return true;

});


AS.bind();
