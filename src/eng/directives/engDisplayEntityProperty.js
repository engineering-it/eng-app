'use strict';

angular.module('engModule')

    /**
     * Direttiva che mostra a video il valore della proprietà di un bean
     * applicando la visualizzazione migliore:
     * lookuppando il valore se è un lookup,
     * applicando filtri di date se è una date ecc..
     *
     * usa la definizione dell'entità per risalire alla descrizione del tipo di campo
     *
     * supporta anche l'attributo show-label per mostrare anche la label della proprietà
     *
     */
    .directive('engDisplayEntityProperty',['$compile','$filter','datastore','$q',function($compile,$filter,datastore,$q) {

        var getEntityModel = function(entityModel) {
            if (!entityModel) {
                return $q.when(null);
            } if (angular.isString(entityModel)) {
                return datastore.getEntityById('entities',{keyName:'name',keyValue:entityModel});
            } if (entityModel.properties) {
                return $q.when(entityModel);
            } else {
                return $q.when(null);
            }
        };

        var getPropertyDef = function(propertyName,entityModel) {
            return getEntityModel(entityModel).then(function(entityModelBean){
                if (entityModelBean && entityModelBean.properties) {
                    for (var i = 0; i < entityModelBean.properties.length; i++) {
                        var pm = entityModelBean.properties[i];
                        if (pm.propertyName == propertyName) {
                            return pm;
                        }
                    }
                }
                return null;
            });
        };

        var formatValue = function(propertyDef,propertyName,value,showLabel) {
            var labelvalue = (propertyDef && propertyDef.propertyLabel)?propertyDef.propertyLabel:propertyName;
            var label = showLabel?(labelvalue+": "):"";
            var textValue = value;
            if (angular.isDate(value)) {
                textValue = $filter('date')(value,"shortDate");
            }
            if (angular.isArray(value)) {
                textValue = value.join(",");
            }
            return label+textValue;
        };

        return {
            restrict: 'AE',
            template: "{{textValue}}",
            scope: {
                entityBean: "=",
                entityModel: "=",
                propertyName: "="
            },
            link: function(scope,element,attrs) {

                scope.textValue="";
                var actualValue = scope.entityBean[scope.propertyName];
                if (actualValue==null || actualValue==="") {
                    return;
                }

                var propName = scope.propertyName;
                var showLabel =  attrs.showLabel;
                getPropertyDef(propName,scope.entityModel).then(function(propertyDef){

                    if (propertyDef) {
                        if (propertyDef.propertyType==='LOOKUP') {
                            var lookupEntity = propertyDef.refEntityName;
                            var lookupBy = propertyDef.lookupKey?propertyDef.lookupKey:'id';
                            var lookupField = propertyDef.lookupShowedProperty?propertyDef.lookupShowedProperty:'name';
                            var multiple = propertyDef.multiple;

                            if (multiple) {

                                var lookups = [];
                                actualValue.forEach(function(item){
                                    lookups.push(datastore
                                        .getEntityProperty(lookupEntity,{
                                            keyName: lookupBy,
                                            keyValue: item
                                        },lookupField));
                                });
                                $q.all(lookups).then(function(values){
                                    console.log(values);
                                    scope.textValue = formatValue(propertyDef,propName,values,showLabel);
                                });

                            } else {
                                datastore
                                    .getEntityProperty(lookupEntity,{
                                        keyName: lookupBy,
                                        keyValue: actualValue
                                    },lookupField)
                                    .then(function(val){
                                        scope.textValue = formatValue(propertyDef,propName,val,showLabel);
                                    },function(reason){
                                        scope.textValue = formatValue(propertyDef,propName,"??"+actualValue,showLabel);
                                    });
                            }
                            return;
                        }
                    }
                    scope.textValue = formatValue(propertyDef,propName,actualValue,showLabel);

                });
            }
        };

    }])

;
