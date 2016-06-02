'use strict';

angular.module('engModule')

    /**
     * Store che salva i dati in un servizio http
     */
    .factory('restservicestore',['$http','serializer','configuration',function($http,serializer,configuration){

        var getStoreInstance = function(configs) {

            var baseUrl = configs.serviceUrl;
            var domain = configs.domain;

            var notImplemented = function() { throw "Not implemented"; };

            var retrieveData = function(entityName,filters) {
                return $http({
                    method: 'POST',
                    url: baseUrl+"/"+entityName,
                    data: filters,
                    transformRequest: serializer.transformRequest,
                    transformResponse: serializer.transformResponse
                }).then(function(response){
                    var data = response.data;
                    return data?data.result:[];
                });
            };

            var saveEntity = function(entityName, entityBean) {
                if (entityBean.id==null) {
                    return insertEntity(entityName, entityBean);
                } else {
                    return updateEntity(entityName, entityBean.id, entityBean);
                }
            };

            var generateNewId = function() {
                return ""+(new Date().getTime())+"-"+(Math.floor((1 + Math.random()) * 0x10000));
            };

            var insertEntity = function(entityName, entityBean) {
                entityBean.id = generateNewId();

                return $http({
                    method: 'PUT',
                    url: baseUrl+"/"+entityName,
                    data: entityBean,
                    transformRequest: serializer.transformRequest,
                    transformResponse: serializer.transformResponse
                }).then(function(response){
                    return response.data;
                });
            };

            var updateEntity = function(entityName,id,entityBean) {

                return $http({
                    method: 'PUT',
                    url: baseUrl+"/"+entityName,
                    data: entityBean,
                    transformRequest: serializer.transformRequest,
                    transformResponse: serializer.transformResponse
                }).then(function(response){
                    return response.data;
                });
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

                var path=[baseUrl,entityName,keyName,keyValue];

                return $http({
                    method: 'GET',
                    url: path.join("/"),
                    transformRequest: serializer.transformRequest,
                    transformResponse: serializer.transformResponse
                }).then(function(response){
                    var data = response.data;
                    return data&&data!=='null'?data:null;
                });
            };

            var getEntityProperty = function (entityName, entityKey, property) {
                var keyName,keyValue;
                if($.type(entityKey) === "string") {
                    keyName = 'id';
                    keyValue = entityKey;
                } else {
                    keyName = entityKey.keyName;
                    keyValue = entityKey.keyValue;
                }

                var path=[baseUrl,entityName,keyName,keyValue,property];

                return $http({
                    method: 'GET',
                    url: path.join("/"),
                    transformRequest: serializer.transformRequest,
                    transformResponse: serializer.transformResponse
                }).then(function(response){
                    var data = response.data;
                    return data&&data!=='null'?data:null;
                });
            };

            var deleteEntity = function (entityName, entityBean) {
                var path=[baseUrl,entityName,"id",entityBean.id];

                return $http({
                    method: 'DELETE',
                    url: path.join("/"),
                    transformRequest: serializer.transformRequest,
                    transformResponse: serializer.transformResponse
                }).then(function(response){
                    var data = response.data;
                    return data&&data!=='null'?data:null;
                });
            };

            var importEngData = function(jsonText) {
                var allData = angular.fromJson(jsonText);
                angular.forEach(allData,function(value,key){

                    if (key.indexOf("engData/")!==0) {
                        return;
                    }
                    var entityName = key.substring(8);
                    var items = serializer.fromJson(value);
                    items.forEach(function(item){
                        console.log("saving entity ",entityName," ",item.id);
                        saveEntity(entityName,item).then(function(){
                            console.log("saved entity: ",entityName,item);
                        });
                    });
                });
                return allData;
            };

            return {
                 storeName: 'restservicestore::'+(count++),
                 storeReadonly: false,

                 authWithPassword: notImplemented,
                 retrieveData: retrieveData,
                 getEntityById: getEntityById,
                 getEntityProperty: getEntityProperty,
                 saveEntity: saveEntity,
                 deleteEntity: deleteEntity,

                 importEngData: importEngData
            };
        };

        var count = 0;

        return {
            getInstance: getStoreInstance
        };

    }])

;