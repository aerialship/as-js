Load function
=============

Options
-------

 * url - required, string, url to load content from
 * success - optional, object, functions to execute on successful load. ```dom``` option is same as for load, and ```result``` option is loaded content
 * complete - optional, object, functions to execute on completed load, successfully or with error. ```dom``` option is same as for load.
 * error - optional, object, functions to execute on error. ```dom``` option is same as for load


Example HTML
------------

``` html
<button type="button" data-as='{
    "click": {
        "load": {
            "url": "http://example.com/data.json",
            "success": {
                "some.function": { }
            }
        }
    }
}'>Load it</button>
```

Example javascript
------------------

``` js
AS.execute($('#dom', {
    load: {
        url: "http://example.com/data.json",
            success: {
                function(options) {
                    console.log(options);
                }
            }
        }

});
```
