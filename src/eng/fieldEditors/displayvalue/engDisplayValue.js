'use strict';

angular.module('engModule')

    .directive('engDisplayValue',['engCommonFields','engApplication','$timeout','datastore','$mdSidenav',
        function(engCommonFields,engApplication,$timeout,datastore,$mdSidenav) {
            return {
                restrict: 'E',
                templateUrl: '/eng-app-src/eng/fieldEditors/displayvalue/engDisplayValue.html',
                transclude: true,
                scope: {
                    fieldModel: '=',
                    beanModel: '='
                },
                controller: ['$scope','$element','$transclude',function($scope, $element, $transclude) {
                }],
                link : function(scope, element, attrs) {
                    engCommonFields.link(scope);

                    var findActivity = function(scope) {
                        if (scope.activity) {
                            return scope.activity;
                        } else if (scope.$parent) {
                            return findActivity(scope.$parent);
                        }
                        return null;
                    };

                    var init = function() {
                        scope.bean = scope.beanModel;
                        scope.activity = findActivity(scope);
                        scope.page = scope.activity?scope.activity.page:null;
                    };

                    scope.displayTemplate = function() {
                        return scope.fieldModel.displayTemplate;
                    }

                    init();
                }
            };
        }])

    /**
     * Direttiva per la configurazione di un campo di tipo display
     */
    .directive('engDisplayValueConfigDir',[function(){
        return {
            restrict: 'E',
            scope: {
                propertyModel: "="
            },
            templateUrl: '/eng-app-src/eng/fieldEditors/displayvalue/engDisplayValueConfigDir.html',
            link : function(scope, element, attrs) {

            }
        };
    }])

;
