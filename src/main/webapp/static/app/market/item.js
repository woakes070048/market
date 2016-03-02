'use strict';

/**
 * @ngdoc function
 * @name ortolangMarketApp.controller:ItemCtrl
 * @description
 * # ItemCtrl
 * Controller of the ortolangMarketApp
 */
angular.module('ortolangMarketApp')
    .controller('ItemCtrl', ['$scope', '$routeParams', '$location', '$route', '$filter', '$sanitize', 'SearchResource', 'MarketBrowserService', 'Helper', function ($scope, $routeParams, $location, $route, $filter, $sanitize, SearchResource, MarketBrowserService, Helper) {

        function loadItem() {
            SearchResource.findWorkspace({alias: $scope.itemAlias}, function (workspace) {
                workspace =  workspace['meta_ortolang-workspace-json'];
                $scope.tags = $filter('orderBy')(workspace.tags, function (tag) {
                    return tag.name;
                });

                if ($routeParams.version) {
                    var filteredTag = $filter('filter')($scope.tags, {name: $routeParams.version}, true);
                    if (filteredTag.length === 1) {
                        $scope.tag = filteredTag[0];
                    }
                }
                if (!$scope.tag) {
                    $scope.tag = $scope.tags[$scope.tags.length - 1];
                }

                MarketBrowserService.workspace = {alias: $scope.itemAlias, key: workspace.wskey, tags: workspace.tags};

                SearchResource.findCollection({key: $scope.tag.key}, function (collection) {
                    $scope.ortolangObject = collection;
                    $scope.root = $scope.tag.snapshot;
                    $scope.itemKey = collection.key;
                    $scope.item = collection['meta_ortolang-item-json'];

                    if (!/^(corpora|lexicons|applications|tools)$/.test($routeParams.section)) {
                        switch ($scope.item.type) {
                            case 'Corpus':
                                $route.updateParams({section: 'corpora'});
                                break;
                            case 'Lexique':
                                $route.updateParams({section: 'lexicons'});
                                break;
                            case 'Application':
                                $route.updateParams({section: 'applications'});
                                break;
                            case 'Outil':
                                $route.updateParams({section: 'tools'});
                                break;
                        }
                        $location.replace();
                    }
                    var microData = angular.element('<script type="application/ld+json">'),
                        microDataContent = {},
                        jsonMetadata = collection['meta_ortolang-item-json'];
                    microDataContent['@context'] = 'http://schema.org';
                    microDataContent['@type'] = 'DataSet';
                    microDataContent.mainEntityOfPage = {
                        '@type': 'WebPage',
                        '@id': location.href
                    };
                    microDataContent.name = Helper.getMultilingualValue(jsonMetadata.title, 'fr');
                    // Description
                    var sanitizedDescription = $sanitize(Helper.getMultilingualValue(jsonMetadata.description, 'fr'));
                    sanitizedDescription = angular.element('<div>').html(sanitizedDescription).text().substring(0, 200);
                    sanitizedDescription = sanitizedDescription.substring(0, sanitizedDescription.lastIndexOf(' '));
                    microDataContent.description = sanitizedDescription;
                    // **************
                    microDataContent.datePublished = jsonMetadata.publicationDate;
                    // Keywords
                    var keywordsString = '';
                    angular.forEach(jsonMetadata.keywords, function (keyword, index) {
                        keywordsString += (index === 0 ? '' : ', ') + keyword.value;
                    });
                    microDataContent.keywords = keywordsString;
                    // **************
                    microData.text(angular.toJson(microDataContent));
                    angular.element('head').append(microData);
                    //console.log(jsonMetadata);
                    //console.log(microDataContent);
                });

                $scope.ready = true;
            });
        }

        function init() {
            $scope.itemAlias = $routeParams.alias;
            $scope.browse = $location.search().browse;
            $scope.ready = false;
            $scope.item = {};
            loadItem();
        }

        init();

    }]);