'use strict';

angular.module('configModule')

	.controller('ThemeEditCtrl',
		['$scope','engThemingService', function($scope,engThemingService) {

			
			var init = function() {
                $scope.activity.actions.push({
                	icon: 'panorama',
                    tooltip: 'Applica le modifiche',
                    fn: function() {
                    	doApplyTheme();
                    }
                });

                $scope.activity.wrapActivityAction('saveAction', function(superSaveFunction) {
                	return superSaveFunction().then(function() {
                		engThemingService.register($scope.editItem);
                	});
                });

                $scope.activity.wrapActivityAction('deleteAction', function(superDeleteFunction) {
                	return superDeleteFunction().then(function() {
                		engThemingService.unregister($scope.editItem);
                	});
                });
            };

            var doApplyTheme = function() {
            	//TODO
            	console.log($scope.editItem);
            };

            init();
		}])
;