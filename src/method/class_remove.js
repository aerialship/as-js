
AS.container.set('class.remove', function(options) {

    AS.assertTrue(options, ['class', 'target'], 'class.add');

    var $target = AS.assertSelector(options.target, 'class.add empty target');

    $target.removeClass(options.class);

    return $target.length;
});
