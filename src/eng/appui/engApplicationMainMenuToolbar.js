'use strict';

angular.module('engModule')

/**
 * Direttiva che gestisce la toolbar
 * dell menu principale dell'applicazione
 */
.directive('engApplicationMainMenuToolbar',[function() {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/eng-app-src/eng/appui/engApplicationMainMenuToolbar.html'
    }
}]);

;
