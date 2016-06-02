'use strict';

angular.module('engModule')

    /**
     * Blocco di registrazione del Persister
     */
    .config(['editPersistersRegistryProvider',function(editPersistersRegistryProvider){

        editPersistersRegistryProvider.registerPersister("default",{
            label: "Default",
            description: "Persister di default per il salvataggio di una Entità",
            service: "stdEditDefaultPersister"
        });

    }])

    /*
     * Pesister default per l'Activity StdEdit
     */
    .factory('stdEditDefaultPersister',['datastore',function(datastore){

        var getInstance = function() {
            return {
                onInit: function(activity){},
                load: function(editItem,activity) {
                    return editItem||{};
                },
                beforeSave: function(editItem,activity) {
                    return true;
                },
                save: function(editItem,activity) {
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

;