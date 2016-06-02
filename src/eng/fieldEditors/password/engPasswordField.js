'use strict';

angular.module('engModule')

.directive('engPasswordField',['engCommonFields',function(engCommonFields) {
    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/fieldEditors/password/engPasswordField.html',
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