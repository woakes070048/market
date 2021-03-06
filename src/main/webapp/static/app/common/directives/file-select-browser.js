'use strict';

/**
 * @ngdoc directive
 * @name ortolangMarketApp.directive:fileSelectBrowser
 * @description
 * # fileSelectBrowser
 * Directive of the ortolangMarketApp
 */
angular.module('ortolangMarketApp')
    .directive('fileSelectBrowser', ['$filter', 'FileSelectBrowserService', 'WorkspaceResource', 'Settings', function ($filter, FileSelectBrowserService, WorkspaceResource, Settings) {

        function initWorkspace(workspace, scope) {
            FileSelectBrowserService.workspace = workspace;
            scope.$broadcast('initWorkspaceVariables');
        }

        return {
            restrict: 'A',
            scope: {
                forceMimeTypes: '=?',
                forceWorkspace: '=',
                path: '=?forcePath',
                forceHead: '=?',
                fileSelectId: '=',
                hideElements: '=?',
                fileSelectAcceptMultiple: '=acceptMultiple',
                icons: '='
            },
            templateUrl: 'common/directives/browser.html',
            link: {
                pre : function (scope) {
                    scope.isFileSelectBrowserService = true;
                    var workspaceListDeferred = WorkspaceResource.get(),
                        workspace;
                    scope.browserSettings = Settings[FileSelectBrowserService.id];
                    workspaceListDeferred.$promise.then(function (data) {
                        scope.workspaceList = data.entries;
                        if (scope.browserSettings.wskey || scope.forceWorkspace) {
                            var key = scope.forceWorkspace || scope.browserSettings.wskey,
                                filteredWorkspace = $filter('filter')(data.entries, {key: key}, true);
                            if (filteredWorkspace.length !== 1) {
                                WorkspaceResource.get({wskey: key}, function (response) {
                                    workspace = response;
                                    initWorkspace(workspace, scope);
                                }, function () {
                                    console.error('No workspace with key "%s" available', key);
                                    if (!scope.forceWorkspace) {
                                        workspace = data.entries[0];
                                        initWorkspace(workspace, scope);
                                    }
                                });
                                return;
                            }
                            workspace = filteredWorkspace[0];
                        } else {
                            workspace = data.entries[0];
                        }
                        if (workspace) {
                            initWorkspace(workspace, scope);
                        }
                    });
                }
            }
        };
    }]);
