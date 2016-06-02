'use strict';

angular.module('engModule')

    /**
     * Blocco di registrazione del Loader
     */
    .config(['listLoadersRegistryProvider',function(listLoadersRegistryProvider){

        listLoadersRegistryProvider.registerLoader("default",{
            label: "Default",
            description: "Loader di default per il retrieve di Entità",
            service: "stdListDefaultLoader"
        });

    }])

    /*
     * Loader default per l'Activity StdList
     */
    .factory('stdListDefaultLoader',['datastore',function(datastore){

        var getInstance = function() {
            return {
                onInit: function(){},
                loadData: function(entityName,filters,activity) {
                    return datastore.retrieveData(entityName,filters);
                }
            };
        };

        return {
            getInstance: getInstance
        };
    }])

;