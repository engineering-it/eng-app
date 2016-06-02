'use strict';

angular.module('engModule')

    /**
     * Store di tipo Readonly che restituisce i dati passati 
     * nella configurazione tramite la proprietà "mockdata"
     */
	 .factory('mockedstore',['$q',function($q){
       
		var count = 0;
		 
		var getInstance= function(storeConfig) {
        	return {
        		storeName: 'mockdatastore::'+(count++),
                storeReadonly: true,
                retrieveData: function() {
                    return $q.when(storeConfig.mockdata);
                },
                getEntityById: function(entityName, entityKey) {
                    var found = storeConfig.mockdata.find(function(val) { 
                    	return val[entityKey.keyName]==entityKey.keyValue; 
                    });
                    return $q.when(found);
                }
        	};
        }; 
		
        return {
            getInstance: getInstance
        };
    }])


    /**
     * Store di tipo Readonly che legge le entità in file json collocati
     * sulla cartella mockData
     */
    .factory('mockdatastore',
    ['$injector','$q','dateUtils','$timeout','$http','$rootScope','$filter','$mdToast',
    function($injector,$q,dateUtils,$timeout,$http,$rootScope,$filter,$mdToast) {

        var errorFn = function(reason) {
            return reason;
        };

        var retrieveMockData = function (dataName) {
            return $http.get('mockData/' + dataName + '.json')
                .then(function (result) {
                    if (!result || !result.data) {
                        return $q.reject("error");
                    }
                    if (result.data.error) {
                        var toast = $mdToast.simple()
                            .textContent(result.data.error);
                        $mdToast.show(toast);
                        console.error(result.data.error);
                        return $q.reject(result.data.error);
                    } else {
                        return result.data.result;
                    }
                },errorFn);
        };

        var retrieveData = function (dataName, filters) {
            return retrieveMockData(dataName);
        };

        var saveEntity = function (entityName, entityBean) {
            console.error("salvataggio entità ",entityName,entityBean," non implementato dal mockdatastore");
            return $q.reject("Not implemented");
        };

        var deleteEntity = function (entityName, entityBean) {
            console.error("cancellazione entità ",entityName,entityBean," non implementato dal mockdatastore");
            return $q.reject("Not implemented");
        };

        var getEntityById = function (entityName, entityKey) {

            var keyName,keyValue;
            if($.type(entityKey) === "string") {
                keyName = 'id';
                keyValue = entityKey;
            } else {
                keyName = entityKey.keyName;
                keyValue = entityKey.keyValue;
            }

            return retrieveData(entityName, {})
                .then(function (list) {
                    for (var i = 0; i < list.length; i++) {
                        var e = list[i];
                        if (e[keyName] == keyValue) {
                            return e;
                        }
                    }
                    return null;
                });
        };

        var getEntityProperty = function (entityName, entityKey, property) {
            return getEntityById(entityName, entityKey)
                .then(function (ent) {
                    return ent ? ent[property] : null;
                });
        };

        var authWithPassword = function (user) {
            return retrieveMockData('login');
        };

        return {
            storeName: 'mockdatastore',
            storeReadonly: true,

            authWithPassword: authWithPassword,
            retrieveData: retrieveData,
            getEntityById: getEntityById,
            getEntityProperty: getEntityProperty,
            saveEntity: saveEntity,
            deleteEntity: deleteEntity
        };

    }])

;