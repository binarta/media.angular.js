describe('bin.media', function () {

    beforeEach(module('bin.media'));

    describe('bin-video directive', function () {
        var element, html, scope, i18n, $compile, editMode, editModeRenderer, $sce, permitter, topics;

        beforeEach(inject(function ($rootScope, _$compile_, _i18n_, _editMode_, _editModeRenderer_, _$sce_,
                                    activeUserHasPermissionHelper, ngRegisterTopicHandler) {
            topics = ngRegisterTopicHandler;
            $sce = _$sce_;
            permitter = activeUserHasPermissionHelper;
            $compile = _$compile_;
            editMode = _editMode_;
            editModeRenderer = _editModeRenderer_;
            i18n = _i18n_;
            scope = $rootScope.$new();
            html = '<bin-video code="my.movie"></bin-video>';
            element = angular.element(html);
        }));

        it('register on edit mode event', function () {
            $compile(element)(scope);

            expect(topics.calls.mostRecent().args[0]).toEqual(element.isolateScope());
            expect(topics.calls.mostRecent().args[1]).toEqual('edit.mode');
        });

        it('when not in edit mode', function () {
            $compile(element)(scope);
            topics.calls.mostRecent().args[2](false);

            expect(element.isolateScope().editing).toBeFalsy();
        });

        it('when in edit mode', function () {
            $compile(element)(scope);
            topics.calls.mostRecent().args[2](true);

            expect(element.isolateScope().editing).toBeTruthy();
        });

        describe('with youtube params', function () {
            [{
                value: '',
                name: 'empty'
            }, {
                value: ' ',
                name: 'space'
            }, {
                value: 'test',
                name: 'word'
            }].forEach(function (args) {
                describe('invalid response: ' + args.name, function () {
                    beforeEach(function () {
                        i18n.resolveResponse = args.value;
                        $compile(element)(scope);
                        scope.$digest();
                    });

                    it('no url', function () {
                        expect(element.isolateScope().url).toBeUndefined();
                    });
                });
            });

            describe('default options', function () {
                beforeEach(function () {
                    i18n.resolveResponse = JSON.stringify({yt: {id: 'ytid'}});
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('check url', function () {
                    expect(element.isolateScope().url.toString()).toEqual('https://www.youtube-nocookie.com/embed/ytid?rel=0');
                });

                it('template contains embed url', function () {
                    expect(element[0].innerHTML).toContain('src="https://www.youtube-nocookie.com/embed/ytid?rel=0"');
                });
            });

            describe('vimeo support with default options', function () {
                beforeEach(function () {
                    i18n.resolveResponse = JSON.stringify({yt: {id: 'vimeoid', platform: 'vimeo'}});
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('check url', function () {
                    expect(element.isolateScope().url.toString()).toEqual('https://player.vimeo.com/video/vimeoid?rel=0');
                });

                it('template contains embed url', function () {
                    expect(element[0].innerHTML).toContain('src="https://player.vimeo.com/video/vimeoid?rel=0"');
                });
            });

            describe('all options enabled', function () {
                beforeEach(function () {
                    i18n.resolveResponse = JSON.stringify({
                        yt: {
                            id: 'ytid',
                            playerControls: true,
                            titleAndActions: true
                        }
                    });
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('template contains embed url', function () {
                    expect(element[0].innerHTML).toContain('src="https://www.youtube-nocookie.com/embed/ytid?rel=0"');
                });
            });

            describe('vimeo support with all options enabled', function () {
                beforeEach(function () {
                    i18n.resolveResponse = JSON.stringify({
                        yt: {
                            id: 'vimeoid',
                            playerControls: true,
                            titleAndActions: true,
                            platform: 'vimeo'
                        }
                    });
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('template contains embed url', function () {
                    expect(element[0].innerHTML).toContain('src="https://player.vimeo.com/video/vimeoid?rel=0"');
                });
            });

            describe('all options disabled', function () {
                beforeEach(function () {
                    i18n.resolveResponse = JSON.stringify({
                        yt: {
                            id: 'ytid',
                            playerControls: false,
                            titleAndActions: false
                        }
                    });
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('template contains embed url', function () {
                    expect(element[0].innerHTML).toContain('src="https://www.youtube-nocookie.com/embed/ytid?rel=0&amp;controls=0&amp;showinfo=0"');
                });
            });

            describe('vimeo support with all options disabled', function () {
                beforeEach(function () {
                    i18n.resolveResponse = JSON.stringify({
                        yt: {
                            id: 'vimeoid',
                            playerControls: false,
                            titleAndActions: false,
                            platform: 'vimeo'
                        }
                    });
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('template contains embed url', function () {
                    expect(element[0].innerHTML).toContain('src="https://player.vimeo.com/video/vimeoid?rel=0&amp;controls=0&amp;title=0"');
                });
            });

            describe('player controls disabled', function () {
                beforeEach(function () {
                    i18n.resolveResponse = JSON.stringify({
                        yt: {
                            id: 'ytid',
                            playerControls: false
                        }
                    });
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('template contains embed url', function () {
                    expect(element[0].innerHTML).toContain('src="https://www.youtube-nocookie.com/embed/ytid?rel=0&amp;controls=0"');
                });
            });

            describe('vimeo support with player controls disabled', function () {
                beforeEach(function () {
                    i18n.resolveResponse = JSON.stringify({
                        yt: {
                            id: 'vimeoid',
                            playerControls: false,
                            platform: 'vimeo'
                        }
                    });
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('template contains embed url', function () {
                    expect(element[0].innerHTML).toContain('src="https://player.vimeo.com/video/vimeoid?rel=0&amp;controls=0"');
                });
            });

            describe('title and actions disabled', function () {
                beforeEach(function () {
                    i18n.resolveResponse = JSON.stringify({
                        yt: {
                            id: 'ytid',
                            titleAndActions: false
                        }
                    });
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('template contains embed url', function () {
                    expect(element[0].innerHTML).toContain('src="https://www.youtube-nocookie.com/embed/ytid?rel=0&amp;showinfo=0"');
                });
            });

            describe('vimeo support with title and actions disabled', function () {
                beforeEach(function () {
                    i18n.resolveResponse = JSON.stringify({
                        yt: {
                            id: 'vimeoid',
                            titleAndActions: false,
                            platform: 'vimeo'
                        }
                    });
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('template contains embed url', function () {
                    expect(element[0].innerHTML).toContain('src="https://player.vimeo.com/video/vimeoid?rel=0&amp;title=0"');
                });
            });

            describe('with legacy response with url in text', function () {
                var url;

                beforeEach(function () {
                    i18n.resolveResponse = '<p><iframe src="//www.youtube.com/embed/ytid" width="425" height="350"></iframe></p>';
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('params are on scope', function () {
                    expect(element.isolateScope().yt).toEqual({id: 'ytid'});
                });

                it('url is parsed', function () {
                    expect(element.isolateScope().url.toString()).toEqual('https://www.youtube-nocookie.com/embed/ytid?rel=0');
                });
            });

            describe('with overlay rendering mode', function () {
                beforeEach(function () {
                    html = '<bin-video code="my.movie" mode="overlay"></bin-video>';
                    element = angular.element(html);
                    i18n.resolveResponse = JSON.stringify({yt: {id: 'ytid'}});
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('check url', function () {
                    expect(element.isolateScope().url.toString()).toEqual('https://www.youtube-nocookie.com/embed/ytid?rel=0');
                });

                it('the <bin-modal"/> is used', function () {
                    expect(element[0].innerHTML).toContain('<bin-modal is-opened="status == \'viewing\'" ng-click="close()">');
                });

                it('overlay is currently collapsed', function () {
                    expect(element.isolateScope().status).toEqual('collapsed');
                });

                it('the button to open the overlay is rendered', function () {
                    expect(element[0].innerHTML).toContain('<a ng-click="view()">');
                });

                it('a helper tag is present to hook css fixes to', function () {
                    expect(element[0].innerHTML).toContain('<div class="helper">');
                });

                describe('when opening the overlay', function () {
                    beforeEach(function () {
                        element.isolateScope().view();
                    });

                    it('it is no longer collapsed', function () {
                        expect(element.isolateScope().status).toEqual('viewing');
                    });

                    it('the overlay can be closed', function () {
                        element.isolateScope().close();
                        expect(element.isolateScope().status).toEqual('collapsed');
                    });
                });
            });
        });

        describe('no previous values', function () {
            beforeEach(function () {
                $compile(element)(scope);
                scope.$digest();
            });

            it('template does not contain embed url', function () {
                expect(element[0].innerHTML).not.toContain('src');
            });

            describe('on edit renderer opened', function () {
                var rendererScope;

                beforeEach(function () {
                    editMode.bindEventSpy.onClick();
                });

                it('user has video.config.update permission', function () {
                    expect(permitter.permission).toEqual('video.config.update');
                });

                describe('and user has permission', function () {
                    beforeEach(function () {
                        permitter.yes();
                        rendererScope = editModeRenderer.openSpy.scope;
                    });

                    it('no preview url', function () {
                        expect(rendererScope.previewUrl).toBeUndefined();
                    });

                    it('set youtube options', function () {
                        expect(rendererScope.yt).toEqual({
                            playerControls: true,
                            titleAndActions: false
                        });
                    });
                });

                describe('and user has no permission', function () {
                    beforeEach(function () {
                        permitter.no();
                        rendererScope = editModeRenderer.openSpy.scope;
                    });

                    it('edit mode renderer is opened', function () {
                        expect(editModeRenderer.openSpy.template).toContain('media.video.unavailable.message');
                        expect(rendererScope.$parent).toEqual(element.isolateScope());
                    });

                    it('on close', function () {
                        rendererScope.close();

                        expect(editModeRenderer.close).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('with default youtube params', function () {
            beforeEach(function () {
                i18n.resolveResponse = JSON.stringify({yt: {id: 'ytid'}});
                $compile(element)(scope);
                scope.$digest();
            });

            it('i18n resolver is called', function () {
                expect(i18n.resolveSpy).toEqual({
                    code: 'my.movie',
                    locale: 'default',
                    default: '{}'
                });
            });

            it('put values on scope', function () {
                expect(element.isolateScope().yt).toEqual({id: 'ytid'});
                expect($sce.getTrustedResourceUrl(element.isolateScope().url)).toEqual('https://www.youtube-nocookie.com/embed/ytid?rel=0');
            });

            it('template contains embed url', function () {
                expect(element[0].innerHTML).toContain('src="https://www.youtube-nocookie.com/embed/ytid?rel=0"');
            });

            it('install editMode event binder', function () {
                expect(editMode.bindEventSpy.scope).toEqual(element.isolateScope());
                expect(editMode.bindEventSpy.element).toEqual(element);
                expect(editMode.bindEventSpy.permission).toEqual('i18n.message.add');
            });

            describe('on edit renderer opened', function () {
                var rendererScope;

                beforeEach(function () {
                    editMode.bindEventSpy.onClick();
                });

                describe('and user has permission', function () {
                    beforeEach(function () {
                        permitter.yes();
                        rendererScope = editModeRenderer.openSpy.scope;
                    });

                    it('edit mode renderer is opened', function () {
                        expect(editModeRenderer.openSpy.template).toEqual(jasmine.any(String));
                        expect(rendererScope.$parent).toEqual(element.isolateScope());
                    });

                    it('use initial url as preview url', function () {
                        expect($sce.getTrustedResourceUrl(rendererScope.previewUrl)).toEqual("https://www.youtube-nocookie.com/embed/ytid?rel=0");
                    });

                    it('set youtube params', function () {
                        expect(rendererScope.yt).toEqual({
                            id: 'ytid',
                            playerControls: true,
                            titleAndActions: true
                        });
                    });

                    describe('on preview', function () {
                        [
                            'http://youtube.googleapis.com/v/Z9loMLJ9ADg?version=3',
                            'https://www.youtube.com/watch?feature=g-vrec&v=Z9loMLJ9ADg',
                            'http://www.youtube.com/watch?feature=player_embedded&v=Z9loMLJ9ADg#',
                            'http://youtu.be/Z9loMLJ9ADg',
                            'http://www.youtube.com/watch?v=Z9loMLJ9ADg',
                            'https://www.youtube.com/watch?v=Z9loMLJ9ADg&feature=g-all-xit'
                        ].forEach(function (value) {
                            describe('with valid youtube url: ' + value, function () {
                                beforeEach(function () {
                                    rendererScope.youtubeUrl = value;
                                    editModeRenderer.openSpy.scope.preview();
                                });

                                it('filter out id', function () {
                                    expect(rendererScope.yt.id).toEqual("Z9loMLJ9ADg");
                                });

                                it('set platform', function () {
                                    expect(rendererScope.yt.platform).toEqual("youtube");
                                });

                                it('get preview url', function () {
                                    expect($sce.getTrustedResourceUrl(rendererScope.previewUrl)).toEqual("https://www.youtube-nocookie.com/embed/Z9loMLJ9ADg?rel=0");
                                });
                            });
                        });

                        describe('with invalid youtube url', function () {
                            beforeEach(function () {
                                rendererScope.youtubeUrl = "http://not.valid";
                                editModeRenderer.openSpy.scope.preview();
                            });

                            it('previewId is undefined', function () {
                                expect(rendererScope.yt.id).toBeUndefined();
                            });

                            it('previewUrl is undefined', function () {
                                expect(rendererScope.previewUrl).toBeUndefined();
                            });

                            it('put violation on scope', function () {
                                expect(rendererScope.violation).toEqual("media.youtube.link.invalid");
                            });

                            describe('and preview with valid youtube url', function () {
                                beforeEach(function () {
                                    rendererScope.youtubeUrl = "http://youtu.be/Z9loMLJ9ADg";
                                    editModeRenderer.openSpy.scope.preview();
                                });

                                it('no violation on scope', function () {
                                    expect(rendererScope.violation).toBeUndefined();
                                });
                            });
                        });

                        describe('no url', function () {
                            beforeEach(function () {
                                rendererScope.yt = {
                                    id: 'test'
                                };
                                editModeRenderer.openSpy.scope.preview();
                            });

                            it('get preview url', function () {
                                expect($sce.getTrustedResourceUrl(rendererScope.previewUrl)).toEqual("https://www.youtube-nocookie.com/embed/test?rel=0");
                            });
                        });
                    });

                    describe('on submit', function () {
                        beforeEach(function () {
                            rendererScope.yt = {
                                id: 'newId',
                                playerControls: true,
                                titleAndActions: true
                            };

                            rendererScope.submit();
                            scope.$digest();
                        });

                        it('persist with i18n', function () {
                            expect(i18n.translateSpy).toEqual({
                                code: 'my.movie',
                                locale: 'default',
                                translation: JSON.stringify({yt: rendererScope.yt})
                            });
                        });

                        it('update template embed url', function () {
                            expect(element[0].innerHTML).toContain('src="https://www.youtube-nocookie.com/embed/newId?rel=0"');
                        });

                        it('edit mode renderer is closed', function () {
                            expect(editModeRenderer.close).toHaveBeenCalled();
                        });

                        it('update scope', function () {
                            expect(element.isolateScope().yt).toEqual(rendererScope.yt);
                        });
                    });

                    describe('on remove', function () {
                        beforeEach(function () {
                            rendererScope.remove();
                            scope.$digest();
                        });

                        it('persisted message is deleted', function () {
                            expect(i18n.translateSpy).toEqual({
                                code: 'my.movie',
                                locale: 'default',
                                translation: '{}'
                            });
                        });

                        it('update template embed url', function () {
                            expect(scope.url).toBeUndefined();
                        });

                        it('template does not contain embed url', function () {
                            expect(element[0].innerHTML).not.toContain('src');
                        });

                        it('edit mode renderer is closed', function () {
                            expect(editModeRenderer.close).toHaveBeenCalled();
                        });

                        describe('with previous values', function () {
                            beforeEach(function () {
                                element.isolateScope().yt = {id: 'test'};
                                rendererScope.remove();
                                scope.$digest();
                            });

                            it('remove youtube values on scope', function () {
                                expect(element.isolateScope().yt).toBeUndefined();
                            });
                        });
                    });

                    it('on close', function () {
                        rendererScope.close();

                        expect(editModeRenderer.close).toHaveBeenCalled();
                    });
                });
            });
        });

        describe('vimeo support with default youtube params', function () {
            beforeEach(function () {
                i18n.resolveResponse = JSON.stringify({yt: {id: 'vimeoid', platform: 'vimeo'}});
                $compile(element)(scope);
                scope.$digest();
            });

            it('put values on scope', function () {
                expect(element.isolateScope().yt).toEqual({id: 'vimeoid', platform: 'vimeo'});
                expect($sce.getTrustedResourceUrl(element.isolateScope().url)).toEqual('https://player.vimeo.com/video/vimeoid?rel=0');
            });

            it('template contains embed url', function () {
                expect(element[0].innerHTML).toContain('src="https://player.vimeo.com/video/vimeoid?rel=0"');
            });

            describe('on edit renderer opened', function () {
                var rendererScope;

                beforeEach(function () {
                    editMode.bindEventSpy.onClick();
                });

                describe('and user has permission', function () {
                    beforeEach(function () {
                        permitter.yes();
                        rendererScope = editModeRenderer.openSpy.scope;
                    });

                    it('use initial url as preview url', function () {
                        expect($sce.getTrustedResourceUrl(rendererScope.previewUrl)).toEqual("https://player.vimeo.com/video/vimeoid?rel=0");
                    });

                    describe('on preview', function () {
                        [
                            'https://vimeo.com/172825105'
                        ].forEach(function (value) {
                            describe('with valid vimeo url: ' + value, function () {
                                beforeEach(function () {
                                    rendererScope.youtubeUrl = value;
                                    editModeRenderer.openSpy.scope.preview();
                                });

                                it('filter out id', function () {
                                    expect(rendererScope.yt.id).toEqual("172825105");
                                });

                                it('set platform', function () {
                                    expect(rendererScope.yt.platform).toEqual("vimeo");
                                });

                                it('get preview url', function () {
                                    expect($sce.getTrustedResourceUrl(rendererScope.previewUrl)).toEqual("https://player.vimeo.com/video/172825105?rel=0");
                                });
                            });
                        });
                    });

                    describe('on submit', function () {
                        beforeEach(function () {
                            rendererScope.yt = {
                                id: '172825105',
                                playerControls: true,
                                titleAndActions: true,
                                platform: 'vimeo'
                            };

                            rendererScope.submit();
                            scope.$digest();
                        });

                        it('update template embed url', function () {
                            expect(element[0].innerHTML).toContain('src="https://player.vimeo.com/video/172825105?rel=0"');
                        });
                    });

                    describe('on remove', function () {
                        beforeEach(function () {
                            rendererScope.remove();
                            scope.$digest();
                        });

                        it('persisted message is deleted', function () {
                            expect(i18n.translateSpy).toEqual({
                                code: 'my.movie',
                                locale: 'default',
                                translation: '{}'
                            });
                        });

                        it('update template embed url', function () {
                            expect(scope.url).toBeUndefined();
                        });

                        it('template does not contain embed url', function () {
                            expect(element[0].innerHTML).not.toContain('src');
                        });

                        it('edit mode renderer is closed', function () {
                            expect(editModeRenderer.close).toHaveBeenCalled();
                        });

                        describe('with previous values', function () {
                            beforeEach(function () {
                                element.isolateScope().yt = {id: 'test'};
                                rendererScope.remove();
                                scope.$digest();
                            });

                            it('remove youtube values on scope', function () {
                                expect(element.isolateScope().yt).toBeUndefined();
                            });
                        });
                    });

                    it('on close', function () {
                        rendererScope.close();

                        expect(editModeRenderer.close).toHaveBeenCalled();
                    });
                });
            });
        })
    });
})
;