'use strict';

angular.module('engModule')

    .directive('engDefinitionField',['engCommonFields',function(engCommonFields) {
        return {
            restrict: 'E',
            templateUrl: '/eng-app-src/eng/fieldEditors/definition/engDefinitionField.html',
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