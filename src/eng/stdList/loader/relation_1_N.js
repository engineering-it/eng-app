'use strict';

angular.module('engModule')

    /**
     * Blocco di registrazione del Loader
     */
    .config(['listLoadersRegistryProvider',function(listLoadersRegistryProvider){

        listLoadersRegistryProvider.registerLoader("relation_1_N",{
            label: "Relazione 1->n",
            description: "Loader per entità di dettaglio del 'mainObject' della Pagina corrente",
            service: "relation_1_NLoader",
            configDirective: "relation1NLoaderConfigDir"
        });

    }])

    /*
     * Loader default per l'Activity StdList
     */
    .factory('relation_1_NLoader',['datastore',function(datastore){

        var getPageMainObject = function(activity) {
            if (!activity.page || !activity.page.mainObject) {
                console.error("Il loader usato ha bisogno di un mainObject nella pagina, non trovato");
                return {};
            }
            return activity.page.mainObject;
        };

        var getInstance = function(activity) {

            var loaderConfig = activity.activityDef.loaderConfig;
            var parentRelationName = loaderConfig.parentRelationName;

            return {
                onInit: function(entityName,activity){
                    activity.$scope.$on("mainObjectChanged",function(){
                        activity.$scope.search();
                    });
                },
                loadData: function(entityName,filters,activity) {
                    var f = filters||{};
                    var mainObject = getPageMainObject(activity);
                    f["relation#"+parentRelationName+"#source"]= mainObject.id?mainObject.id:mainObject;
                    return datastore.retrieveData(entityName,filters);
                }
            };
        };

        return {
            getInstance: getInstance
        };
    }])

    .directive('relation1NLoaderConfigDir',[function() {
        return {
            restrict: 'E',
            scope: {
                loaderConfig: "="
            },
            templateUrl: '/eng-app-src/eng/stdList/loader/relation_1_NLoaderConfigDir.html',
            link: function (scope, element, attrs) {
            }
        };
    }])

;