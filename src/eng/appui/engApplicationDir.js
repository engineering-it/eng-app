'use strict';

angular.module('engModule')

    /**
     * Direttiva Principale di visualizzazione dell'intera applicazione.
     */
    .directive('engApplication',[function() {
        return {
            restrict: 'E',
            templateUrl: '/eng-app-src/eng/appui/engApplicationDir.html',
            controller: ['$element', '$scope', '$mdSidenav', 'engApplication','engLoginManager','$timeout','engScheduler',
                function ($element, $scope, $mdSidenav, engApplication, engLoginManager, $timeout, engScheduler) {

                    $scope.appMenuLockMode = true;
                    $scope.appMenuLockOpened = false;
                    $scope.appMenuOpened = false;

                    $scope.engApplication = engApplication;
                    $element.hide();

                    var init = function() {
                        if (engApplication.getLoginPageDef()!=null) {
                            engLoginManager.checkLoggedUser().then(function(){
                                $element.show();
                            });
                        } else {
                            engApplication.openHomePage();
                            $element.show();
                        }

                        var openCloseMenu = engScheduler.makeScheduled(function(){

                            console.log("called openCloseMenu");
                            var act = engApplication.getCurrentActivity();
                            if (!act || act.activityDef.showMenu===false) {
                                closeMenu();
                            } else {
                                openMenu();
                            }
                        },1000);
                        $scope.$watch('currentActivity()',openCloseMenu);

                    };

                    $scope.currentActivity = function() {
                        return engApplication.getCurrentActivity();
                    };

                    var isOpenedMenu = function() {
                        return ($scope.appMenuLockOpened || $scope.appMenuOpened);
                    };

                    var openMenu = function() {
                        $scope.appMenuLockOpened = $scope.appMenuLockMode;
                        $scope.appMenuOpened = true;
                    };

                    var closeMenu = function() {
                        $scope.appMenuLockOpened = false;
                        $scope.appMenuOpened = false;
                    };

                    $scope.togglePageMenu = function() {
                        if (isOpenedMenu()) {
                            closeMenu();
                        } else {
                            openMenu();
                        }
                    };

                    $scope.isMenuEnabled = function() {
                        var curr = engApplication.getCurrentActivity();
                        if (curr && curr.activityDef.showMenu===false) {
                            return false;
                        }
                        return engApplication.getLoggedUser()!=null;
                    };

                    $timeout(function(){
                        init();
                    });

                }
            ]
        };
    }])

;