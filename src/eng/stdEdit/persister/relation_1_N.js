'use strict';

angular.module('engModule')

    /**
     * Blocco di registrazione del Persister
     */
    .config(['editPersistersRegistryProvider',function(editPersistersRegistryProvider){

        editPersistersRegistryProvider.registerPersister("relation_1_N",{
            label: "Relazione 1->n",
            description: "Persister che salva entità 'nuove' (solo se sono nuove) come dettaglio collegato al mainObject della pagina in cui si trova l'activity",
            service: "relation_1_NPersister",
            configDirective: "relation1NPersisterConfigDir"
        });

    }])

    /*
     * Persister che salva entità "nuove" (solo se sono nuove) come dettaglio
     * collegato al mainObject della pagina in cui si trova l'activity
     */
    .factory('relation_1_NPersister',['datastore',function(datastore){

        var getPageMainObject = function(activity) {
            if (!activity.page || !activity.page.mainObject) {
                console.error("Il persister usato ha bisogno di un mainObject nella pagina, non trovato");
                return {};
            }
            return activity.page.mainObject;
        };

        var getInstance = function(activity) {

            var persisterConfig = activity.activityDef.persisterConfig;
            var parentRelationName = persisterConfig.parentRelationName;
            var innerPropertyRelation = "relation#"+parentRelationName+"#source";

            return {
                onInit: function(){},
                load: function(editItem,activity) {
                    if (!editItem) {
                        editItem = {};
                        editItem[innerPropertyRelation] = getPageMainObject(activity).id;
                    }
                    return editItem;
                },
                beforeSave: function(editItem,activity) {
                    return true;
                },
                save: function(editItem,activity) {
                    if (editItem[innerPropertyRelation]==null) {
                        editItem[innerPropertyRelation] = getPageMainObject(activity).id;
                    }
                    return datastore.saveEntity(activity.activityDef.entity,editItem);
                },
                delete: function(editItem,activity) {
                    return datastore.deleteEntity(activity.activityDef.entity,editItem);
                },
                onChange: function(evt,activity) {
                    activity.dirtyCheck = true;
                    evt.stopPropagation();
                }
            };
        };

        return {
            getInstance: getInstance
        };
    }])

    .directive('relation1NPersisterConfigDir',[function() {
        return {
            restrict: 'E',
            scope: {
                persisterConfig: "="
            },
            templateUrl: '/eng-app-src/eng/stdEdit/persister/relation_1_NPersisterConfigDir.html',
            link: function (scope, element, attrs) {
            }
        };
    }])

;