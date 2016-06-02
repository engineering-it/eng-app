'use strict';

angular.module('engModule')

    /**
     * Blocco di registrazione del Persister
     */
    .config(['editPersistersRegistryProvider',function(editPersistersRegistryProvider){

        editPersistersRegistryProvider.registerPersister("relation_1_1",{
            label: "Relazione 1->1",
            description: "Persister che salva e carica una entità come dettaglio collegato 1-1 al mainObject della pagina in cui si trova l'activity",
            service: "relation_1_1Persister",
            configDirective: "relation11PersisterConfigDir"
        });

    }])

    /*
     * Persister che salva e carica una entità come dettaglio collegato 1-1
     * al mainObject della pagina in cui si trova l'activity
     */
    .factory('relation_1_1Persister',['datastore',function(datastore){

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
                onInit : function(activity) {
                    activity.$scope.$on("mainObjectChanged",function(){
                        activity.$scope.loadEditItem();
                    });
                },
                load: function(editItem,activity) {
                    if (!editItem) {

                        var filters = {};
                        filters[innerPropertyRelation] = getPageMainObject(activity).id;

                        return datastore.retrieveData(activity.activityDef.entity,filters).then(function(res){
                            if (res.length>0) {
                                return res[0];
                            } else {
                                var newEditItem = {};
                                newEditItem[innerPropertyRelation] = getPageMainObject(activity).id;
                                return newEditItem;
                            }
                        });
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

    .directive('relation11PersisterConfigDir',[function() {
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