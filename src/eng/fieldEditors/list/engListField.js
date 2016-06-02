'use strict';

angular.module('engModule')

.directive('engListField',['engCommonFields','engApplication','$timeout','datastore','$mdSidenav',
    function(engCommonFields,engApplication,$timeout,datastore,$mdSidenav) {

    var SHIFT_INDEXES = {'UP' : -1,
                         'DOWN' : 1};

    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/fieldEditors/list/engListField.html',
        transclude: true,
        scope: {
            fieldModel: '=',
            beanModel: '='
        },
        controller: ['$scope','$element','$transclude','$compile',function($scope, $element, $transclude, $compile) {

            var itemBeanHtml = ["<div layout-padding><div ng-repeat=\"itemBeanPropertyModel in fieldModel.itemBean.properties\">",
                "<field-editor property-model=\"itemBeanPropertyModel\" bean-model=\"engListFieldElement\">",
                "</field-editor>",
                "</div></div>"].join("");

            var innerScope = null;

            var show = function() {
                remove();
                var content = $element.find('.itemEditor');

                if ($scope.fieldModel.itemBean) {

                    var newChildScope = $scope.$new();
                    var compiledEl = $compile(itemBeanHtml)(newChildScope);
                    content.append(compiledEl);
                    innerScope = newChildScope;
                    innerScope.engListFieldElement = $scope.selectedElement;

                } else {
                    $transclude(function(transEl, transScope) {
                        content.append(transEl);
                        innerScope = transScope;
                        innerScope.engListFieldElement = $scope.selectedElement;
                    });
                }
            };

            var remove = function() {
                var content = $element.find('.itemEditor');
                content.empty();
                if (innerScope) {
                    innerScope.$destroy();
                    innerScope = null;
                }
            };

            $scope.$watch('selectedElement',function(newVal,oldVal){
                if (newVal) {
                    show();
                } else {
                    remove();
                }
            });

        }],
        link : function(scope, element, attrs) {
            engCommonFields.link(scope);

            var propName = scope.fieldModel.propertyName;

            var init = function() {
                scope.$watch('beanModel',function(beanModel,oldVal){
                    if (beanModel) {
                        var val = beanModel[propName];
                        if (val==null || !angular.isArray(val)) {
                            beanModel[propName] = [];
                        }
                    }
                });
            };

            var emitOnChange = function() {
                scope.$emit("engFieldChange",{
                    fieldChanged: scope.fieldModel
                });
            };

            scope.itemsNumber = function() {
                var val = scope.value();
                return val?val.length:0;
            };

            scope.elementTemplate = function(listElement) {
                if (scope.fieldModel.elementTemplate) {
                    return scope.fieldModel.elementTemplate;
                }
                return "{{element}}";
            };

            scope.addElement = function() {
                var newElement = {};
                var val = scope.getValue();
                if (!val) {
                    scope.setValue(val = []);
                }
                val.push(newElement);
                emitOnChange();
                scope.selectElement(newElement);
            };

            scope.closeItemEditor = function() {
                scope.selectedElement = null;
            };

            scope.deleteSelectedItem = function() {
                scope.deleteElement(scope.selectedElement);
            };

            scope.selectElement = function(element) {
                if (scope.fieldModel.elementEditActivity) {

                    engApplication.openActivity(scope.fieldModel.elementEditActivity,{
                        editItem: element,
                        persister: {
                            save: function(editItem,activity) {
                                return engApplication.closeCurrentActivity()
                                    .then(function() {
                                        return engApplication.getCurrentActivity().$scope.doStartSave();
                                    });
                            },
                            'delete': function(editItem,activity) {
                                scope.deleteElement(editItem);
                                engApplication.closeCurrentActivity();
                            },
                            onChange: function(evt,activity) {
                                evt.stopPropagation();
                                emitOnChange();
                            }
                        }
                    });

                } else {
                    scope.selectedIndex = scope.getValue().indexOf(element)+1;
                    scope.selectedElement = element;
                }
            };

            scope.deleteElement = function(element) {
                var index = scope.getValue().indexOf(element);
                if (index!=-1) {
                    scope.getValue().splice(index,1);
                    scope.selectedElement = null;
                    emitOnChange();
                }
            };

            scope.selectDefaultElement = function() {
                emitOnChange();
            };

            scope.sortElement = function(element, sortDirection) {
                var elements = scope.getValue();
                var index = elements.indexOf(element);
                if (index!=-1) {
                    var shiftIndex = index + SHIFT_INDEXES[sortDirection];
                    elements[shiftIndex] = elements.splice(index, 1, elements[shiftIndex])[0];
                    emitOnChange();
                }
            };

            scope.closeEditor = function() {
                scope.selectedElement = null;
                scope.selectedIndex = -1;
            };

            init();
        }
    };
}])

/**
 * Direttiva per la configurazione di un campo di tipo lista
 */
    .directive('engListFieldConfigDir',[function(){
        return {
            restrict: 'E',
            scope: {
                propertyModel: "="
            },
            templateUrl: '/eng-app-src/eng/fieldEditors/list/engListFieldConfigDir.html',
            link : function(scope, element, attrs) {

            }
        };
    }])

;