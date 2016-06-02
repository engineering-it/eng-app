'use strict';

angular.module('engModule')

    /**
     * Direttiva per la Toolbar principale dell'applicazione
     */
    .directive('engApplicationToolbar',[function() {
        return {
            restrict: 'E',
            templateUrl: '/eng-app-src/eng/appui/engApplicationToolbar.html',
            controller: ['$scope','$element','engApplication','engLoginManager','$mdSidenav',
                function($scope,$element,engApplication,engLoginManager,$mdSidenav) {

                    var init = function()  {
                        $element.css('display','block');
                        $scope.engApplication = engApplication;
                    };

                    $scope.loading = function() {
                        return engApplication.loading;
                    };

                    $scope.appTile = function () {
                        return engApplication.appTile;
                    };

                    $scope.navStack = function () {
                        /*
                        var result = [];
                        var ps = engApplication.getPagesStack();
                        for (var i=0; i<ps.length; i++) {
                            var page = ps[i];
                            result = result.concat(page.getActivityStack());
                        }
                        */
                        var cp = engApplication.getCurrentPage();
                        return cp!=null?cp.getActivityStack():[];
                    };

                    $scope.isCurrent = function(activity) {
                        var ca= engApplication.getCurrentActivity();
                        return ca!=null && ca===activity;
                    };

                    $scope.closeActivity = function() {
                        engApplication.closeCurrentActivity();
                    };

                    $scope.isBackEnabled = function() {
                        var curr = engApplication.getCurrentActivity();
                        if (curr && curr.activityDef.showBack===false) {
                            return false;
                        }
                        return true;
                    };

                    $scope.doActivityAction = function(activityAction) {
                        activityAction.fn();
                    };

                    $scope.isPageHeaderEnabled = function() {
                        return true;
                    };

                    $scope.currentPage = function() {
                        return engApplication.getCurrentPage();
                    };

                    init();
                }]
        };
    }])
;