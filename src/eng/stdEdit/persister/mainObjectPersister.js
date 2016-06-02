'use strict';

angular.module('engModule')

    /**
     * Blocco di registrazione del Persister
     */
    .config(['editPersistersRegistryProvider',function(editPersistersRegistryProvider){

        editPersistersRegistryProvider.registerPersister("mainObjectPersister",{
            label: "Page Main Object",
            description: "Persister che gestisce l'entità mainObject della pagina in cui si trova l'activity",
            service: "mainObjectPersister",
            configDirective: "mainObjectPersisterConfigDir"
        });
        
        editPersistersRegistryProvider.registerPersister("mainObjectLinkPersister",{
            label: "Page Main Object Linked",
            description: "Persister che gestisce l'entità legata al mainObject della pagina in cui si trova l'activity",
            service: "mainObjectLinkPersister",
            configDirective: "mainObjectLinkPersisterConfigDir"
        });

    }])

    /*
     * Persister che salva e carica una entità come inner Bean del
     * mainObject della pagina in cui si trova l'activity, al salvataggio salva tutto il mainObject
     */
    .factory('mainObjectPersister',['datastore',function(datastore){

        var getPageMainObject = function(activity) {
            if (!activity.page || !activity.page.mainObject) {
                console.error("Il persister usato ha bisogno di un mainObject nella pagina, non trovato");
                return {};
            }
            return activity.page.mainObject;
        };

        var getInstance = function(activity) {

            var persisterConfig = activity.activityDef.persisterConfig;
            var mainObjectPropertyName = persisterConfig.mainObjectPropertyName;

            return {
                onInit : function(activity) {
                    activity.$scope.$on("mainObjectChanged",function(){
                        activity.$scope.loadEditItem();
                    });
                },
                load: function(editItem,activity) {
                    if (!editItem) {
                        var mainObject = getPageMainObject(activity);
                        editItem = mainObjectPropertyName?mainObject[mainObjectPropertyName]:mainObject;
                        if (!editItem) {
                            editItem = {};
                            if (mainObjectPropertyName) {
                                mainObject[mainObjectPropertyName] = editItem;
                            }
                        }
                    }
                    return editItem;
                },
                beforeSave: function(editItem,activity) {
                    return true;
                },
                save: function(editItem,activity) {
                    var mainObject = getPageMainObject(activity);
                    if (mainObjectPropertyName) {
                    	mainObject[mainObjectPropertyName] = editItem;
                    }
                    var entityName = activity.page.pageDef.mainObjectEntity||activity.activityDef.entity;
                    return datastore.saveEntity(entityName,mainObject);
                },
                'delete': function(editItem,activity) {
                    var mainObject = getPageMainObject(activity);
                    if (mainObjectPropertyName) {
                        mainObject[mainObjectPropertyName] = null;
                        return datastore.saveEntity(activity.activityDef.entity,mainObject);
                    } else {
                        return datastore.deleteEntity(activity.activityDef.entity,mainObject);
                    }
                },
                onChange: function(evt,activity) {
                    activity.dirtyCheck = true;                
                    evt.stopPropagation();
                    activity.page.$scope.$emit("activityChanged",activity);
                }
            };
        };

        return {
            getInstance: getInstance
        };
    }])

    .directive('mainObjectPersisterConfigDir',[function() {
        return {
            restrict: 'E',
            scope: {
                persisterConfig: "="
            },
            templateUrl: '/eng-app-src/eng/stdEdit/persister/mainObjectPersisterConfigDir.html',
            link: function (scope, element, attrs) {
            }
        };
    }])
    
    
    /*
     * Persister che salva e carica una entità come oggetto legato al mainObject della Pagina
     * Nel mainObject della pagina deve esistere una proprietà con l'id dell'oggetto editato
     * che viene tenuta sincronizzata con questo bean.
     */
    .factory('mainObjectLinkPersister',['datastore',function(datastore){

        var getPageMainObject = function(activity) {
            if (!activity.page || !activity.page.mainObject) {
                console.error("Il persister usato ha bisogno di un mainObject nella pagina, non trovato");
                return {};
            }
            return activity.page.mainObject;
        };

        var getInstance = function(activity) {

            var persisterConfig = activity.activityDef.persisterConfig;
            var mainObjectPropertyName = persisterConfig.mainObjectPropertyName;

            return {
                onInit : function(activity) {
                    activity.$scope.$on("mainObjectChanged",function(){
                        activity.$scope.loadEditItem();
                    });
                },
                load: function(editItem,activity) {
                    if (!editItem) {
                    	var mainObject = getPageMainObject(activity);                        
                        var editItemId = mainObject[mainObjectPropertyName];
                        if (!editItemId) {
                            return {};
                        } else {
                        	return datastore.getEntityById(activity.activityDef.entity,editItemId).then(function(entityToEdit){
                        		return entityToEdit;
                        	});
                        }
                    }
                    return editItem;
                },
                beforeSave: function(editItem,activity) {
                    return true;
                },
                save: function(editItem,activity) {
                    return datastore.saveEntity(activity.activityDef.entity,editItem).then(function(saved){
                    	var mainObject = getPageMainObject(activity);                        
                        mainObject[mainObjectPropertyName] = saved.id;
                    });
                },
                'delete': function(editItem,activity) {
                    var mainObject = getPageMainObject(activity);
                    if (mainObjectPropertyName) {
                        mainObject[mainObjectPropertyName] = null;
                    }
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

    .directive('mainObjectLinkPersisterConfigDir',[function() {
        return {
            restrict: 'E',
            scope: {
                persisterConfig: "="
            },
            templateUrl: '/eng-app-src/eng/stdEdit/persister/mainObjectLinkPersisterConfigDir.html',
            link: function (scope, element, attrs) {
            }
        };
    }])
    

;