'use strict';

angular.module('engModule')

    .directive('engReferenceBeanField',['engCommonFields','engApplication','$timeout','datastore','$mdSidenav',
        function(engCommonFields,engApplication,$timeout,datastore,$mdSidenav) {
            return {
                restrict: 'E',
                templateUrl: '/eng-app-src/eng/fieldEditors/referencebean/referenceBeanField.html',
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
                            val = {};
                            scope.beanModel[propName] = val;
                        }
                        scope.bean = val;
                    };

                    var emitOnChange = function() {
                        scope.$emit("engFieldChange",{
                            fieldChanged: scope.fieldModel
                        });
                    };

                    scope.onEditClick = function() {
                        engApplication.openActivity(scope.fieldModel.refEntityEditActivity,{
                            editItem: scope.getValue(),
                            persister: {
                                save: function(editItem,activity) {
                                    engApplication.closeCurrentActivity();
                                },
                                delete: function(editItem,activity) {
                                    scope.deleteBean();
                                    engApplication.closeCurrentActivity();
                                },
                                onChange: function(evt,activity) {
                                    evt.stopPropagation();
                                    emitOnChange();
                                }
                            }
                        });
                    };

                    scope.beanTemplate = function() {
                        if (scope.fieldModel.beanTemplate) {
                            return scope.fieldModel.beanTemplate;
                        }
                        return "{{bean}}";
                    };

                    scope.deleteBean = function() {
                        scope.setValue(null);
                    };

                    init();
                }
            };
        }])

    /**
     * Direttiva per la configurazione di un campo di tipo reference Bean
     */
    .directive('engReferenceBeanFieldConfigDir',[function(){
        return {
            restrict: 'E',
            scope: {
                propertyModel: "="
            },
            templateUrl: '/eng-app-src/eng/fieldEditors/referencebean/referenceBeanFieldConfigDir.html',
            link : function(scope, element, attrs) {

            }
        };
    }])

;
