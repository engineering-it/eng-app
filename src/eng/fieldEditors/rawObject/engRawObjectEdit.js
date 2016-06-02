'use strict';

angular.module('engModule')

    /**
     * Direttiva che mostra un editor json dell'oggetto.
     * Not yet implemented.
     */
    .directive('engRawObjectEdit',['engCommonFields',function(engCommonFields) {
    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/fieldEditors/rawObject/engRawObjectEdit.html',
        scope: {
            fieldModel: '=',
            beanModel: '='
        },
        link : function(scope, element, attrs) {
            engCommonFields.link(scope);

            var init = function() {
            };

            init();
        }
    };
}])

;