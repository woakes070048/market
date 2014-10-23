'use strict';

/**
 * @ngdoc service
 * @name ortolangVisualizers.SimpleTextVisualizer
 * @description
 * # SimpleTextVisualizer
 * Provider in the ortolangVisualizers.
 */
angular.module('ortolangVisualizers')
    .provider('SimpleTextVisualizer', ['VisualizerFactoryProvider', function (VisualizerFactoryProvider) {

        var visualizer = VisualizerFactoryProvider.$get().make({
            id: 'SimpleTextVisualizer',
            name: 'Simple Text Visualizer',
            compatibleTypes: {
                'text/plain': true,
                'text/html': true,
                'text/css': true,
                'text/xml': true,
                'application/xml': true,
                'application/rdf+xml': true,
                'text/javascript': true,
                'application/javascript': true
            },
            element: '<simple-text-visualizer></simple-text-visualizer>'
        });

        visualizer.$get = function () {
            return visualizer;
        };

        return visualizer;
    }]);

/**
 * @ngdoc directive
 * @name ortolangVisualizers.directive:simpleTextVisualizer
 * @description
 * # ortolangVisualizers
 */
angular.module('ortolangVisualizers')
    .directive('simpleTextVisualizer', ['DownloadResource', function (DownloadResource) {

        return {
            templateUrl: '../../../views/simple-text-visualizer.html',
            restrict: 'E',
            scope: true,
            link: function postLink(scope, element, attrs) {
                DownloadResource.download(
                    {
                        wsName: scope.wsName,
                        path: scope.selectedElements[0].path
                    },
                    {
                        transformResponse: function (data, headersGetter) { return data; }
                    }
                )
                    .success(function (data) {
                        scope.code = data;
                    }).error(function () {
                        scope.code = undefined;
                    });
            }
        };
    }]);
