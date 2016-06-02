'use strict';

angular.module('engModule')

    .directive('engChoiceField',['engCommonFields',function(engCommonFields) {
        return {
            restrict: 'E',
            templateUrl: '/eng-app-src/eng/fieldEditors/choice/engChoiceField.html',
            scope: {
                fieldModel: '=',
                beanModel: '='
            },
            link : function(scope, element, attrs) {
                engCommonFields.link(scope);

                var propName = scope.fieldModel.propertyName;
                var multiple = scope.fieldModel.multiple;

                var init = function() {
                    if (scope.beanModel[propName] == null) {
                        scope.beanModel[propName] = scope.fieldModel.defaultElementValue;
                    }
                };

                scope.choices = function() {
                    var vals = scope.fieldModel.choicesValues;
                    return angular.isFunction(vals)?vals():vals;
                };

                scope.isSelectedChoice = function(choice) {
                    var arr = scope.beanModel[propName];
                    return arr && arr.indexOf(choice.value)!=-1;
                };

                scope.toggleSelectionChoice = function(choice) {
                    var arr = scope.beanModel[propName];
                    if (!arr) {
                        arr=[];
                        scope.beanModel[propName] = arr;
                    }
                    var index = arr.indexOf(choice.value);
                    if (index!=-1) {
                        arr.splice(index,1);
                    } else {
                        arr.push(choice.value);
                    }
                };

                scope.clearSelection = function() {
                	delete scope.beanModel[propName];
                };

                init();
            }
        };
    }])

    /**
     * Direttiva per la configurazione di un campo di tipo choice
     */
    .directive('engChoiceFieldConfigDir',[function(){
        return {
            restrict: 'E',
            scope: {
                propertyModel: "="
            },
            templateUrl: '/eng-app-src/eng/fieldEditors/choice/engChoiceFieldConfigDir.html',
            link : function(scope, element, attrs) {

            }
        };
    }])

;