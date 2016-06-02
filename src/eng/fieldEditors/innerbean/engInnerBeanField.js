'use strict';

angular.module('engModule')

    .directive('engInnerBeanField',['engCommonFields','engApplication','$timeout','datastore','$mdSidenav',
        function(engCommonFields,engApplication,$timeout,datastore,$mdSidenav) {
            return {
                restrict: 'E',
                templateUrl: '/eng-app-src/eng/fieldEditors/innerbean/engInnerBeanField.html',
                transclude: true,
                scope: {
                    fieldModel: '=',
                    beanModel: '='
                },
                controller: ['$scope','$element','$transclude',function($scope, $element, $transclude) {
                }],
                link : function(scope, element, attrs) {
                    engCommonFields.link(scope);

                    var propName = scope.fieldModel.propertyName;

                    var init = function() {
                        var val = scope.beanModel[propName];
                        if (val==null) {
                            scope.beanModel[propName] = {};
                        }
                    };

                    var emitOnChange = function() {
                        scope.$emit("engFieldChange",{
                            fieldChanged: scope.fieldModel
                        });
                    };

                    init();
                }
            };
        }])

    /**
     * Direttiva per la configurazione di un campo di tipo inner Bean
     */
    .directive('engInnerBeanFieldConfigDir',[function(){
        return {
            restrict: 'E',
            scope: {
                propertyModel: "="
            },
            templateUrl: '/eng-app-src/eng/fieldEditors/innerbean/engInnerBeanFieldConfigDir.html',
            link : function(scope, element, attrs) {

            }
        };
    }])

;
