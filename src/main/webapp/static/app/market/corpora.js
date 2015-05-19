'use strict';

/**
 * @ngdoc function
 * @name ortolangMarketApp.controller:Corpora
 * @description
 * # Corpora
 * Controller of the ortolangMarketApp
 */
angular.module('ortolangMarketApp')
    .controller('CorporaCtrl', ['$scope', 'icons', 'FacetedFilterManager', 'FacetedFilter', 'OptionFacetedFilter', 'ItemManager', function ($scope, icons, FacetedFilterManager, FacetedFilter, OptionFacetedFilter, ItemManager) {

        function initScopeVariables() {
    		$scope.query = '';
    		$scope.items = ItemManager.make();
    		$scope.primaryFacets = [];
    		$scope.secondaryFacets = [];

        	$scope.filtersManager = FacetedFilterManager.make();

            $scope.typeFilter = FacetedFilter.make({
                id: 'meta_ortolang-item-json.type', 
                alias: 'type',
                label: 'MARKET.RESOURCE_TYPE',  
                resetLabel: 'MARKET.ALL_RESOURCE',
                options: [
                    OptionFacetedFilter.make({
                        label: 'Corpus', 
                        value: 'Corpus',
                        length: 1
                    }),
                    OptionFacetedFilter.make({
                        label: 'Lexique', 
                        value: 'Lexique',
                        length: 1
                    }),
                    OptionFacetedFilter.make({
                        label: 'Outil', 
                        value: 'Outil',
                        length: 1
                    }),
                    OptionFacetedFilter.make({
                        label: 'Projet intégré', 
                        value: 'Application',
                        length: 1
                    })
                ],
                lockOptions: true
            });
            $scope.filtersManager.addAvailabledFilter($scope.typeFilter);


            var annotationLevelFilter = FacetedFilter.make({
                id: 'meta_ortolang-item-json.annotationLevel',
                alias: 'annotationLevel',
                type: 'array',
                label: 'MARKET.CORPORA.ANNOTATION_LEVEL',
                resetLabel: 'MARKET.CORPORA.ANNOTATION_LEVEL'
            });
            $scope.filtersManager.addAvailabledFilter(annotationLevelFilter);

            var textFormatFilter = FacetedFilter.make({
                id: 'meta_ortolang-item-json.textFormat',
                alias: 'textFormat',
                type: 'array',
                label: 'MARKET.CORPORA.TEXT_FORMAT',
                resetLabel: 'MARKET.CORPORA.TEXT_FORMAT'
            });
            $scope.filtersManager.addAvailabledFilter(textFormatFilter);

            var textEncodingFilter = FacetedFilter.make({
                id: 'meta_ortolang-item-json.textEncoding',
                alias: 'textEncoding',
                type: 'array',
                label: 'MARKET.CORPORA.TEXT_ENCODING',
                resetLabel: 'MARKET.CORPORA.TEXT_ENCODING'
            });
            $scope.filtersManager.addAvailabledFilter(textEncodingFilter);

            var corpusTypeFilter = FacetedFilter.make({
                id: 'meta_ortolang-item-json.typeOfCorpus',
                alias: 'typeOfCorpus',
                label: 'MARKET.CORPORA.CORPORA_TYPE',
                resetLabel: 'MARKET.CORPORA.ALL_CORPORA',
                options: [
                    OptionFacetedFilter.make({
                        label: 'Écrit', 
                        value: 'Écrit',
                        length: 1,
                        subFilters: [annotationLevelFilter, textFormatFilter, textEncodingFilter]
                    }),
                    OptionFacetedFilter.make({
                        label: 'Oral', 
                        value: 'Oral',
                        length: 1
                    }),
                    OptionFacetedFilter.make({
                        label: 'Multimodal', 
                        value: 'Multimodal',
                        length: 1
                    })
                ],
                lockOptions: true
            });
            $scope.filtersManager.addAvailabledFilter(corpusTypeFilter);

            var statusOfUseFilter = FacetedFilter.make({
                id: 'meta_ortolang-item-json.statusOfUse',
                alias: 'statusOfUse',
                label: 'MARKET.CORPORA.ALL_STATUSOFUSE',
                resetLabel: 'MARKET.CORPORA.ALL_STATUSOFUSE'
            });
            $scope.filtersManager.addAvailabledFilter(statusOfUseFilter);

            var languageFilter = FacetedFilter.make({
                id: 'meta_ortolang-item-json.primaryLanguage',
                alias: 'primaryLanguage',
                label: 'MARKET.CORPORA.ALL_LANG',
                resetLabel: 'MARKET.CORPORA.ALL_LANG'
            });
            $scope.filtersManager.addAvailabledFilter(languageFilter);

            $scope.primaryFacets.push(corpusTypeFilter);
            $scope.primaryFacets.push(languageFilter);
            $scope.primaryFacets.push(statusOfUseFilter);

            $scope.secondaryFacets.push(annotationLevelFilter);
            $scope.secondaryFacets.push(textFormatFilter);
            $scope.secondaryFacets.push(textEncodingFilter);

            var viewModeLine = {id: 'line', icon: icons.browser.viewModeLine, text: 'MARKET.VIEW_MODE.LINE'};
            var viewModeGrid = {id: 'tile', icon: icons.browser.viewModeTile, text: 'MARKET.VIEW_MODE.GRID'};
            $scope.viewModes = [viewModeGrid, viewModeLine];
    		$scope.viewMode = viewModeGrid;

            $scope.orderDirection = false;
            var orderTitle = {id: 'title', label: 'MARKET.SORT.TITLE', text: 'MARKET.SORT.TITLE'};
            var orderCreationDate = {id: 'creationDate', label: 'MARKET.SORT.CREATION_DATE', text: 'MARKET.SORT.CREATION_DATE'};
            $scope.orderProps = [orderTitle, orderCreationDate];
            $scope.orderProp = orderTitle;
        }

        function init() {
        	initScopeVariables();
        }
        init();

	}]);