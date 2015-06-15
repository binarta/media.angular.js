angular.module('bin.media', ['i18n', 'toggle.edit.mode'])
    .directive('binVideo', ['i18n', '$sce', 'editMode', 'editModeRenderer', BinVideoDirectiveFactory]);

function BinVideoDirectiveFactory(i18n, $sce, editMode, editModeRenderer) {
    return {
        restrict: ['E', 'A'],
        scope: true,
        template: '<div class="bin-media-video-wrapper" ng-if="url">' +
        '<iframe ng-src="{{url}}" frameborder="0" allowfullscreen></iframe>' +
        '</div>' +
        '<button type="button" class="btn btn-default btn-block" ng-if="!url && editing" i18n code="media.add.video.button" read-only>{{var}}</button>',
        link: function (scope, element, attrs) {
            i18n.resolve({
                code: attrs.code,
                locale: 'default',
                default: '{}'
            }).then(function (ctx) {
                ctx = JSON.parse(ctx);
                if (ctx.yt) {
                    scope.yt = ctx.yt;
                    scope.url = createYoutubeUrl(ctx.yt);
                }
            });

            function createYoutubeUrl(args) {
                var url = 'https://www.youtube-nocookie.com/embed/' + args.id + '?rel=0';
                if (args.playerControls == false) url += '&controls=0';
                if (args.titleAndActions == false) url += '&showinfo=0';
                return $sce.trustAsResourceUrl(url);
            }

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
                    },
                    preview: function () {
                        if (rendererScope.youtubeUrl) rendererScope.yt.id = getYoutubeId(rendererScope.youtubeUrl);

                        if (rendererScope.yt.id) {
                            rendererScope.previewUrl = createYoutubeUrl(rendererScope.yt);
                            rendererScope.violation = undefined;
                        } else {
                            rendererScope.previewUrl = undefined;
                            rendererScope.violation = 'media.youtube.link.invalid';
                        }
                    },
                    submit: function () {
                        i18n.translate({
                            code: attrs.code,
                            locale: 'default',
                            translation: JSON.stringify({yt: rendererScope.yt})
                        }).then(function () {
                            scope.yt = rendererScope.yt;
                            scope.url = createYoutubeUrl(rendererScope.yt);
                            rendererScope.close();
                        });
                    },
                    remove: function () {
                        i18n.translate({
                            code: attrs.code,
                            locale: 'default',
                            translation: '{}'
                        }).then(function () {
                            scope.url = undefined;
                            scope.yt = undefined;
                            rendererScope.close();
                        });
                    }
                });

                if (scope.yt) rendererScope.yt = angular.copy(scope.yt);
                else rendererScope.yt = {titleAndActions: false};

                if(rendererScope.yt.playerControls == undefined) rendererScope.yt.playerControls = true;
                if(rendererScope.yt.titleAndActions == undefined) rendererScope.yt.titleAndActions = true;

                if (scope.url) rendererScope.previewUrl = angular.copy(scope.url);

                editModeRenderer.open({
                    template: '<form>' +
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
                    '<iframe width="100%" ng-src="{{previewUrl}}" frameborder="0" allowfullscreen></iframe>' +
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
                    '<div class="dropdown-menu-buttons">' +
                    '<hr>' +
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
            }
        }
    }
}