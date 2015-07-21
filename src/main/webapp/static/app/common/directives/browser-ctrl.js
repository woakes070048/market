'use strict';

/**
 * @ngdoc function
 * @name ortolangMarketApp.controller:BrowserCtrl
 * @description
 * # BrowserCtrl
 * Controller of the ortolangMarketApp
 */
angular.module('ortolangMarketApp')
    .controller('BrowserCtrl', [
        '$scope',
        '$location',
        '$routeParams',
        '$route',
        '$rootScope',
        '$compile',
        '$filter',
        '$timeout',
        '$window',
        '$q',
        '$translate',
        '$modal',
        '$alert',
        'hotkeys',
        'WorkspaceResource',
        'ObjectResource',
        'Content',
        'Runtime',
        'AuthService',
        'WorkspaceElementResource',
        'VisualizerManager',
        'icons',
        'ortolangType',
        'Settings',
        'MarketBrowserService',
        'WorkspaceBrowserService',
        'FileSelectBrowserService',
        function ($scope, $location, $routeParams, $route, $rootScope, $compile, $filter, $timeout, $window, $q, $translate, $modal, $alert, hotkeys, WorkspaceResource, ObjectResource, Content, Runtime, AuthService, WorkspaceElementResource, VisualizerManager, icons, ortolangType, Settings, MarketBrowserService, WorkspaceBrowserService, FileSelectBrowserService) {

            var isMacOs, isClickedOnce, marketItemHeader, footerHeight, previousFilterNameQuery,
                previousFilterMimeTypeQuery, previousFilterType, previousFilteredChildren, browserToolbarHeight, initialDisplayedItemLimit,
                topNavWrapper, footerWrapper, lastSelectedElement, lastShiftSelectedElement, modalScope, clickedChildSelectionDeferred;

            // *********************** //
            //        Breadcrumb       //
            // *********************** //

            function populateBreadcrumbDropdownMenu() {
                $scope.breadcrumbDropdownItems = [];
                if ($scope.browserService.canEdit && $scope.isHead) {
                    $scope.breadcrumbDropdownItems.push({text: 'BROWSER.NEW_COLLECTION', icon: icons.plus, action: 'addCollection'});
                    if (!$scope.hasOnlyRootCollectionSelected()) {
                        $scope.breadcrumbDropdownItems.push({divider: true});
                        $scope.breadcrumbDropdownItems.push({text: 'RENAME', icon: icons.browser.edit, action: 'rename'});
                    }
                }
            }

            function buildBreadcrumb() {
                var breadcrumbParts = [], tmp = '';
                angular.forEach($scope.parent.pathParts, function (key) {
                    tmp += '/' + key;
                    breadcrumbParts.push(tmp);
                });
                $scope.breadcrumbParts = breadcrumbParts;
            }

            // *********************** //
            //       Context Menu      //
            // *********************** //

            function clearContextMenuItems() {
                $scope.contextMenuItems = [];
            }

            function activateContextMenu() {
                $scope.isContextMenuActive = true;
            }

            $scope.deactivateContextMenu = function () {
                if ($scope.isContextMenuActive) {
                    $scope.isContextMenuActive = false;
                    clearContextMenuItems();
                }
            };

            $scope.contextMenu = function (clickEvent, sameChild) {
                // TODO Context menu could be optimized when clicking on a same child but context menu deactivated
                // If right click
                if (!$scope.isFileSelectBrowserService && clickEvent && clickEvent.button === 2) {
                    // If the context menu has already been build no need to do it again
                    if (!($scope.isContextMenuActive && sameChild)) {
                        clearContextMenuItems();
                        if ($scope.browserService.canEdit && $scope.isHead && $scope.selectedElements.length === 1 && $scope.isCollection($scope.selectedElements[0])) {
                            $scope.contextMenuItems.push({text: 'BROWSER.NEW_COLLECTION', icon: icons.plus, action: 'addCollection'});
                            // TODO Support importing files into selected directory
                            if ($scope.hasOnlyParentSelected()) {
                                $scope.contextMenuItems.push({divider: true});
                                $scope.contextMenuItems.push({text: 'BROWSER.UPLOAD_FILES', icon: icons.browser.upload, action: 'uploadFiles'});
                                $scope.contextMenuItems.push({text: 'BROWSER.UPLOAD_ZIP', icon: icons.browser.uploadZip, action: 'uploadZip'});
                            }
                            $scope.contextMenuItems.push({divider: true});
                        }
                        if ($scope.browserService.canPreview && $scope.visualizers) {
                            // TODO Display all compatible visualizers when multiple
                            $scope.contextMenuItems.push({text: 'BROWSER.PREVIEW', icon: icons.browser.preview, action: 'preview'});
                            $scope.contextMenuItems.push({divider: true});
                        }
                        if ($scope.browserService.canEdit && $scope.isHead && $scope.selectedElements.length === 1 && !$scope.hasOnlyParentSelected()) {
                            $scope.contextMenuItems.push({text: 'RENAME', icon: icons.browser.edit, action: 'rename'});
                            $scope.contextMenuItems.push({text: 'BROWSER.MOVE', icon: icons.browser.move, action: 'move'});
                        }
                        if ($scope.browserService.canEdit && $scope.isHead && !$scope.hasOnlyParentSelected()) {
                            $scope.contextMenuItems.push({text: 'BROWSER.DELETE', icon: icons.browser.delete, action: 'delete'});
                            $scope.contextMenuItems.push({divider: true});
                        }
                        if ($scope.browserService.canDownload && !$scope.hasOnlyParentSelected()) {
                            $scope.contextMenuItems.push({text: 'DOWNLOAD', icon: icons.browser.download, action: 'download'});
                            $scope.contextMenuItems.push({divider: true});
                        }
                        $scope.contextMenuItems.push({text: $scope.viewMode[$scope.browserSettings.viewMode].text, icon: $scope.viewMode[$scope.browserSettings.viewMode].icon, action: 'switchViewMode'});
                        if ($scope.contextMenuItems.length > 0 && $scope.contextMenuItems[$scope.contextMenuItems.length - 1].divider) {
                            $scope.contextMenuItems.pop();
                        }
                        activateContextMenu();
                    }
                    if ($scope.contextMenuItems.length > 0) {
                        if (!marketItemHeader) {
                            marketItemHeader = angular.element('.market-item').find('header').outerHeight();
                        }
                        if (!footerHeight) {
                            footerHeight = angular.element('#footer-wrapper').outerHeight();
                        }
                        var pageWrapperMarginLeft = parseInt(angular.element('#main-wrapper').css('margin-left'), 10);
                        $scope.contextMenuStyle = {
                            position: 'absolute',
                            display: 'block',
                            // Fix dropdown offset because of margin-left on page wrapper
                            left: clickEvent.pageX - pageWrapperMarginLeft - 18 + 'px',
                            // Fix dropdown offset because of navbar and toolbar
                            top: clickEvent.pageY - marketItemHeader - browserToolbarHeight - 3 + 'px'
                        };
                    }
                } else {
                    $scope.deactivateContextMenu();
                }
            };

            // *********************** //
            //         Get Data        //
            // *********************** //

            function finishGetParentData(element, refresh, forceNewSelection) {
                resetDisplayedItemLimit();
                $scope.parent = $scope.browserService.dataResource === 'object' ? element.object : element;
                if (!refresh || forceNewSelection) {
                    newSelectedElement($scope.parent);
                }
                // If we just refreshed the data no need to build the breadcrumb again
                if (!refresh) {
                    buildBreadcrumb();
                    populateBreadcrumbDropdownMenu();
                    angular.element('.table-wrapper.table-workspace-elements-wrapper').scrollTop(0);
                }
                clearPreviousFilteringQueries();
                var allChildrenMimeTypesValues = [];
                angular.forEach($scope.parent.elements, function (value) {
                    if (allChildrenMimeTypesValues.indexOf(value.mimeType) === -1) {
                        allChildrenMimeTypesValues.push(value.mimeType);
                        $scope.allChildrenMimeTypes.push({value: value.mimeType, label: '<span class="type ' + $filter('mimeTypeIconCss')(value.mimeType) + '"></span>' + value.mimeType});
                    }
                });
                if ($scope.isWorkspaceBrowserService) {
                    if ($scope.path === '/') {
                        $rootScope.ortolangPageSubtitle = ' - ' + $scope.browserService.workspace.alias;
                    } else {
                        $rootScope.ortolangPageSubtitle = ' - ' + $scope.browserService.workspace.alias + ' - ' + $scope.path.slice($scope.path.lastIndexOf('/') + 1);
                    }
                }
            }

            function getParentData(refresh, forceNewSelection) {
                if (refresh === undefined) {
                    refresh = false;
                }
                var config = {key: $scope.itemKey, wskey: $scope.browserService.workspace.key, path: $scope.path, root: $scope.root},
                    promise;
                //console.log('Getting parent data (alias: %s, root: %s, path: %s, refresh: %s, forceNewSelection: %s)', $scope.browserService.workspace.alias, $scope.root, $scope.path, refresh, forceNewSelection);
                promise = $scope.browserService.getData(config).$promise;
                promise.then(function (element) {
                    finishGetParentData(element, refresh, forceNewSelection);
                }, function (response) {
                    if (response.data.match(/.*root\s\[.*] does not exists.*/)) {
                        displaySearchErrorModal('ROOT', {root: $location.search().root});
                    } else if (response.data.match(/.*path\s\[.*] does not exists.*/)) {
                        displaySearchErrorModal('PATH', {path: $location.search().path});
                    }
                    initWorkspaceVariables();
                });
                return promise;
            }

            function selectChild(child, push, clickEvent, refresh) {
                clickEvent = clickEvent || undefined;
                var deferred, promise;
                if (push) {
                    deferred = $q.defer();
                    deferred.resolve(child);
                    promise = deferred.promise;
                } else {
                    promise = getChildData(child);
                }
                if (!push || push !== 'shift') {
                    lastShiftSelectedElement = undefined;
                }
                promise.then(function (data) {
                    // If push we use data stored inside parent.elements not detailed data retrieved from ObjectResource
                    if (!push && $scope.browserService.dataResource === 'object') {
                        data = data.object;
                    }
                    if (push) {
                        pushSelectedElement(data);
                        if (push !== 'shift') {
                            lastSelectedElement = data;
                        }
                    } else {
                        newSelectedElement(data);
                        lastSelectedElement = data;
                    }
                    checkCompatibleVisualizers();
                    if (!refresh) {
                        $scope.contextMenu(clickEvent, false);
                    }
                });
                return promise;
            }

            function selectAll() {
                if ($scope.hasOnlyParentSelected()) {
                    $scope.selectedElements = [];
                }
                angular.forEach($scope.parent.elements, function (child) {
                    if (!$scope.isSelected(child)) {
                        selectChild(child, 'shift');
                    }
                });
                lastSelectedElement = undefined;
                lastShiftSelectedElement = undefined;
            }

            function getChildData(child) {
                return $scope.browserService.getData({
                    key: child.key,
                    wskey: $scope.browserService.workspace.key,
                    path: $scope.path + '/' + child.name,
                    root: $scope.root
                }).$promise;
            }

            function getChildrenDataOfTypes(mimeTypes, isPreview, visualizer) {
                console.log('Starting to get children data of types %o', Object.keys(mimeTypes));
                $scope.children = [];
                var completedElements = 0,
                    filteredElements;
                if (mimeTypes) {
                    filteredElements = [];
                    angular.forEach(mimeTypes, function (value, mimeType) {
                        filteredElements = filteredElements.concat($filter('filter')($scope.parent.elements, {mimeType: mimeType}, true));
                    });
                } else {
                    filteredElements = $scope.parent.elements;
                }
                angular.forEach(filteredElements, function (child) {
                    console.log('Requesting data of child %s', child.name);
                    $scope.browserService.getData({key: child.key, wskey: $scope.browserService.workspace.key, path: $scope.path + child.name, root: $scope.root})
                        .$promise.then(function (data) {
                            if ($scope.browserService.dataResource === 'object') {
                                data = data.object;
                            }
                            data.selected = $scope.isSelected(data);
                            $scope.children.push(data);
                            console.log('Successfully retrieved data of child %s: %o', child.name, data);
                            completedElements += 1;
                            if (isPreview && completedElements === filteredElements.length) {
                                finishPreview(visualizer);
                            }
                        });
                });
            }

            $scope.refreshSelectedElement = function () {
                if ($scope.hasOnlyParentSelected()) {
                    getParentData(true, true);
                } else if ($scope.hasOnlyOneElementSelected()) {
                    selectChild($scope.selectedElements[0]);
                }
            };

            $scope.download = function (elements) {
                if (($scope.isWorkspaceBrowserService && elements.length > 1) || elements[0].type === ortolangType.collection) {
                    var paths = [];
                    angular.forEach(elements, function (element) {
                        paths.push($scope.browserService.workspace.alias + '/' + $scope.root + $scope.path + ($scope.hasOnlyParentSelected() ? '' : element.name));
                    });
                    if (elements.length === 1) {
                        if ($scope.path === '/' && $scope.hasOnlyParentSelected()) {
                            Content.export(paths, $scope.browserService.workspace.alias);
                        } else {
                            Content.export(paths, elements[0].name);
                        }
                    } else {
                        Content.export(paths);
                    }
                } else {
                    Content.downloadWithKeyInWindow(elements[0].key);
                }
            };

            $scope.getPreviewUrl = function (element, large) {
                return Content.getPreviewUrlWithKey(element.key, large);
            };

            function createModalScope() {
                modalScope = $scope.$new(true);
                modalScope.$on('modal.hide', function () {
                    modalScope.$destroy();
                });
                modalScope.$on('modal.show.before', function () {
                    $scope.deactivateContextMenu();
                });
            }

            // *********************** //
            //        Selection        //
            // *********************** //

            $scope.isSelected = function (element) {
                var i;
                for (i = 0; i < $scope.selectedElements.length; i++) {
                    if ($scope.selectedElements[i].key === element.key) {
                        return true;
                    }
                }
                return false;
            };

            $scope.isCollection = function (element) {
                return element.type === ortolangType.collection ||
                    (element.objectIdentifier && element.objectIdentifier.type === ortolangType.collection);
            };

            $scope.hasOnlyParentSelected = function () {
                return !$scope.selectedElements || ($scope.selectedElements.length === 1 && $scope.selectedElements[0].key === $scope.parent.key);
            };

            function hasOnlyOneElementSelectedNotParent() {
                return $scope.hasOnlyOneElementSelected() && $scope.selectedElements[0].key !== $scope.parent.key;
            }

            $scope.hasOnlyOneElementSelected = function () {
                return $scope.selectedElements && $scope.selectedElements.length === 1;
            };

            $scope.hasOnlyRootCollectionSelected = function () {
                return $scope.hasOnlyParentSelected() && ($scope.path === undefined || $scope.path === '/');
            };

            function deselectChild(child) {
                $scope.selectedElements = $filter('filter')($scope.selectedElements, {key: '!' + child.key}, true);
                if ($scope.selectedElements.length === 0) {
                    newSelectedElement($scope.parent);
                }
                checkCompatibleVisualizers();
            }

            function deselectOthers(child) {
                selectChild(child);
            }

            function deselectChildren() {
                $scope.selectedElements = [$scope.parent];
                $scope.deactivateContextMenu();
                clearVisualizers();
            }

            function getChildIndex(child) {
                var i,
                    filteredOrderedChildren = $scope.filteredOrderedChildren();
                for (i = 0; i < filteredOrderedChildren.length; i++) {
                    if (filteredOrderedChildren[i].key === child.key) {
                        return i;
                    }
                }
                return -1;
            }

            $scope.clickChild = function (child, $event) {
                var modKey = isMacOs ? $event.metaKey : $event.ctrlKey;
                if ($scope.isSelected(child) && !$event.shiftKey) {
                    if (modKey) {
                        deselectChild(child);
                    } else if ($event.button === 0) {
                        if (!$scope.hasOnlyOneElementSelected()) {
                            // Check if the user left-clicked again on the same element
                            if (child.key !== $scope.selectedElements[$scope.selectedElements.length - 1].key) {
                                deselectOthers(child);
                            } else {
                                // If it's the first time do nothing; if it's the second time deselect the others
                                if (isClickedOnce) {
                                    deselectOthers(child);
                                    isClickedOnce = false;
                                } else {
                                    isClickedOnce = true;
                                }
                            }
                        }
                    } else {
                        isClickedOnce = false;
                    }
                    $scope.contextMenu($event, true);
                } else {
                    if ((!$scope.isFileSelectBrowserService || $scope.fileSelectAcceptMultiple) &&
                        (modKey || $event.shiftKey) && !$scope.hasOnlyParentSelected()) {
                        if (modKey) {
                            selectChild(child, 'mod', $event);
                        } else if ($event.shiftKey) {
                            var lastSelectedElementIndex = getChildIndex(lastSelectedElement),
                                lastShiftSelectedElementIndex = lastShiftSelectedElement ? getChildIndex(lastShiftSelectedElement) : undefined,
                                childIndex = getChildIndex(child),
                                i,
                                j,
                                filteredOrderedChildren = $scope.filteredOrderedChildren(),
                                skip = false;
                            if (lastShiftSelectedElementIndex !== undefined) {
                                if (childIndex < lastShiftSelectedElementIndex) {
                                    if (childIndex > lastSelectedElementIndex) {
                                        i = childIndex + 1;
                                        j = lastShiftSelectedElementIndex;
                                        skip = true;
                                    } else {
                                        i = lastSelectedElementIndex + 1;
                                        j = lastShiftSelectedElementIndex;
                                    }
                                } else {
                                    if (childIndex < lastSelectedElementIndex) {
                                        i = lastShiftSelectedElementIndex;
                                        j = childIndex - 1;
                                        skip = true;
                                    } else {
                                        i = lastShiftSelectedElementIndex;
                                        j = lastSelectedElementIndex - 1;
                                    }
                                }
                                for (i; i <= j; i++) {
                                    deselectChild(filteredOrderedChildren[i]);
                                }
                            }
                            if (!skip) {
                                if (lastSelectedElementIndex < childIndex) {
                                    i = lastSelectedElementIndex + 1;
                                    j = childIndex;
                                } else {
                                    i = childIndex;
                                    j = lastSelectedElementIndex;
                                }
                                for (i; i <= j; i++) {
                                    if (!$scope.isSelected(filteredOrderedChildren[i])) {
                                        selectChild(filteredOrderedChildren[i], 'shift', $event);
                                    }
                                }
                            }
                            lastShiftSelectedElement = filteredOrderedChildren[childIndex];
                        }
                    } else {
                        clickedChildSelectionDeferred = $q.defer();
                        selectChild(child, false, $event).then(function () {
                            clickedChildSelectionDeferred.resolve();
                        });
                    }
                }
            };

            function pushSelectedElement(element) {
                $scope.selectedElements.push(element);
            }

            function newSelectedElement(element) {
                $scope.selectedElements = [element];
            }

            $scope.checkDeselection = function ($event) {
                if ($event.button === 2 || !angular.element($event.target).hasClass('btn')) {
                    deselectChildren();
                }
            };

            $scope.preventRightClick = function () {};

            $scope.checkSelection = function (clickEvent) {
                if (($scope.browserService.workspace || $scope.isMarketBrowserService) &&
                    !angular.element(clickEvent.target).closest('.workspace-element').length) {
                    deselectChildren();
                }
            };

            function getCollectionSize(collection) {
                var i,
                    size = {
                        value: 0,
                        elementNumber: 0,
                        collectionNumber: 0,
                        partial: false
                    };
                if (collection) {
                    for (i = 0; i < collection.length; i++) {
                        if (collection[i].type === ortolangType.object) {
                            size.value += collection[i].size;
                            size.elementNumber += 1;
                        } else if (collection[i].type === ortolangType.collection) {
                            size.elementNumber += 1;
                            size.collectionNumber += 1;
                            size.partial = true;
                        }
                    }
                }
                return size;
            }

            $scope.selectedElementsSize = function () {
                return getCollectionSize($scope.selectedElements);
            };

            $scope.collectionSize = function () {
                if ($scope.hasOnlyParentSelected()) {
                    return getCollectionSize($scope.parent.elements);
                }
                return getCollectionSize($scope.selectedElements[0].elements);
            };

            $scope.calculateCollectionSize = function () {
                var key;
                if ($scope.hasOnlyParentSelected()) {
                    key = $scope.parent.key;
                } else if ($scope.selectedElements[0].type === ortolangType.collection) {
                    key = $scope.selectedElements[0].key;
                } else {
                    return;
                }
                ObjectResource.size({key: key}, function (data) {
                    $scope.selectedElements[0].realSize = data.size;
                });
            };

            // *********************** //
            //         Delete          //
            // *********************** //

            function deleteElements(toBeDeletedElements) {
                if (toBeDeletedElements.length > 0) {
                    WorkspaceElementResource.delete({wskey: $scope.browserService.workspace.key, path: $scope.parent.path + '/' + toBeDeletedElements.pop().name}, function () {
                        deleteElements(toBeDeletedElements);
                    }, function (error) {
                        $alert({
                            title: error.status === 403 ? $translate.instant('WORKSPACE.DELETE_NON_EMPTY_FOLDER_ALERT.TITLE') : $translate.instant('UNEXPECTED_ERROR_ALERT.TITLE'),
                            content: error.status === 403 ? $translate.instant('WORKSPACE.DELETE_NON_EMPTY_FOLDER_ALERT.CONTENT') : $translate.instant('UNEXPECTED_ERROR_ALERT.CONTENT'),
                            type: 'danger',
                            duration: 5
                        });
                        $scope.deactivateContextMenu();
                    });
                } else {
                    getParentData(true).then(function () {
                        deselectChildren();
                    });
                }
            }

            $scope.clickDelete = function () {
                var toBeDeletedElements = angular.copy($scope.selectedElements);
                deleteElements(toBeDeletedElements);
            };

            // *********************** //
            //       Upload Zip        //
            // *********************** //

            function uploadZip() {
                var uploadZipModal;
                createModalScope();
                modalScope.parent = $scope.parent;
                modalScope.wsName = $scope.browserService.workspace.name;
                modalScope.overwrite = false;
                modalScope.root = '';
                modalScope.uploadZip = function () {
                    var files = angular.element('#upload-zip-file').prop('files');
                    $rootScope.uploader.addToQueue(files, {
                        'process-name': $translate.instant('WORKSPACE.PROCESS_NAMES.IMPORT_ZIP', {zipName: files[0].name, wsName: $scope.browserService.workspace.name}),
                        'ziproot': $scope.parent.path + '/' + modalScope.root,
                        'overwrite': modalScope.overwrite,
                        'wskey': $scope.browserService.workspace.key,
                        'ortolangType': 'zip'
                    });
                    uploadZipModal.hide();
                };
                uploadZipModal = $modal({
                    scope: modalScope,
                    templateUrl: 'workspace/templates/upload-zip-modal.html',
                    show: true
                });
            }

            $rootScope.$on('uploaderZipUploadCompleted', function ($event, fileItem, response) {
                createModalScope();
                var uploadZipCompletedModal;
                modalScope.archiveName = fileItem.file.name;
                modalScope.wsName = fileItem.wsName;
                modalScope.process = response;
                modalScope.showLog = function () {
                    uploadZipCompletedModal.hide();
                    $location.url('#/processes?pKey=' + modalScope.process.key);
                };
                uploadZipCompletedModal = $modal({
                    scope: modalScope,
                    templateUrl: 'workspace/templates/upload-zip-completed-modal.html',
                    show: true
                });
            });

            // *********************** //
            //     Add Collection      //
            // *********************** //

            $scope.addCollection = function () {
                if ($scope.browserService.canEdit && $scope.isHead) {
                    var addCollectionModal;
                    createModalScope();
                    modalScope.addCollection = function () {
                        var data,
                            path = $scope.parent.path + '/';

                        if ($scope.hasOnlyOneElementSelected() && !$scope.hasOnlyParentSelected() &&
                            $scope.isCollection($scope.selectedElements[0])) {
                            path += $scope.selectedElements[0].name + '/';
                        }
                        path += modalScope.newCollectionName;

                        data = {
                            path: path,
                            type: ortolangType.collection
                        };
                        WorkspaceElementResource.put({wskey: $scope.browserService.workspace.key }, data, function () {
                            getParentData(true).then(function () {
                                addCollectionModal.hide();
                            });
                        });
                    };
                    modalScope.$on('modal.show', function () {
                        angular.element('#new-collection-modal').find('[autofocus]:first').focus();
                    });
                    addCollectionModal = $modal({
                        scope: modalScope,
                        templateUrl: 'workspace/templates/add-collection-modal.html',
                        show: true
                    });
                }
            };

            $scope.renameChild = function () {
                if ($scope.browserService.canEdit && $scope.isHead) {
                    var renameChildModal;
                    createModalScope();
                    modalScope.childNewName = $scope.selectedElements[0].name;
                    modalScope.renameChild = function () {
                        if (modalScope.childNewName !== $scope.selectedElements[0].name) {
                            var data = $scope.selectedElements[0], destination;
                            if ($scope.hasOnlyParentSelected()) {
                                destination = $scope.parent.path.substring(0, $scope.parent.path.lastIndexOf('/'));
                            } else {
                                destination = $scope.parent.path;
                            }
                            destination += '/' + modalScope.childNewName;

                            WorkspaceElementResource.put({wskey: $scope.browserService.workspace.key, destination: destination}, data, function () {
                                if ($scope.hasOnlyParentSelected()) {
                                    $scope.browseToPath(destination);
                                    renameChildModal.hide();
                                } else {
                                    getParentData(true).then(function () {
                                        $scope.selectedElements[0].name = modalScope.childNewName;
                                        $scope.refreshSelectedElement();
                                        renameChildModal.hide();
                                    });
                                }
                            });
                        } else {
                            renameChildModal.hide();
                        }
                    };
                    modalScope.$on('modal.show', function () {
                        angular.element('#rename-collection-modal').find('[autofocus]:first').focus();
                    });
                    renameChildModal = $modal({
                        scope: modalScope,
                        templateUrl: 'workspace/templates/rename-modal.html',
                        show: true
                    });
                }
            };

            $scope.moveChild = function () {
                if ($scope.browserService.canEdit && $scope.isHead) {
                    var moveModal;
                    createModalScope();
                    modalScope.title = $translate.instant('WORKSPACE.MOVE_CHILD_MODAL.TITLE', {name: $scope.selectedElements[0].name});
                    modalScope.forceWorkspace = $scope.browserService.workspace.key;
                    modalScope.forceHead = true;
                    if ($scope.selectedElements[0].type === ortolangType.collection) {
                        modalScope.forcePath = $scope.parent.path;
                        modalScope.hideElement = $scope.selectedElements[0].key;
                    } else {
                        modalScope.forcePath = $scope.path;
                    }
                    modalScope.forceMimeTypes = 'ortolang/collection';
                    modalScope.acceptMultiple = false;
                    modalScope.fileSelectId = 'moveChildModal';

                    modalScope.$on('browserSelectedElements-moveChildModal', function ($event, elements) {
                        modalScope.moveChild(elements[0]);
                    });

                    modalScope.moveChild = function (selectedCollection) {
                        var data = $scope.selectedElements[0],
                            destination = selectedCollection.path + (selectedCollection.path === '/' ?  '' : '/') + $scope.selectedElements[0].name;
                        if (destination !== $scope.selectedElements[0].path) {
                            WorkspaceElementResource.put({wskey: $scope.browserService.workspace.key, destination: destination}, data, function () {
                                deselectChildren();
                                getParentData(true).then(function () {
                                    moveModal.hide();
                                });
                            });
                        } else {
                            moveModal.hide();
                        }
                    };
                    moveModal = $modal({
                        scope: modalScope,
                        templateUrl: 'common/directives/file-select-modal-template.html',
                        show: true
                    });
                }
            };

            $scope.doAction = function (name) {
                switch (name) {
                    case 'download':
                        $scope.download($scope.selectedElements);
                        $scope.deactivateContextMenu();
                        break;
                    case 'addCollection':
                        $scope.addCollection();
                        break;
                    case 'delete':
                        $scope.clickDelete();
                        break;
                    case 'rename':
                        $scope.renameChild();
                        break;
                    case 'move':
                        $scope.moveChild();
                        break;
                    case 'preview':
                        $scope.clickPreview();
                        break;
                    case 'uploadFiles':
                        // Using $timeout to prevent '$apply already in progress' error
                        $timeout(function () {
                            angular.element('#object-upload-file-select').click();
                        });
                        break;
                    case 'uploadZip':
                        uploadZip();
                        break;
                    case 'switchViewMode':
                        $scope.switchViewMode();
                        break;
                    default:
                        break;
                }
            };


            // ***************** //
            //       Tools       //
            // ***************** //

            $scope.showToolsList = function () {
                $rootScope.$broadcast('tool-list-show');
            };

            // *********************** //
            //       Visualizers       //
            // *********************** //

            function clearVisualizers() {
                $scope.visualizers = undefined;
            }

            function checkCompatibleVisualizers() {
                $scope.visualizers = VisualizerManager.getCompatibleVisualizers($scope.selectedElements);
                if ($scope.visualizers.length === 0) {
                    clearVisualizers();
                }
            }

            function finishPreview(visualizer) {
                var element,
                    visualizerModal;
                createModalScope();
                if ($scope.children && $scope.children.length !== 0) {
                    modalScope.elements = $scope.children;
                } else {
                    modalScope.elements = $scope.selectedElements;
                }
                modalScope.visualizer = {
                    header: {},
                    content: {},
                    footer: {}
                };
                if (visualizer) {
                    element = $compile(visualizer.getElement())(modalScope);
                } else {
                    modalScope.icons = icons;
                    modalScope.download = function () {
                        $scope.download($scope.selectedElements);
                    };
                    modalScope.visualizer.content.classes = 'center';
                    element = $compile('<div ng-include="\'common/visualizers/no-visualizer-template.html\'">')(modalScope);
                }
                element.addClass('close-on-click');
                visualizerModal = $modal({
                    scope: modalScope,
                    templateUrl: 'common/visualizers/visualizer-template.html',
                    show: true
                });
                modalScope.$on('modal.show.before', function (event, modal) {
                    modal.$element.find('.visualizer-content').append(element);
                    modalScope.clickContent = function (event) {
                        if (angular.element(event.target).hasClass('close-on-click')) {
                            visualizerModal.hide();
                        }
                    };
                });
                $scope.contextMenu();
            }

            $scope.clickPreview = function (_visualizer_) {
                if (angular.element('.visualizer-modal').length > 0) {
                    angular.element('.visualizer-modal').scope().$hide();
                } else if (_visualizer_ || $scope.visualizers) {
                    var visualizer = _visualizer_ || $scope.visualizers[0];
                    if (visualizer.needAllChildrenData) {
                        // TODO Won't work for visualizers accepting multiple
                        if (visualizer.isAcceptingSingle()) {
                            getChildrenDataOfTypes(visualizer.getCompatibleTypes(), true, visualizer);
                        }
                    } else {
                        $scope.children = undefined;
                        finishPreview(visualizer);
                    }
                }
            };

            $scope.browseToPath = function (path) {
                setPath(path);
                if ($scope.isFileSelectBrowserService) {
                    getParentData();
                }
                clearVisualizers();
            };

            function browseToKey(key, usingHistory) {
                if (!usingHistory) {
                    $scope.keyHistory.back.push($scope.itemKey);
                    $scope.keyHistory.forward = [];
                }
                clearVisualizers();
                setItemKey(key);
                getParentData();
            }

            $scope.goBack = function () {
                $scope.keyHistory.forward.push($scope.itemKey);
                browseToKey($scope.keyHistory.back.pop(), true);
            };

            $scope.goForward = function () {
                $scope.keyHistory.back.push($scope.itemKey);
                browseToKey($scope.keyHistory.forward.pop(), true);
            };

            function browseToChild(child) {
                if ($scope.browserService.dataResource === 'object') {
                    browseToKey(child.key);
                } else {
                    $scope.browseToPath($scope.parent.path + '/' + child.name);
                }
            }

            function browseToParent() {
                if ($scope.browserService.dataResource !== 'object' &&
                    !$scope.isFileSelectBrowserService && $scope.path !== '/') {
                    var pathPartsCopy = angular.copy($scope.parent.pathParts);
                    pathPartsCopy.pop();
                    $scope.browseToPath('/' + pathPartsCopy.join('/'));
                }
            }

            function getSelectedElementsCopy() {
                var selectedElementsCopy = angular.copy($scope.selectedElements),
                    matchingSelectedElements,
                    isForceMimeTypesArray = $scope.forceMimeTypes ? angular.isArray($scope.forceMimeTypes) : undefined;
                if (isForceMimeTypesArray) {
                    matchingSelectedElements = [];
                }
                angular.forEach(selectedElementsCopy, function (element) {
                    if (isForceMimeTypesArray) {
                        var i, mimeTypeRegExp;
                        for (i = 0; i < $scope.forceMimeTypes.length; i++) {
                            mimeTypeRegExp = new RegExp($scope.forceMimeTypes[i], 'gi');
                            if (element.mimeType.match(mimeTypeRegExp)) {
                                matchingSelectedElements.push(element);
                                break;
                            }
                        }
                    }
                });
                if ($scope.forceMimeTypes && !isForceMimeTypesArray) {
                    matchingSelectedElements = $filter('filter')(selectedElementsCopy, {mimeType: $scope.forceMimeTypes}, false);
                }
                return $scope.forceMimeTypes ? matchingSelectedElements : selectedElementsCopy;
            }

            $scope.doubleClickChild = function (child) {
                if ($scope.isCollection(child)) {
                    browseToChild(child);
                } else {
                    if ($scope.isFileSelectBrowserService) {
                        var elements = getSelectedElementsCopy();
                        if (elements && elements.length > 0) {
                            $rootScope.$emit('browserSelectedElements-' + $scope.fileSelectId, elements);
                        }
                    } else {
                        clickedChildSelectionDeferred.promise.then(function () {
                            if ($scope.visualizers) {
                                $scope.clickPreview();
                            } else {
                                finishPreview();
                            }
                        });
                    }
                }
            };

            // *********************** //
            //          Events         //
            // *********************** //

            $scope.$on('$destroy', function () {
                if ($scope.isWorkspaceBrowserService) {
                    $rootScope.browsing = false;
                    $rootScope.ortolangPageSubtitle = undefined;
                }
            });

            $rootScope.$on('browserAskSelectedElements', function () {
                console.log('%s caught event "browserAskSelectedElements"', $scope.browserService.id);
                if ($scope.isFileSelectBrowserService) {
                    var elements = getSelectedElementsCopy();
                    if (elements && elements.length > 0) {
                        console.log('%s emit "browserSelectedElements-%s" event', $scope.browserService.id, $scope.fileSelectId);
                        $scope.$emit('browserSelectedElements-' + $scope.fileSelectId, elements);
                    }
                }
            });

            $rootScope.$on('browserAskChangeWorkspace', function ($event, workspace) {
                console.log('%s caught event "browserAskChangeWorkspace"', $scope.browserService.id);
                $scope.changeWorkspace(workspace);
                $event.stopPropagation();
            });

            $rootScope.$on('uploaderObjectUploadCompleted', function () {
                //console.log('%s caught event "uploaderObjectUploadCompleted"', $scope.browserService.id);
                getParentData(true, $scope.hasOnlyParentSelected());
            });

            $rootScope.$on('core.workspace.update', function ($event, eventMessage) {
                if ($scope.browserService.workspace.key === eventMessage.fromObject) {
                    var path = eventMessage.arguments.path;
                    if (path) {
                        path = path.substring(0, path.lastIndexOf('/') + 1);
                        if ($scope.path === path) {
                            getParentData(true);
                        }
                    }
                }
            });

            $scope.$on('$routeUpdate', function () {
                if ($scope.isMarketBrowserService) {
                    if ($location.search().key && $location.search().key !== $scope.itemKey) {
                        if ($scope.keyHistory.back.length !== 0 && $scope.keyHistory.back[$scope.keyHistory.back.length - 1] === $location.search().key) {
                            $scope.goBack();
                        } else if ($scope.keyHistory.forward.length !== 0 && $scope.keyHistory.forward[$scope.keyHistory.forward.length - 1] === $location.search().key) {
                            $scope.goForward();
                        } else {
                            browseToKey($location.search().key);
                        }
                        resetFilterModels();
                    }
                } else if ($rootScope.browsing) {
                    if (!$location.search().browse) {
                        $rootScope.browsing = false;
                        return;
                    }
                    // TODO need fix: when changing workspace getParentData() called twice
                    if ($location.search().alias !== $scope.browserService.workspace.alias) {
                        var workspace = $filter('filter')($scope.workspaceList, {alias: $location.search().alias}, true);
                        if (workspace && workspace.length === 1) {
                            initWorkspaceVariables(workspace[0]);
                            resetFilterModels();
                        }
                    } else {
                        if ($location.search().path !== $scope.path) {
                            setPath($location.search().path);
                        }
                        if ($location.search().root !== $scope.root) {
                            setRoot($location.search().root);
                        }
                        resetFilterModels();
                        getParentData();
                    }
                }
            });

            $scope.changeWorkspace = function (workspace) {
                if (!$scope.forceWorkspace) {
                    if (!$scope.isActiveWorkspace(workspace)) {
                        initWorkspaceVariables(workspace);
                    } else {
                        if ($scope.isWorkspaceBrowserService) {
                            $scope.toggleBrowsing();
                        } else {
                            if ($scope.path !== '/') {
                                $scope.browseToPath('/');
                            } else {
                                deselectChildren();
                            }
                        }
                    }
                }
            };

            $scope.isActiveWorkspace = function (workspace) {
                return $scope.browserService.workspace.key === workspace.key;
            };

            $scope.changeRoot = function (root) {
                setRoot(root);
                if ($scope.path === '/') {
                    getParentData();
                } else {
                    // Check if that path exist in the selected version
                    $scope.browserService.getData({wskey: $scope.browserService.workspace.key, root: root, path: $scope.path})
                        .$promise.then(function (element) {
                            finishGetParentData(element);
                        }, function () {
                            setPath('/');
                            getParentData();
                        });
                }
            };

            function displaySearchErrorModal(cause, params) {
                $modal({
                    title: $translate.instant('WORKSPACE.SEARCH_ERROR_MODAL.TITLE'),
                    content: $translate.instant('WORKSPACE.SEARCH_ERROR_MODAL.BODY_' + cause, params),
                    show: true
                });
            }

            // *********************** //
            //          Filter         //
            // *********************** //

            function clearPreviousFilteringQueries() {
                previousFilterNameQuery = undefined;
                previousFilterMimeTypeQuery = undefined;
                previousFilterType = undefined;
                previousFilteredChildren = {};
            }

            function resetFilterModels() {
                $scope.filterNameQuery = undefined;
                $scope.filterMimeTypeQuery = undefined;
                angular.element('#filter-query-wrapper.open').find('.dropdown-toggle').dropdown('toggle');
            }

            $scope.filterChildren = function (filterNameQuery, filterMimeTypeQuery, type) {
                //console.count('Browser filterChildren');
                return function (child) {
                    if (type && child.type !== type) {
                        return false;
                    }
                    if ($scope.hideElement && $scope.hideElement === child.key) {
                        return false;
                    }
                    if (!filterNameQuery && !filterMimeTypeQuery) {
                        return true;
                    }
                    var nameRegExp = new RegExp(filterNameQuery, 'gi'),
                        mimeTypeRegExp,
                        matchMimeTypes = false,
                        matchName = !filterNameQuery || filterNameQuery.length < 2 || child.name.match(nameRegExp);
                    if (matchName) {
                        if (!filterMimeTypeQuery || filterMimeTypeQuery.length < 2) {
                            matchMimeTypes = true;
                        } else {
                            if (angular.isArray(filterMimeTypeQuery)) {
                                var i;
                                for (i = 0; i < filterMimeTypeQuery.length; i++) {
                                    mimeTypeRegExp = new RegExp(filterMimeTypeQuery[i], 'gi');
                                    if (child.mimeType.match(mimeTypeRegExp)) {
                                        matchMimeTypes = true;
                                        break;
                                    }
                                }
                            } else {
                                mimeTypeRegExp = new RegExp(filterMimeTypeQuery, 'gi');
                                matchMimeTypes = child.mimeType.match(mimeTypeRegExp);
                            }
                        }
                        return matchMimeTypes;
                    }
                    return false;
                };
            };

            $scope.filteredOrderedChildren = function () {
                $scope.filteredOrderedChildrenArray = $filter('orderBy')($scope.filteredChildren(), $scope.orderProp, $scope.orderReverse);
                return $scope.filteredOrderedChildrenArray;
            };

            $scope.filteredChildren = function (type) {
                //console.count('Browser filteredChildren');
                if ($scope.parent && $scope.parent.elements) {
                    if (!$scope.hideElement && $scope.filterNameQuery === previousFilterNameQuery &&
                        $scope.filterMimeTypeQuery === previousFilterMimeTypeQuery &&
                        type === previousFilterType) {
                        if (type) {
                            return previousFilteredChildren[type] || $scope.parent.elements;
                        }
                        return previousFilteredChildren.noType || $scope.parent.elements;
                    }
                    var filterResult = $filter('filter')($scope.parent.elements, $scope.filterChildren($scope.filterNameQuery, $scope.filterMimeTypeQuery, type), true);
                    if (type) {
                        previousFilteredChildren[type] = filterResult;
                    } else {
                        previousFilteredChildren.noType = filterResult;
                    }
                    previousFilterNameQuery = $scope.filterNameQuery;
                    previousFilterMimeTypeQuery = $scope.filterMimeTypeQuery;
                    previousFilterType = type;
                    return filterResult;
                }
                return [];
            };

            $scope.order = function (predicate, reverse) {
                // If ask to toggle with a different predicate force reverse to false (ascending)
                if (reverse === undefined || (reverse === 'toggle' && !angular.equals(predicate, $scope.orderProp))) {
                    reverse = false;
                }
                $scope.orderReverse = reverse === 'toggle' ? !$scope.orderReverse : reverse;
                if ($scope.orderReverse && angular.equals(predicate, ['type','name'])) {
                    // Conserve collection on top of data objects; i.e. reverse only name
                    predicate = ['-type', 'name'];
                }
                $scope.orderProp = predicate;
                lastShiftSelectedElement = undefined;
            };

            $scope.displayAll = function () {
                $scope.loadingAll = true;
                $timeout(function () {
                    $scope.displayedItemLimit = undefined;
                });
            };

            function resetDisplayedItemLimit() {
                $scope.displayedItemLimit = initialDisplayedItemLimit;
                $scope.loadingAll = false;
            }

            $scope.openFilter = function (event) {
                event.stopPropagation();
            };

            $scope.$on('ngRepeatRenderingFinished', function() {
                $scope.loadingAll = false;
            });

            angular.element('#filter-query-wrapper').on('hide.bs.dropdown', function () {
                if (($scope.filterNameQuery !== undefined && $scope.filterNameQuery.length !== 0) ||
                    ($scope.filterMimeTypeQuery !== undefined && $scope.filterMimeTypeQuery.length !== 0)) {
                    return false;
                }
            });

            function navigate(down, event) {
                if (angular.element('.visualizer-modal').length === 0 && $scope.isViewModeLine()) {
                    var i, deferred, promise;
                    if ($scope.hasOnlyOneElementSelected()) {
                        if ($scope.selectedElements[0].key === $scope.parent.key) {
                            if (down) {
                                promise = selectChild($scope.filteredOrderedChildrenArray[0]);
                            } else {
                                promise = selectChild($scope.filteredOrderedChildrenArray[$scope.filteredOrderedChildrenArray.length - 1]);
                            }
                        } else {
                            for (i = 0; i < $scope.filteredOrderedChildrenArray.length; i++) {
                                if ($scope.filteredOrderedChildrenArray[i].key === $scope.selectedElements[0].key) {
                                    if (down) {
                                        i++;
                                    } else {
                                        i--;
                                    }
                                    break;
                                }
                            }
                            if (i >= 0 && i < $scope.filteredOrderedChildrenArray.length) {
                                if (event.shiftKey) {
                                    deferred = $q.defer();
                                    promise = deferred.promise;
                                    $scope.clickChild($scope.filteredOrderedChildrenArray[i], event);
                                    deferred.resolve();
                                } else {
                                    promise = selectChild($scope.filteredOrderedChildrenArray[i]);
                                }
                            }
                        }
                    } else {
                        var j, k = 0, lastSelectedElementIndex, lastShiftSelectedElementIndex;
                        if (event.shiftKey) {
                            lastSelectedElementIndex = lastSelectedElement ? getChildIndex(lastSelectedElement) : undefined;
                            lastShiftSelectedElementIndex = lastShiftSelectedElement ? getChildIndex(lastShiftSelectedElement) : undefined;
                            if ((!down && lastShiftSelectedElementIndex === 0) || (down && lastShiftSelectedElementIndex === $scope.filteredOrderedChildrenArray.length - 1)) {
                                return;
                            }
                        }
                        for (i = 0; i < $scope.filteredOrderedChildrenArray.length; i++) {
                            for (j = 0; j < $scope.selectedElements.length; j++) {
                                if ($scope.filteredOrderedChildrenArray[i].key === $scope.selectedElements[j].key) {
                                    k++;
                                    break;
                                }
                            }
                            if (lastShiftSelectedElementIndex !== undefined && k === 1 && lastShiftSelectedElementIndex < lastSelectedElementIndex) {
                                if (down) {
                                    i++;
                                } else if (i !== 0) {
                                    i--;
                                }
                                break;
                            }
                            if (k === $scope.selectedElements.length) {
                                if (down) {
                                    i++;
                                } else {
                                    i--;
                                }
                                break;
                            }
                        }
                        if (i >= 0) {
                            if (i >= $scope.filteredOrderedChildrenArray.length) {
                                i = $scope.filteredOrderedChildrenArray.length - 1;
                            }
                            if (event.shiftKey) {
                                if (lastSelectedElementIndex !== undefined) {
                                    deferred = $q.defer();
                                    promise = deferred.promise;
                                    $scope.clickChild($scope.filteredOrderedChildrenArray[i], event);
                                    deferred.resolve();
                                }
                            } else {
                                promise = selectChild($scope.filteredOrderedChildrenArray[i]);
                            }
                        }
                    }
                    if (promise) {
                        promise.then(function () {
                            var element = angular.element('tr[data-key="' + $scope.selectedElements[$scope.selectedElements.length - 1].key + '"]'),
                                parent = angular.element('.table-wrapper.table-workspace-elements-wrapper'),
                                elementTop = element.position() ? element.position().top : undefined;
                            if ($scope.selectedElements[$scope.selectedElements.length - 1].key === $scope.filteredOrderedChildrenArray[0].key) {
                                parent.scrollTop(0);
                            } else {
                                if (elementTop < 0) {
                                    parent.scrollTop(parent.scrollTop() + elementTop - 6);
                                } else if (elementTop > parent.outerHeight() - element.outerHeight()) {
                                    parent.scrollTop(parent.scrollTop() + elementTop - parent.outerHeight() + element.outerHeight() + 6);
                                }
                            }
                        });
                    }
                }
            }

            function preventDefault(event) {
                if (event.preventDefault) {
                    event.preventDefault();
                } else { // IE
                    event.returnValue = false;
                }
            }

            function previewWithShortcut(event) {
                preventDefault(event);
                $scope.clickPreview();
            }

            function bindHotkeys() {
                hotkeys.bindTo($scope)
                    .add({
                        combo: ['up', 'shift+up'],
                        description: $scope.isFileSelectBrowserService ? undefined : $translate.instant('BROWSER.SHORTCUTS.UP'),
                        callback: function (event) {
                            preventDefault(event);
                            navigate(false, event);
                        }
                    })
                    .add({
                        combo: ['down', 'shift+down'],
                        description: $scope.isFileSelectBrowserService ? undefined : $translate.instant('BROWSER.SHORTCUTS.DOWN'),
                        callback: function (event) {
                            preventDefault(event);
                            navigate(true, event);
                        }
                    })
                    .add({
                        combo: 'backspace',
                        description: $scope.isFileSelectBrowserService ? undefined : $translate.instant('BROWSER.SHORTCUTS.BACKSPACE'),
                        callback: function (event) {
                            preventDefault(event);
                            if ($scope.isMarketBrowserService) {
                                $scope.goBack();
                            } else {
                                browseToParent();
                            }
                        }
                    })
                    .add({
                        combo: 'v',
                        description: $scope.isFileSelectBrowserService ? undefined : $translate.instant('BROWSER.SHORTCUTS.VIEW_MODE'),
                        callback: function (event) {
                            preventDefault(event);
                            $scope.switchViewMode();
                        }
                    });
                if ($scope.browserService.displayAsideInfo) {
                    hotkeys.bindTo($scope).add({
                        combo: 'i',
                        description: $translate.instant('BROWSER.SHORTCUTS.INFO'),
                        callback: function (event) {
                            preventDefault(event);
                            $scope.toggleAsideInfo();
                        }
                    });
                }
                if ($scope.browserService.displayAsideWorkspaceList && !$scope.isFileSelectBrowserService) {
                    hotkeys.bindTo($scope).add({
                        combo: 'w',
                        description: $translate.instant('BROWSER.SHORTCUTS.WORKSPACE_LIST'),
                        callback: function (event) {
                            preventDefault(event);
                            $scope.toggleWorkspaceList();
                        }
                    });
                }
                hotkeys.bindTo($scope)
                    .add({
                        combo: 'space',
                        description: $scope.isFileSelectBrowserService ? undefined : $translate.instant('BROWSER.PREVIEW'),
                        callback: function (event) {
                            previewWithShortcut(event);
                        }
                    })
                    .add({
                        combo: 'enter',
                        description: $scope.isFileSelectBrowserService ? undefined : $translate.instant('BROWSER.SHORTCUTS.ENTER'),
                        callback: function (event) {
                            preventDefault(event);
                            if (hasOnlyOneElementSelectedNotParent() && $scope.isCollection($scope.selectedElements[0])) {
                                browseToChild($scope.selectedElements[0]);
                            } else {
                                previewWithShortcut(event);
                            }
                        }
                    })
                    .add({
                        combo: 'mod+f',
                        description: $scope.isFileSelectBrowserService ? undefined : $translate.instant('BROWSER.SHORTCUTS.FILTER'),
                        callback: function (event) {
                            preventDefault(event);
                            var filterWrapper = angular.element('#filter-query-wrapper');
                            filterWrapper.find('button').dropdown('toggle');
                            filterWrapper.find('#filter-input').focus();
                        }
                    })
                    .add({
                        combo: 'mod+a',
                        description: $scope.isFileSelectBrowserService ? undefined : $translate.instant('BROWSER.SHORTCUTS.SELECT_ALL'),
                        callback: function (event) {
                            preventDefault(event);
                            selectAll();
                        }
                    });
                if ($scope.browserService.canEdit) {
                    hotkeys.bindTo($scope).add({
                        combo: 'mod+backspace',
                        description: $translate.instant('BROWSER.SHORTCUTS.DELETE'),
                        callback: function (event) {
                            preventDefault(event);
                            if (!$scope.hasOnlyParentSelected()) {
                                $scope.clickDelete();
                            }
                        }
                    })
                        .add({
                            combo: 'shift+f',
                            description: $translate.instant('BROWSER.SHORTCUTS.NEW_COLLECTION'),
                            callback: function (event) {
                                preventDefault(event);
                                $scope.addCollection();
                            }
                        })
                        .add({
                            combo: 'u',
                            description: $translate.instant('BROWSER.UPLOAD_FILES'),
                            callback: function (event) {
                                preventDefault(event);
                                $scope.doAction('uploadFiles');
                            }
                        });
                }
            }

            $scope.showCheatsheet = function ($event) {
                hotkeys.get('?').callback($event);
            };

            // *********************** //
            //          Resize         //
            // *********************** //

            $scope.resizeBrowser = function () {
                if (!$scope.isFileSelectBrowserService) {
                    var topOffset = topNavWrapper.outerHeight(),
                        height = (window.innerHeight > 0) ? window.innerHeight : screen.height,
                        bottomOffset = footerWrapper.outerHeight();
                    browserToolbarHeight = angular.element('.browser-toolbar').innerHeight();
                    if ($scope.isMarketBrowserService) {
                        topOffset += angular.element('.market-item').find('header').outerHeight();
                        height -= 1;
                    }
                    height = height - topOffset - bottomOffset;
                    if (height < 1) {
                        height = 1;
                    }
                    if (height > topOffset) {
                        height -= 1;
                        if ($rootScope.uploader && $rootScope.uploader.uploadQueueStatus === 'active') {
                            height -= angular.element('.upload-queue').innerHeight();
                        }
                        var browserWrapper = angular.element('.browser-wrapper'),
                            browserAside = angular.element('.browser-aside');
                        browserAside.css('min-height', (height - browserToolbarHeight) + 'px');
                        browserAside.find('.my-workspaces').css('height', (height - browserToolbarHeight - 80) + 'px');
                        browserWrapper.find('.table-wrapper.table-workspace-elements-wrapper').css('height', (height - browserToolbarHeight) + 'px');
                        browserWrapper.find('.tile-workspace-elements-wrapper').css('height', (height - browserToolbarHeight) + 'px');
                        browserWrapper.find('.browser-aside-left-collapsed').css('height', (height - browserToolbarHeight) + 'px');
                    }
                    $scope.isScreenMd = window.innerWidth < 992;
                    $scope.browserSettings.hideWorkspaceListMdScreen = $scope.isScreenMd;
                    $scope.$applyAsync();
                }
            };

            angular.element($window).bind('resize', function () {
                $scope.resizeBrowser();
            });

            $rootScope.$watch('uploader.uploadQueueStatus', function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.resizeBrowser();
                }
            });

            // *********************** //
            //        View mode        //
            // *********************** //

            function setViewMode(viewMode) {
                $scope.browserSettings.viewMode = viewMode;
                Settings.store();
            }

            $scope.switchViewMode = function () {
                clearPreviousFilteringQueries();
                $scope.deactivateContextMenu();
                if ($scope.isViewModeLine()) {
                    setViewMode($scope.viewMode.tile.id);
                } else {
                    setViewMode($scope.viewMode.line.id);
                }
            };

            $scope.isViewModeLine = function () {
                return $scope.browserSettings.viewMode === $scope.viewMode.line.id;
            };

            $scope.tileCssClasses = function () {
                if ($scope.browserService.displayAsideInfo && $scope.browserSettings.hideInfo) {
                    return 'col-sm-4 col-md-3 col-lg-3 col-xlg-15 col-xxlg-15';
                }
                return 'col-sm-6 col-md-4 col-lg-4 col-xlg-14 col-xxlg-15';
            };

            $scope.middleCssClass = function () {
                var columnNumber = 12;
                if ($scope.browserService.displayAsideInfo && !$scope.browserSettings.hideInfo) {
                    columnNumber -= 3;
                }
                if ($scope.isScreenMd) {
                    if ($scope.browserService.displayAsideInfo && !$scope.browserSettings.hideInfo) {
                        columnNumber -= 1;
                    }
                } else {
                    if ($scope.displayAsideWorkspaceList() && !$scope.browserSettings.hideWorkspaceList) {
                        columnNumber -= 2;
                    }
                }
                return 'col-sm-' + columnNumber + ($scope.browserSettings.hideWorkspaceList || $scope.browserSettings.hideWorkspaceListMdScreen ? ' browser-middle-collapsed' : '');
            };

            $scope.toggleAsideInfo = function () {
                $scope.browserSettings.hideInfo = !$scope.browserSettings.hideInfo;
                Settings.store();
            };

            $scope.toggleWorkspaceList = function () {
                if ($scope.isScreenMd) {
                    $scope.browserSettings.hideWorkspaceListMdScreen = !$scope.browserSettings.hideWorkspaceListMdScreen;
                } else {
                    $scope.browserSettings.hideWorkspaceList = !$scope.browserSettings.hideWorkspaceList;
                }
                Settings.store();
            };

            $scope.displayAsideWorkspaceList = function () {
                return !$scope.forceWorkspace && $scope.browserService.displayAsideWorkspaceList;
            };

            $scope.isSuperUser = function () {
                return AuthService.isSuperUser();
            };

            $scope.getToken = function () {
                return 'Bearer: ' + AuthService.getToken();
            };

            // *********************** //
            //           Init          //
            // *********************** //

            function initLocalVariables() {
                isMacOs = $window.navigator.appVersion.indexOf('Mac') !== -1;
                isClickedOnce = false;
                clearPreviousFilteringQueries();
                topNavWrapper = angular.element('#top-nav-wrapper');
                footerWrapper = angular.element('#footer-wrapper');
                initialDisplayedItemLimit = 50;
            }

            function initScopeVariables() {
                if ($scope.isFileSelectBrowserService) {
                    $scope.browserService = FileSelectBrowserService;
                    if ($scope.forceMimeTypes) {
                        $scope.filterMimeTypeQuery = $scope.forceMimeTypes;
                    }
                } else if ($route.current && $route.current.originalPath.match(/\/workspaces/)) {
                    $scope.browserService = WorkspaceBrowserService;
                    $scope.isWorkspaceBrowserService = true;
                } else {
                    $scope.browserService = MarketBrowserService;
                    $scope.isMarketBrowserService = true;
                }
                console.log('Initializing browser using %s', $scope.browserService.id);
                // Settings
                $scope.browserSettings = Settings[$scope.browserService.id];
                if (!$scope.browserSettings.viewMode) {
                    setViewMode($scope.browserService.defaultViewMode);
                }
                $scope.viewMode = {
                    line: {id: 'line', icon: icons.browser.viewModeTile, text: 'BROWSER.VIEW_MODE_TILE'},
                    tile: {id: 'tile', icon: icons.browser.viewModeLine, text: 'BROWSER.VIEW_MODE_LINE'}
                };
                bindHotkeys();
                if ($scope.browserService.dataResource === 'object') {
                    $scope.keyHistory = {
                        back: [],
                        forward: []
                    };
                }
                setItemKey($routeParams.itemKey);
                $scope.parent = undefined;
                $scope.children = undefined;
                $scope.allChildrenMimeTypes = [];
                $scope.selectedElements = undefined;
                $scope.icons = icons;
                $scope.ortolangType = ortolangType;
                // Breadcrumb
                $scope.breadcrumbParts = undefined;
                $scope.breadcrumbDropdownItems = [];
                // Context Menu
                $scope.isContextMenuActive = false;
                $scope.contextMenuItems = [];
                // Filter
                $scope.orderProp = ['type', 'name'];
                $scope.dateFormat = 'short';
                $scope.reverse = false;
                // Visualizers
                $scope.visualizers = undefined;
                // Workspace
                $scope.isScreenMd = false;
                $scope.displayedItemLimit = initialDisplayedItemLimit;
                $scope.Content = Content;
            }

            function setPath(path) {
                $scope.path = path;
                if ($scope.isWorkspaceBrowserService) {
                    $location.search('path', path);
                }
            }

            function setRoot(root) {
                $scope.root = root;
                $scope.isHead = $scope.root === 'head';
                if ($scope.isWorkspaceBrowserService) {
                    $location.search('root', root);
                }
            }

            function setItemKey(key) {
                $scope.itemKey = key;
                if ($scope.isMarketBrowserService) {
                    $location.search('key', key);
                    $location.search('history', btoa(angular.toJson($scope.keyHistory.back)));
                }
            }

            function initWorkspaceVariables(workspace, root, path) {
                if (workspace) {
                    $scope.browserService.workspace = workspace;
                }
                $scope.browserSettings.wskey = $scope.browserService.workspace.key;
                Settings.store();
                if ($scope.isWorkspaceBrowserService) {
                    $location.search('alias', $scope.browserService.workspace.alias);
                }
                setRoot(root || 'head');
                setPath(path || '/');
                $scope.getSnapshotsHistory();
                getParentData();
                console.log('Browsing workspace "%s"', $scope.browserService.workspace.name);
            }

            function init() {
                initLocalVariables();
                initScopeVariables();
                populateBreadcrumbDropdownMenu();
                if ($scope.itemKey) {
                    if ($location.search().key && $location.search().history) {
                        $scope.itemKey = $location.search().key;
                        $scope.keyHistory.back = angular.fromJson(atob($location.search().history));
                    }
                    getParentData();
                } else {
                    $scope.$on('initWorkspaceVariables', function () {
                        initWorkspaceVariables(undefined, $location.search().root, $location.search().path);
                    });
                    if (!$scope.isFileSelectBrowserService) {
                        initWorkspaceVariables(undefined, $location.search().root, $location.search().path);
                    }
                }
            }
            init();

        }]);
