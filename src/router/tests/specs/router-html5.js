/**
 * Router spec for mvc html5 history
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, Router) {
    /*jshint quotmark:false*/
    if (!window.history.pushState) {
        return;
    }

    var original;

    var urlRoot;

    function getPath() {
        return new S.Uri(location.href).getPath().substring(urlRoot.length);
    }

    describe("router html5", function () {

        beforeEach(function () {
            location.hash = '';
            waits(900);
        });

        afterEach(function () {
            Router.stop();
            Router.clearRoutes();
        });

        it("works", function () {
            original = location.href;

            urlRoot = new S.Uri(location.href).resolve('./').getPath().replace(/\/$/, '');

            var ok = 0,
                ok3 = 0,
                ok4 = 0,
                ok2 = 0;

            Router.get("/detail/:id", function (req) {
                var paths = req.params;
                var query = req.query;
                expect(paths.id).toBe("9999");
                expect(query.item1).toBe("1");
                expect(query.item2).toBe("2");
                ok2++;
            });

            Router.get("/list/*path", function (req) {
                var paths = req.params;
                var query = req.query;
                expect(paths.path).toBe("what/item");
                expect(query.item1).toBe("1");
                expect(query.item2).toBe("2");
                expect(req.path).toBe('/list/what/item');
                expect(req.url).toBe('/list/what/item?item1=1&item2=2');
                ok++;
            });

            Router.get(/^\/list-(\w)$/, function (req) {
                expect(req.params[0]).toBe('t');
                ok4++;
            });

            Router.get("/*path", function (req) {
                // chrome will trigger on load
                if (req.params.path) {
                    expect(req.params.path).toBe("haha/hah2/hah3");
                    ok3++;
                }
            });

            expect(Router.matchRoute('/list/what/item')).toBeTruthy();

            expect(Router.matchRoute('/list2/what/item')).toBeTruthy();

            Router.start({
                urlRoot: new S.Uri(location.href).resolve('./').getPath(),
                useNativeHistory: 1
            });

            waits(200);

            runs(function () {
                Router.navigate("/list/what/item?item1=1&item2=2");
            });

            waits(200);

            runs(function () {
                Router.navigate("/detail/9999?item1=1&item2=2");
            });

            waits(200);

            runs(function () {
                Router.navigate("/haha/hah2/hah3");
            });

            waits(200);

            runs(function () {
                Router.navigate("/list-t");
            });

            waits(200);

            runs(function () {
                expect(ok).toBe(1);
                expect(ok2).toBe(1);
                expect(ok3).toBe(1);
                expect(ok4).toBe(1);
            });
        });

        // ie<8 can only used on event handler
        // see ../others/test-replace-history.html
        it("can replace history", function () {
            var go = 0, list = 0, detail = 0, ok = 0;

            urlRoot = new S.Uri(location.href).resolve('./').getPath().replace(/\/$/, '');
            var originalPath;
            originalPath = getPath();
            waits(200);

            runs(function () {
                S.each({
                    "/go/": function () {
                        go++;
                    },
                    "/list/": function () {
                        list++;
                    },
                    "/detail/": function () {
                        detail++;
                    }
                }, function (func, route) {
                    Router.get(route, func);
                });

                Router.start({
                    urlRoot: urlRoot,
                    useNativeHistory: 1,
                    success: function () {
                        Router.navigate("/list/");
                        ok = 1;
                    }
                });
            });

            waitsFor(function () {
                return ok;
            });

            waits(200);

            runs(function () {
                // 取代上个记录
                Router.navigate("/detail/", {
                    replaceHistory: 1
                });
            });

            waits(200);

            runs(function () {
                Router.navigate("/go/");
            });

            waits(200);

            runs(function () {
                history.back();
            });

            waits(200);

            runs(function () {
                expect(getPath()).toBe('/detail/');
            });

            waits(200);

            runs(function () {
                history.back();
            });

            waits(200);

            runs(function () {
                expect(getPath()).toBe(originalPath);
            });

            runs(function () {
                expect(go).toBe(1);
                expect(detail).toBe(2);
                expect(list).toBe(1);
                window.history.pushState({}, '', original);
            });
        });
    });
}, {
    requires: ['router']
});