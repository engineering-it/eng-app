'use strict';

angular.module('engModule')

/**
 * Direttiva per un componente che faccia editare un oggetto
 * di tipo PropertyModel, che è il bean di definizione di una proprietà
 */
.directive('fieldTypeEditor',['fieldsEditors',function(fieldsEditors) {
    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/fieldEditors/type/fieldTypeEditor.html',
        scope: {
            propertyModel: '=',
        },
        link : function(scope, element, attrs) {

            scope.propertyTypes = [];
            scope.propertyTypeConfigDirective = null;

            var init = function() {
                angular.forEach(fieldsEditors.getFieldEditors(),function(val,key){
                    scope.propertyTypes.push({
                        value: key,
                        text: val.shortName||key,
                        tooltip: val.tooltip
                    });
                });
                scope.$watch('propertyModel.propertyType',function(newVal,oldVal){
                    if (newVal) {
                        var fieldEditorConfig = fieldsEditors.getFieldEditor(newVal);
                        scope.propertyTypeConfigDirective = fieldEditorConfig.configDirective;
                    } else {
                        scope.propertyTypeConfigDirective = null;
                    }
                });
            };

            init();
        }
    };
}])

;