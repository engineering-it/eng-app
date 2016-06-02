'use strict';

angular.module('engModule')

    .directive('engNumberField',['engCommonFields',function(engCommonFields) {
        return {
            restrict: 'E',
            templateUrl: '/eng-app-src/eng/fieldEditors/number/engNumberField.html',
            scope: {
                fieldModel: '=',
                beanModel: '='
            },
            link : function(scope, element, attrs) {
                engCommonFields.link(scope);

                scope.isFieldDisabled = function() {
                    return scope.fieldModel.disabled;
                };
            }
        };
    }])

    /**
     * Direttiva per la configurazione del campo numerico
     */
    .directive('engNumberFieldConfigDir',[function(){
        return {
            restrict: 'E',
            scope: {
                propertyModel: "="
            },
            templateUrl: '/eng-app-src/eng/fieldEditors/number/engNumberFieldConfigDir.html',
            link : function(scope, element, attrs) {
            }
        };
    }])

;