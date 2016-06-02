'use strict';

angular.module('engModule')

    /**
     * Controller per l'activity Standard di Dashboard
     */
    .controller('StdDashboardCtrl',
        ['$scope','engApplication','datastore','$mdSidenav','$filter','engScheduler','$mdToast','$mdDialog','$q',
        function($scope,engApplication,datastore,$mdSidenav,$filter,engScheduler,$mdToast,$mdDialog,$q) {

            var def = $scope.activity.activityDef;
            var params = $scope.activity.params||{};

            var init = function() {
                $scope.activity.actions = [{
                    icon: 'dashboard',
                    tooltip: 'Configura questa Dashboard',
                    fn: function() {
                        doGoConfiguration();
                    }
                }];

                $scope.dashboardConfig = calcDashboardConfig();
                $scope.tiles = $scope.dashboardConfig.tiles;
            };

            var calcDashboardConfig = function() {
                var tiles = [];
                def.activities.forEach(function(act){
                    tiles.push({
                        activityName: act,
                        span: {
                            col: 2,
                            row: 2
                        }
                    });
                });
                return {
                    configurableActivities: def.activities,
                    tiles: tiles
                };
            };

            $scope.tileActivity = function(tile) {
                return tile.activity;
            };

            $scope.doTileActivityAction = function(tile,activityAction) {
                activityAction.fn();
            };

            var doGoConfiguration = function() {
                engApplication.openActivity('stdDashboardEditActivity',{
                    editItem : $scope.dashboardConfig,
                    persister : {
                        save: function(editItem) {
                            return engApplication.closeCurrentActivity();
                        },
                        delete: false,
                        onChange: function(evt) {
                            evt.stopPropagation();
                        }
                    }
                });
            };

            init();
        }])


    /**
     * Controller per l'activity Standard di Edit della configurazione Dashboard
     */
    .controller('StdEditDashboardCtrl',
        ['$scope','engApplication','datastore','$mdSidenav','$filter','engScheduler','$mdToast','$mdDialog','$q',
            function($scope,engApplication,datastore,$mdSidenav,$filter,engScheduler,$mdToast,$mdDialog,$q) {

            var init = function() {

            };

            init();
        }])
;
