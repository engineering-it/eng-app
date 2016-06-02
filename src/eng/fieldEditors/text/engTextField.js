'use strict';

angular.module('engModule')

.directive('engTextField',['engCommonFields',function(engCommonFields) {
    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/fieldEditors/text/engTextField.html',
        scope: {
            fieldModel: '=',
            beanModel: '='
        },
        link : function(scope, element, attrs) {
            engCommonFields.link(scope);
        }
    };
}])

/**
 * Direttiva per la configurazione del campo di testo
 */
.directive('engTextFieldConfigDir',[function(){
    return {
        restrict: 'E',
        scope: {
            propertyModel: "="
        },
        templateUrl: '/eng-app-src/eng/fieldEditors/text/engTextFieldConfigDir.html',
        link : function(scope, element, attrs) {
        }
    };
}])

;