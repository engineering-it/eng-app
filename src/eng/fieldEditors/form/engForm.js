'use strict';

angular.module('engModule')

/**
 * Direttiva per il display di una form
 */
.directive('engForm',[function(){
    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/fieldEditors/form/engForm.html',
        transclude: true,
        link : function(scope, element, attrs) {
            scope.formName = attrs.name;
            scope.padding = attrs.padding!=='false';
        }
    };
}])

;