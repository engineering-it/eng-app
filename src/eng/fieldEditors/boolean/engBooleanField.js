'use strict';

angular.module('engModule')

.directive('engBooleanField',['engCommonFields',function(engCommonFields) {
    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/fieldEditors/boolean/engBooleanField.html',
        scope: {
            fieldModel: '=',
            beanModel: '='
        },
        link : function(scope, element, attrs) {
            engCommonFields.link(scope);
        }
    };
}])

;