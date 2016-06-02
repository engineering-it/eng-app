'use strict';

angular.module('engModule')

/**
 * Direttiva che gestisce il menu principale dell'applicazione
 */
.directive('engApplicationMainMenu',[function() {
    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/appui/engApplicationMainMenu.html',
        scope: {
            isOpen: '=',
            isFixed: '='
        },
        controller: ['$scope','$element','engApplication','engLoginManager','$mdSidenav','appResources',
            function($scope,$element,engApplication,engLoginManager,$mdSidenav,appResources) {

                var innerMenus = ['appMenu','searchMenu','profileMenu'];
                $scope.applicationMenu = [];

                var init = function()  {
                    engApplication.getPageDefs('pages').then(function(data){
                        $scope.applicationMenu = data;
                    });
                    $scope.$on('engPageOpened',function(){
                        $scope.togglePageMenu();
                    });
                };

                var closeInnerMenus = function(except) {
                    angular.forEach(innerMenus,function(m){
                        if (m!==except) {
                            $mdSidenav(m).close();
                        }
                    });
                };

                $scope.togglePageMenu = function() {
                    closeInnerMenus();
                };

                $scope.toggleSearchMenu = function() {
                    closeInnerMenus('searchMenu');
                    $mdSidenav('searchMenu').toggle();
                };

                $scope.toggleApplicationMenu = function() {
                    closeInnerMenus('appMenu');
                    $mdSidenav('appMenu').toggle();
                };

                $scope.toggleProfileMenu = function() {
                    closeInnerMenus('profileMenu');
                    $mdSidenav('profileMenu').toggle();
                };

                $scope.pageMenuItemClick = function (menuItem) {
                    engApplication.openRootActivity(menuItem.name);
                };

                $scope.appMenuItemClick = function (menuItem) {
                    engApplication.openRootPage(menuItem.name);
                };

                $scope.pageMenu = function () {
                    var cp = engApplication.getCurrentPage();
                    return cp?cp.getMenu():null;
                };

                $scope.currentUser = function () {
                    return engApplication.getLoggedUser();
                };

                $scope.isMenuEnabled = function() {
                    var curr = engApplication.getCurrentActivity();
                    if (curr && curr.activityDef.showMenu===false) {
                        return false;
                    }
                    return engApplication.getLoggedUser()!=null;
                };

                $scope.isPageMenuItemSelected = function(item) {
                    var currPage = engApplication.getCurrentPage();
                    var pageRootAct = currPage.activityStack.length>0? currPage.activityStack[0]:null;
                    return pageRootAct && pageRootAct.activityDef.name===item.name;
                };

                $scope.isLogged = function() {
                    return engLoginManager.getCurrentUser()!=null;
                };

                $scope.logout = function() {
                    engApplication.loading = true;
                    engLoginManager.setCurrentUser(null);
                    //$mdSidenav('left').close();
                    window.location.reload();
                };

                $scope.userImgSrc = function() {
                    return appResources.getDataUrl("imgs-default_user");
                };

                init();
            }]
    };
}])
;