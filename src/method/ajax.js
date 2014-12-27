
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

    $(document).ajaxComplete(function(event, xhr, options) {
        xReload(xhr);
    });

});
