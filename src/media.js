(function () {
    angular.module('bin.media', ['i18n', 'toggle.edit.mode', 'checkpoint', 'notifications'])
        .directive('binVideo', ['i18n', '$sce', 'editMode', 'editModeRenderer', 'activeUserHasPermission', 'ngRegisterTopicHandler', BinVideoDirectiveFactory]);

    function BinVideoDirectiveFactory(i18n, $sce, editMode, editModeRenderer, activeUserHasPermission, topics) {
        return {
            restrict: 'EA',
            scope: {},
            template: '<div class="bin-media-video-wrapper" ng-if="url">' +
                '<iframe ng-if="mode == \'inline\'" ng-src="{{url}}" frameborder="0" allowfullscreen></iframe>' +
                '<div ng-if="mode == \'overlay\'">' +
                '<a ng-click="view()">' +
                '<i18n code="catalog.item.more.info.button" ng-bind="var"></i18n>' +
                '</a>' +
                '<bin-modal is-opened="status == \'viewing\'" ng-click="close()">' +
                '<div class="helper">' +
                '<iframe ng-src="{{url}}" frameborder="0" allowfullscreen></iframe>' +
                '</div>' +
                '</bin-modal>' +
                '</div>' +
                '</div>' +
                '<span ng-if="!url && editing" i18n code="media.add.video.button" read-only>{{var}}</span>',
            link: function (scope, element, attrs) {
                var legacyVideoString = '<iframe src="//www.youtube.com/embed/';
                scope.mode = attrs.mode || 'inline';
                scope.view = function () {
                    scope.status = 'viewing';
                };
                scope.close = function () {
                    scope.status = 'collapsed';
                };
                scope.close();

                i18n.resolve({
                    code: attrs.code,
                    locale: 'default',
                    default: '{}'
                }).then(function (ctx) {
                    try {
                        var video = create(JSON.parse(ctx));
                        if (video.exists) {
                            scope.yt = video.toContext();
                            scope.url = video.toUrl();
                        }
                    } catch (e) {
                        if (isLegacyVideoString(ctx)) parseLegacyVideoString(ctx);
                    }
                });

                function create(args) {
                    if (!args.yt || !args.yt.id)
                        return new NULLVideo();
                    if (args.yt.platform == 'vimeo')
                        return new VimeoVideo(args.yt);
                    return new YoutubeVideo(args.yt);
                }

                function NULLVideo() {
                }

                function YoutubeVideo(args) {
                    var self = this;

                    self.exists = true;

                    self.toContext = function () {
                        return args;
                    };

                    self.toUrl = function () {
                        return createYoutubeUrl(args);
                    }
                }

                function VimeoVideo(args) {
                    var self = this;

                    self.exists = true;

                    self.toContext = function () {
                        return args;
                    };

                    self.toUrl = function () {
                        var url = 'https://player.vimeo.com/video/' + args.id + '?rel=0';
                        if (args.playerControls == false) url += '&controls=0';
                        if (args.titleAndActions == false) url += '&title=0';
                        return $sce.trustAsResourceUrl(url);
                    }
                }

                function createYoutubeUrl(args) {
                    var url = 'https://www.youtube-nocookie.com/embed/' + args.id + '?rel=0';
                    if (args.playerControls == false) url += '&controls=0';
                    if (args.titleAndActions == false) url += '&showinfo=0';
                    return $sce.trustAsResourceUrl(url);
                }

                function isLegacyVideoString(str) {
                    return str.search(legacyVideoString) != -1;
                }

                function parseLegacyVideoString(str) {
                    var start = str.indexOf(legacyVideoString) + legacyVideoString.length;
                    var length = str.indexOf('"', start) - start;
                    var video = create({yt: {id: str.substr(start, length)}});
                    if (video.exists) {
                        scope.yt = video.toContext();
                        scope.url = video.toUrl();
                    }
                }

                topics(scope, 'edit.mode', function (editModeActive) {
                    scope.editing = editModeActive;
                });

                editMode.bindEvent({
                    scope: scope,
                    element: element,
                    permission: 'i18n.message.add',
                    onClick: open
                });

                function open() {
                    var rendererScope = angular.extend(scope.$new(), {
                        close: function () {
                            editModeRenderer.close();
                        }
                    });

                    activeUserHasPermission({
                        no: function () {
                            userHasNoPermission();
                        },
                        yes: function () {
                            userHasPermission();
                        }
                    }, 'video.config.update');


                    function userHasNoPermission() {
                        editModeRenderer.open({
                            template: '<div class="bin-menu-edit-body"><p i18n code="media.video.unavailable.message" read-only>{{var}}</p></div>' +
                                '<div class="bin-menu-edit-actions">' +
                                '<a class="btn btn-success pull-left" ng-href="{{::binartaUpgradeUri}}" target="_blank" i18n code="media.video.upgrade.button" read-only>{{var}}</a>' +
                                '<button type="reset" class="btn btn-default" ng-click="close()" i18n code="media.video.close.button" read-only>{{var}}</button>' +
                                '</div>',
                            scope: rendererScope
                        });
                    }

                    function userHasPermission() {
                        rendererScope.preview = function () {
                            if (rendererScope.youtubeUrl) {
                                rendererScope.yt.id = getYoutubeId(rendererScope.youtubeUrl);
                                rendererScope.yt.platform = 'youtube';
                            }
                            if (!rendererScope.yt.id) {
                                rendererScope.yt.id = getVimeoId(rendererScope.youtubeUrl);
                                if (rendererScope.yt.id)
                                    rendererScope.yt.platform = 'vimeo';
                            }

                            var video = create(rendererScope);
                            if (video.exists) {
                                rendererScope.previewUrl = video.toUrl();
                                rendererScope.violation = undefined;
                            } else {
                                rendererScope.previewUrl = undefined;
                                rendererScope.violation = 'media.youtube.link.invalid';
                            }
                        };

                        rendererScope.submit = function () {
                            i18n.translate({
                                code: attrs.code,
                                locale: 'default',
                                translation: JSON.stringify({yt: rendererScope.yt})
                            }).then(function () {
                                var video = create(rendererScope);
                                scope.yt = video.toContext();
                                scope.url = video.toUrl();
                                rendererScope.close();
                            });
                        };

                        rendererScope.remove = function () {
                            i18n.translate({
                                code: attrs.code,
                                locale: 'default',
                                translation: '{}'
                            }).then(function () {
                                scope.url = undefined;
                                scope.yt = undefined;
                                rendererScope.close();
                            });
                        };

                        if (scope.yt) rendererScope.yt = angular.copy(scope.yt);
                        else rendererScope.yt = {titleAndActions: false};

                        if (rendererScope.yt.playerControls == undefined) rendererScope.yt.playerControls = true;
                        if (rendererScope.yt.titleAndActions == undefined) rendererScope.yt.titleAndActions = true;

                        if (scope.url) rendererScope.previewUrl = angular.copy(scope.url);

                        editModeRenderer.open({
                            template: '<form class="bin-menu-edit-body">' +
                                '<div class="form-group">' +
                                '<label for="youtube-url" i18n code="media.youtube.link.input.label" read-only>{{var}}</label>' +
                                '<div class="input-group">' +
                                '<input type="text" id="youtube-url" class="form-control" ng-model="youtubeUrl">' +
                                '<span class="input-group-btn">' +
                                '<button type="submit" class="btn btn-success" ng-click="preview()" ng-disabled="!youtubeUrl" i18n code="media.youtube.preview.button" read-only>{{var}}</button>' +
                                '</span>' +
                                '</div>' +
                                '<div class="help-block" ng-if="violation">' +
                                '<span class="text-danger" i18n code="{{violation}}" read-only><i class="fa fa-exclamation-triangle"></i> {{var}}</span>' +
                                '</div>' +
                                '</div>' +
                                '<div class="row" ng-if="previewUrl">' +
                                '<div class="col-sm-6">' +
                                '<div class="form-group">' +
                                '<div class="bin-media-video-wrapper">' +
                                '<iframe ng-src="{{previewUrl}}" frameborder="0" allowfullscreen></iframe>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '<div class="col-sm-6">' +
                                '<div class="form-group">' +
                                '<div class="checkbox-switch">' +
                                '<input type="checkbox" id="player-controls-switch" ng-model="yt.playerControls" ng-change="preview()">' +
                                '<label for="player-controls-switch"></label>' +
                                '<span i18n code="media.youtube.show.player.controls.label" read-only>{{var}}</span>' +
                                '</div>' +
                                '</div>' +
                                '<div class="checkbox-switch">' +
                                '<div class="checkbox-switch">' +
                                '<input type="checkbox" id="title-and-actions-switch" ng-model="yt.titleAndActions" ng-change="preview()">' +
                                '<label for="title-and-actions-switch"></label>' +
                                '<span i18n code="media.youtube.show.title.and.actions.label" read-only>{{var}}</span>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '</div>' +
                                '</form>' +
                                '<div class="bin-menu-edit-actions">' +
                                '<button type="submit" class="btn btn-danger pull-left" ng-click="remove()" ng-if="url" i18n code="clerk.menu.remove.button" read-only>{{var}}</button>' +
                                '<button type="submit" class="btn btn-success" ng-click="submit()" ng-if="previewUrl" i18n code="clerk.menu.save.button" read-only>{{var}}</button>' +
                                '<button type="reset" class="btn btn-default" ng-click="close()" i18n code="clerk.menu.cancel.button" read-only>{{var}}</button>' +
                                '</div>',
                            scope: rendererScope
                        });

                        function getYoutubeId(url) {
                            var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                            var match = url.match(regExp);
                            if (match && match[2].length == 11) return match[2];
                        }

                        function getVimeoId(url) {
                            // https://vimeo.com/172825105
                            var regExp = /^.*vimeo.com\/(\d+).*/;
                            var match = url.match(regExp);
                            if (match && match[1])
                                return match[1];
                        }
                    }
                }
            }
        }
    }
})();