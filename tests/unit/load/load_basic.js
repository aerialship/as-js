(function($) {

    QUnit.module('load:basic');

    QUnit.asyncTest('puts loaded content to result of next call', function(assert) {
        assert.expect(2);

        var expectedResult = '<p>response</p>';

        $.mockjaxClear();

        $.mockjax({
            logging: false,
            url: 'data1.json',
            response: function() {
                assert.ok(true);
                this.responseText = expectedResult;
            }
        });

        AS.container.set('assertResult', function(options) {
            QUnit.start();
            assert.equal(options.result, expectedResult);
        });

        $('#btn1').click();

    });

    QUnit.asyncTest('buffers multiple events into one', function(assert) {
        assert.expect(2);

        var expectedResult = '<p>response</p>';

        $.mockjaxClear();

        $.mockjax({
            logging: false,
            url: 'data2.json',
            response: function() {
                assert.ok(true);
                this.responseText = expectedResult;
            }
        });

        AS.container.set('assertResult', function(options) {
            QUnit.start();
            assert.equal(options.result, expectedResult);
        });

        $('#btn2').click();
        $('#btn2').click();
        $('#btn2').click();

    });

    QUnit.asyncTest('adds data to request', function(assert) {
        assert.expect(2);

        $.mockjaxClear();

        $.mockjax({
            url: 'data3.json',
            logging: false,
            response: function(settings) {
                assert.equal(settings.data.a, "aaa");
                assert.equal(settings.data.b, "bbb");
                this.responseText = '';
                QUnit.start();
            }
        });
        $.mockjax({
            url: /.*/,
            response: function(settings) {
                assert.ok(false, 'mismatched url: '+settings.url);
            }
        });

        $('#btn3').click();

    });

    QUnit.test('calls block on body', function(assert) {
        assert.expect(2);

        $.mockjaxClear();

        $.mockjax({
            logging: false,
            url: /.*/,
            responseText: ''
        });

        $.blockUI = function() {
            assert.ok(true);
            QUnit.start();
        };

        $.unblockUI = function() {
            assert.ok(true);
            QUnit.start();
        };

        QUnit.stop();
        QUnit.stop();

        $('#btn4').click();

    });

})(jQuery);
