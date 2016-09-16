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
            describe('default options', function () {
                beforeEach(function () {
                    i18n.resolveResponse = JSON.stringify({yt: {id: 'ytid'}});
                    $compile(element)(scope);
                    scope.$digest();
                });

                it('template contains embed url', function () {
                    expect(element[0].innerHTML).toContain('src="https://www.youtube-nocookie.com/embed/ytid?rel=0"');
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
                        ].forEach(function(value) {
                                describe('with valid youtube url: ' + value, function () {
                                    beforeEach(function () {
                                        rendererScope.youtubeUrl = value;
                                        editModeRenderer.openSpy.scope.preview();
                                    });

                                    it('filter out id', function () {
                                        expect(rendererScope.yt.id).toEqual("Z9loMLJ9ADg");
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
                                    id:'test'
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
                                id:'newId',
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
                                element.isolateScope().yt = {id:'test'};
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
    });
});