'use strict';

angular.module('engModule')

/**
 * Direttiva per il display di una proprietà di una particolare entità
 */
.directive('engLookupValue',['datastore',function(datastore) {

    var validateLookupConditions = function(scope) {
        return scope.entityName && (scope.lookupField || scope.lookupFields);
    };

    var getDatastoreEntityFunction = function(scope) {
        var result;
        if (scope.lookupField) {
            result = datastore
                         .getEntityProperty(scope.entityName,{
                             keyName: scope.lookupBy||'id',
                             keyValue: scope.lookupWith
                         },scope.lookupField);
        } else if (scope.lookupFields) {
            result = datastore
                         .getEntityProperties(scope.entityName,{
                             keyName: scope.lookupBy||'id',
                             keyValue: scope.lookupWith
                         },scope.lookupFields.split(",")
                          ,scope.lookupFieldsSeparator ? scope.lookupFieldsSeparator : " ");
        }
        return result;
    };

    return {
        restrict: 'E',
        template: '{{htmlValue}}',
        scope: {
            entityName: '=',
            lookupBy: '=',
            lookupWith: '=',
            lookupField: '=',
            lookupFields: '=',
            lookupFieldsSeparator: '='
        },
        link : function(scope, element, attrs) {

            //short circuit if lookupBy===lookupField ??

            scope.htmlValue = "...";
            if (validateLookupConditions(scope)) {
                getDatastoreEntityFunction(scope).then(function(val){
                                                     scope.htmlValue = val;
                                                 },function(reason){
                                                     scope.htmlValue = "??"+scope.lookupWith;
                                                 });
            } else {
                scope.htmlValue = entityId;
            }

        }
    };
}])

;