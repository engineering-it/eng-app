'use strict';

angular.module('engModule')

.directive('engIconField',['engCommonFields','engApplication',function(engCommonFields,engApplication) {
    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/fieldEditors/icon/engIconField.html',
        scope: {
            fieldModel: '=',
            beanModel: '='
        },
        link : function(scope, element, attrs) {
            engCommonFields.link(scope);

            var propName = scope.fieldModel.propertyName;
            var multiple = scope.fieldModel.multiple;

            var init = function() {
                if (multiple) {
                    if (scope.beanModel && scope.beanModel[propName]==null) {
                        scope.beanModel[propName] = [];
                    }
                }
            };

            var wrapArrayElements = function(array) {
                var wrap = [];
                for (var i=0; i<array.length; i++) {
                    wrap.push({
                        val: array[i]
                    });
                }
                return wrap;
            };

            scope.onIconSearchClick = function () {
                engApplication.openActivity("develop.iconsList", {
                    find2: true,
                    onFind2Result: function (result) {

                        scope.beanModel[propName] = result?result.name:null;

                        scope.$emit("engFieldChange",{
                            fieldChanged: scope.fieldModel
                        });
                    }
                });
            };

            init();
        }
    };
}])

;