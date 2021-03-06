'use strict';

/**
 * @ngdoc function
 * @name ortolangMarketApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the ortolangMarketApp
 */
angular.module('ortolangMarketApp')
    .controller('HomeCtrl', ['$scope', 'SearchProvider', 'StaticWebsite', 'StatisticsResource',
        function ($scope, SearchProvider, StaticWebsite, StatisticsResource) {

            StatisticsResource.get({name: 'core.workspaces.all'}, function (data) {
                var last = data.values.pop();
                $scope.statistics.workspaceNumber = last[1];
            });

            StatisticsResource.get({name: 'membership.profiles.all'}, function (data) {
                var last = data.values.pop();
                $scope.statistics.profileNumber = last[1];
            });

            StatisticsResource.get({name: 'binary-store.size'}, function (data) {
                var last = data.values.pop();
                $scope.statistics.binaryStoreSize = last[1];
            });

            function initScopeVariables() {
                $scope.statistics = {};
                $scope.StaticWebsite = StaticWebsite;
                $scope.staticWebsiteBase = StaticWebsite.getStaticWebsiteBase();
            }

            function init() {
                initScopeVariables();
                $scope.searchRecents = SearchProvider.make();
                $scope.searchRecents.setActiveOrderProp('rank', false);
                var metaLatestSnapshotPrefix = 'ortolang-workspace-json.latestSnapshot.';
                var metaItemPrefix = 'ortolang-workspace-json.latestSnapshot.meta_ortolang-item-json.';
                var metaWorkspacePrefix = 'ortolang-workspace-json.latestSnapshot.meta_ortolang-workspace-json.';
                var metaRatingPrefix = 'ortolang-workspace-json.latestSnapshot.meta_system-rating-json.';
                $scope.paramsRecents = '{"' + metaItemPrefix + 'title":"", "' +
                    metaRatingPrefix + 'score":"4", "fields":"' +
                    metaLatestSnapshotPrefix + 'key,' +
                    metaRatingPrefix + 'score:rank,' +
                    metaRatingPrefix + '.esrAccessibility,' +
                    metaItemPrefix + 'title,' +
                    metaItemPrefix + 'type,' +
                    metaItemPrefix + 'image,' +
                    metaItemPrefix + 'publicationDate,' +
                    metaWorkspacePrefix + 'wskey,' +
                    metaWorkspacePrefix + 'wsalias,' +
                    metaWorkspacePrefix + 'snapshotName","limit":"15", "orderProp":"rank", "orderDir":"desc"}';
            }
            init();

        }]);
