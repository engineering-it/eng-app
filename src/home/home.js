'use strict';

angular.module('homeModule')

    .controller('HomeCtrl',[ '$scope','engApplication','appResources','engModuleService',
        function($scope,engApplication,appResources,engModuleService) {

        var init = function() {
            $scope.activity.page;
            engApplication.getPageDefs().then(function(result){
                $scope.homeMenu = result;
            });
        };

        $scope.navigate = function (menuItem) {
            engApplication.openRootPage(menuItem.name);
        };

        $scope.pageImgSrc = function(item) {
            if (item.image) {
                return item.image;
            }
            if (item.imageResource) {
                return appResources.getDataUrl(item.imageResource);
            }
            return 'imgs/default_page_img.png';
        };

        $scope.showInHomePage = function(item) {
        	return engModuleService.showInHomePage(item);
        };

        init();
    }])

    .controller('PageHomeActivityCtrl',[ '$scope','engApplication',
        function($scope,engApplication) {

        var page;
        var init = function() {
            page = $scope.activity.page;
        };

        $scope.homeMenu = function () {
            return page.getActivityDefs()
        };

        $scope.navigate = function (menuItem) {
            engApplication.openRootActivity(menuItem.name);
        };

        $scope.pageImgSrc = function(item) {
            if (item.image) {
                return item.image;
            }
            if (item.imageResource) {
                return appResources.getDataUrl(item.imageResource);
            }
            return 'imgs/default_page_img.png';
        };

        init();
    }])


;