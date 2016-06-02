'use strict';

angular.module('engModule')

.directive('engDateField',['engCommonFields',function(engCommonFields) {
    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/fieldEditors/date/engDateField.html',
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