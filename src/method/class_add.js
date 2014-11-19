
AS.container.set('class.add', function(options) {

    AS.assertTrue(options, ['class', 'target'], 'class.add');

    var $target = AS.assertSelector(options.target, 'class.add empty target');

    $target.addClass(options.class);

    return $target.length;
});
