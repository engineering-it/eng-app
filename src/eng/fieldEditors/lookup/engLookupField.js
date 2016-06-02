'use strict';

angular.module('engModule')

.directive('engLookupField',['engCommonFields','engApplication','$timeout','datastore',
    function(engCommonFields,engApplication,$timeout,datastore) {
    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/fieldEditors/lookup/engLookupField.html',
        scope: {
            fieldModel: '=',
            beanModel: '='
        },
        link : function(scope, element, attrs) {
            scope.lookupFieldValue = [];
            engCommonFields.link(scope);

            var propName = scope.fieldModel.propertyName;
            var multiple = scope.fieldModel.multiple;

            scope.lookupKey = scope.fieldModel.lookupKey||'id';
            scope.lookupShowedProperty = scope.fieldModel.lookupShowedProperty||scope.lookupKey;

            var init = function() {
                if (multiple) {
                    if (scope.beanModel && scope.beanModel[propName]==null) {
                        scope.beanModel[propName] = [];
                    }
                }
                scope.$watchCollection('getValue()', function(newValue, oldValue) {
                    refreshViewValue(newValue);
                });
            };

            var refreshViewValue = function(update) {
                if (Array.isArray(update)) {
                    scope.lookupFieldValue = wrapArrayElements(update);
                } else {
                    scope.lookupFieldValue = wrapArrayElements(update?[update]:[]);
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

            scope.onLookupSearchClick = function () {
                var listActivity = scope.fieldModel.refEntityListActivity;
                engApplication.openActivity(listActivity, {
                    find2: true,
                    onFind2Result: function (result) {
                        var lookupKeyValue = result[scope.lookupKey];
                        if (multiple) {
                            var arr = scope.beanModel[propName];
                            if (!Array.isArray(arr)) {
                                scope.setValue(arr = []);
                            }
                            arr.push(lookupKeyValue);
                            scope.$emit("engFieldChange",{
                                fieldChanged: scope.fieldModel
                            });
                        } else {
                            scope.setValue(lookupKeyValue);
                            scope.$emit("engFieldChange",{
                                fieldChanged: scope.fieldModel
                            });
                        }
                    }
                });
            };

            scope.chipClick = function(event,index,chip) {
                event.preventDefault();
                console.log("chip clicked",chip);
                var viewActivity = scope.fieldModel.refEntityViewActivity;
                if (viewActivity) {
                    datastore.getEntityById(scope.fieldModel.refEntityName,{
                        keyName: scope.lookupKey,
                        keyValue: chip.val
                    }).then(function(entityBean){
                        engApplication.openActivity(viewActivity, {
                            editItem: entityBean
                        });
                    });
                }
            };

            scope.chipRemove = function(event,index) {
                event.preventDefault();
                if (multiple) {
                    scope.getValue().splice(index,1);
                } else {
                    scope.setValue(null);
                }
                scope.$emit("engFieldChange",{
                    fieldChanged: scope.fieldModel
                });
                $timeout(function(){
                    refreshViewValue(scope.getValue());
                },10);
            };

            init();
        }
    };

}])

/**
 * Direttiva per la configurazione del campo di lookup
 */
.directive('engLookupFieldConfigDir',['datastore',function(datastore){
    return {
        restrict: 'E',
        scope: {
            propertyModel: "="
        },
        templateUrl: '/eng-app-src/eng/fieldEditors/lookup/engLookupFieldConfigDir.html',
        link : function(scope, element, attrs) {

            scope.$watch('propertyModel.refEntityName',function(newVal,oldVal){
                if (newVal) {
                    datastore.getEntityById('entities',{keyName:'name',keyValue:newVal})
                        .then(function(entityDef) {
                            if (entityDef) {
                                var vals = [];
                                entityDef.properties.forEach(function(val){
                                    vals.push({
                                        text: val.propertyLabel||val.propertyName,
                                        value: val.propertyName
                                    });
                                });
                                scope.entityProperties = vals;
                            }
                        });
                } else {
                    scope.entityProperties = [];
                }
            });

        }
    };
}])

;