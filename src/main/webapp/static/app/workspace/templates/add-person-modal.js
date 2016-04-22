'use strict';

/**
 * @ngdoc function
 * @name ortolangMarketApp.controller:AddPersonCtrl
 * @description
 * # AddPersonCtrl
 * Controller of the ortolangMarketApp
 */
angular.module('ortolangMarketApp')
    .controller('AddPersonCtrl', ['$scope', '$filter', 'Helper', 'ReferentialEntityResource', '$q', 
    	function ($scope, $filter, Helper, ReferentialEntityResource, $q) {

            $scope.submit = function (addContributorForm) {
            	
                if ($scope.models.firstname) { //TODO not set
                    addContributorForm.firstname.$setValidity('exists', true);
                } else {
                    addContributorForm.firstname.$setValidity('exists', false);
                }

                if (!personExists($scope.models, $scope.contributors)) {
                    addContributorForm.fullname.$setValidity('exists', true);
                } else {
                    addContributorForm.fullname.$setValidity('exists', false);
                }

                if ($scope.models.roleTag.length > 0) {
                    addContributorForm.roleTag.$setValidity('role', true);
                } else {
                    addContributorForm.roleTag.$setValidity('role', false);
                }

                if (addContributorForm.$valid) {
                    var contributor = {entity: {}, roles: []};

                    setPerson(contributor, $scope);

                    setRoles(contributor, $scope);

                    if ($scope.contributors === undefined) {
                        $scope.contributors = [];
                        $scope.metadata.contributors = [];
                    }

                    $scope.contributors.push(contributor);

                    var roles = [];
                    angular.forEach(contributor.roles, function (role) {
                        roles.push('${' + role.id + '}');
                    });
                    // if(angular.isDefined(contributor.entity.rid)) {
                    if (angular.isDefined(contributor.entity.key)) {
                        $scope.metadata.contributors.push({entity: '${' + contributor.entity.key + '}', roles: roles, organization: contributor.entity.organization});
                    } else {
                        $scope.metadata.contributors.push({entity: contributor.entity, roles: roles, organization: contributor.entity.organization});
                    }

            		Helper.hideModal();
                }
            }

            $scope.suggestPerson = function (term) {
            	if(term.length<2 || angular.isObject(term)) {
                    return [];
                }
                var deferred = $q.defer();
                ReferentialEntityResource.get({type: 'PERSON', lang:'FR', term: term}, function(results) {
                    var suggestedPersons = [];
                    angular.forEach(results.entries, function(refentity) {
                        var content = angular.fromJson(refentity.content);
                        
                        suggestedPersons.push({
                            key: refentity.key,
                            value: content.fullname,
                            id: content.id,
                            fullname: content.fullname,
                            lastname: content.lastname,
                            firstname: content.firstname,
                            midname: content.midname,
                            org: content.organization,
                            type: content.type,
                            label: '<span>' + content.fullname + '</span>'
                        });
                    });
                    deferred.resolve(suggestedPersons);
                }, function (reason) {
                    deferred.reject([]);
                });
                return deferred.promise;
            };

            $scope.clearSearch = function () {
                $scope.models = {};
                $scope.models.roleTag = [];
                $scope.searchPerson = '';
            };

            function setPerson(contributor, modalScope) {
                contributor.entity.lastname = modalScope.models.lastname;
                contributor.entity.rid = modalScope.models.rid;
                contributor.entity.key = modalScope.models.key;
                contributor.entity.firstname = modalScope.models.firstname;
                contributor.entity.midname = modalScope.models.midname;

                // if (angular.isDefined(modalScope.organization) && modalScope.organization.originOrganizationFullname === modalScope.models.organizationFullname) {
                    // contributor.entity.organization = modalScope.organization;
                    // contributor.entity.organization = '${' + modalScope.organization.key + '}';
                    contributor.entity.organization = modalScope.organization;
                // }

                contributor.entity.fullname = getFullnameOfPerson(contributor.entity);
            }

            function getFullnameOfPerson(person) {
                var fullname = person.firstname;
                fullname += angular.isDefined(person.midname) ? ' ' + person.midname : '';
                fullname += ' ' + person.lastname;
                return fullname;
            }

            function setRoles(contributor, myScope) {
                contributor.roles = [];
                angular.forEach(myScope.models.roleTag, function (tag) {
                    contributor.roles.push(tag);
                });
            }

            function personExists(contributor, contributors) {
                if (angular.isDefined(contributor.fullname) && angular.isDefined(contributors)) {
                    var iContributor;
                    for (iContributor = 0; iContributor < contributors.length; iContributor++) {
                        if (angular.isDefined(contributors[iContributor].entity.key) && angular.isDefined(contributor.key)) {
                            if (contributors[iContributor].entity.key === contributor.key) {
                                return true;
                            }
                        } else {
                            if (contributors[iContributor].entity.fullname === contributor.fullname) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }

            function init() {
            	$scope.newPerson = false;
            	$scope.createPerson = function () {
                    $scope.newPerson = true;
                };
                $scope.searchPerson = '';
                $scope.searchRole = '';

                $scope.models = {};
                $scope.models.roleTag = [];
                // $scope.allRoles = $scope.models.allRoles;
                $scope.$on('ta-search-person.select', function (v, i) {
                    $scope.models.rid = i.rid;
                    $scope.models.key = i.key;
                    $scope.models.lastname = i.lastname;
                    $scope.models.firstname = i.firstname;
                    $scope.models.midname = i.midname;
                    if (angular.isDefined(i.org)) {
                        var orgFound = $filter('filter')($scope.allOrganizations, {key:Helper.extractKeyFromReferentialId(i.org)}, true);
                        if (orgFound.length > 0) {
                            $scope.models.organizationFullname = orgFound[0].fullname;
                            // $scope.models.originOrganizationFullname = orgFound[0].fullname;
                        }
                        $scope.organization = i.org;
                    } else {
                    	$scope.models.organizationFullname = '';
                    	$scope.organization = {};
                    }
                    $scope.models.fullname = i.fullname;

                    $scope.$apply();
                });

                $scope.models.organizationFullname = '';
                // $scope.allOrganizations = $scope.allOrganizations;

                $scope.$on('taorg.select', function (v, i) {
                    $scope.organization = "${" + i.key + "}";
                    // $scope.organizationKey = i.key;
                    $scope.models.organizationFullname = i.org.fullname;

                    $scope.$apply();
                });
            }
            init();
    }]);