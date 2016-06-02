'use strict';

angular.module('engModule')

    /**
     * Store che salva i dati nel localstorage del browser
     */
    .factory('localstore',['$window','serializer','$q',function($window,serializer,$q){

        var LOCSTORAGE = $window.localStorage;

        var getObject = function(key) {
            var val = LOCSTORAGE.getItem(key);
            return serializer.fromJson(val);
        };

        var putObject = function(key,obj) {
            LOCSTORAGE.setItem(key,serializer.toJson(obj));
        };

        var retrieveData = function (dataName, filters) {
            var deferred = $q.defer();
            var alls = getObject('engData/'+dataName);
            deferred.resolve(alls||[]);
            return deferred.promise;
        };

        var generateNewId = function() {
            return ""+(new Date().getTime())+"-"+(Math.floor((1 + Math.random()) * 0x10000));
        };

        var insertEntity = function(entityName, entityBean) {
            entityBean.id = generateNewId();
            var deferred = $q.defer();
            var alls = getObject('engData/'+entityName);
            if (!alls) {
                alls = [];
            }
            alls.push(entityBean);
            putObject('engData/'+entityName,alls);
            deferred.resolve(entityBean);
            return deferred.promise;
        };

        var updateEntity = function(entityName,id,entityBean) {
            var deferred = $q.defer();
            var alls = getObject('engData/'+entityName);
            var idx = null;
            if (alls.length) {
                for (var i=0; i<alls.length; i++) {
                    if (alls[i].id==id) {
                        idx=i;
                        break;
                    }
                }
            }
            if (idx==null) {
                console.error("Update non trovato bean con id ",entityName,id);
                deferred.reject("Error Updating");
                return deferred.promise;
            }
            alls.splice(idx,1,entityBean);
            putObject('engData/'+entityName,alls);
            deferred.resolve(entityBean);
            return deferred.promise;
        };

        var deleteEntity = function (entityName, entityBean) {
            var deferred = $q.defer();
            var alls = getObject('engData/'+entityName);
            var idx = null;
            if (alls.length) {
                for (var i=0; i<alls.length; i++) {
                    if (alls[i].id==entityBean.id) {
                        idx=i;
                        break;
                    }
                }
            }
            if (idx==null) {
                console.error("Delete non trovato bean con id ",entityName,entityBean.id);
                deferred.reject("Error Deleting");
                return deferred.promise;
            }
            var entityBean = alls[idx];
            alls.splice(idx,1);
            putObject('engData/'+entityName,alls);
            deferred.resolve(entityBean);
            return deferred.promise;
        };

        var saveEntity = function(entityName, entityBean) {
            if (entityBean.id==null) {
                return insertEntity(entityName, entityBean);
            } else {
                return updateEntity(entityName, entityBean.id, entityBean);
            }
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
            console.error("Not implemented");
            return $q.reject("Not implemented");
        };

        var exportEngData = function() {
            var allData={};
            for (var i = 0; i < localStorage.length; i++){
                var key = localStorage.key(i);
                if (key.indexOf("engData/")===0) {
                    allData[key] = localStorage.getItem(key);
                }
            }
            return [JSON.stringify(allData, null, '\t')];
        };

        var importEngData = function(jsonText) {
            var allData = angular.fromJson(jsonText);
            angular.forEach(allData,function(value,key){
                //console.log("setItem",key,value);
                localStorage.setItem(key,value);
            });
            return allData;
        };

        return {
            storeName: 'localstore',

            getObject: getObject,
            putObject: putObject,

            // interfaccia datastore
            authWithPassword: authWithPassword,
            retrieveData: retrieveData,
            getEntityById: getEntityById,
            getEntityProperty: getEntityProperty,
            saveEntity: saveEntity,
            deleteEntity: deleteEntity,

            exportEngData: exportEngData,
            importEngData: importEngData
        };
}])

;