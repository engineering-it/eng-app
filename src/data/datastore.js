'use strict';

angular.module('engModule')

    /**
     * Servizio Facade per tutta l'applicazione per la gestioni dei dati.
     * Ogni entità può essere gestita da più store diversi.
     * Ad una entità possono essere associati più store che contribuiscono a recuperare le istanze dell'entità.
     */
    .provider('datastore', [function () {

        var self = this;

        var defaultStore = 'localstore';
        var loginStore = null;
        var configuredStores = {};
        var additionalStores = {};
        var insertStores = {};

        this.setDefaultStore = function (defaultStoreConfig) {
            defaultStore = defaultStoreConfig;
            return self;
        };

        this.setLoginStore = function (loginStoreConfig) {
            loginStore = loginStoreConfig;
            return self;
        };

        /**
         Imposta l'unico store per l'entità specificata,
         eventuali altri store aggiunti precedentemente con addConfiguredStore
         vengono resettati.
         */
        this.setConfiguredStore = function (entityName,storeConfig) {
            configuredStores[entityName] = storeConfig;
            additionalStores[entityName] = [];
            return self;
        };

        /**
        Aggiunge uno store aggiuntivo per l'entità specificata
         */
        this.addConfiguredStore = function (entityName,storeConfig) {
            var value = additionalStores[entityName];
            if (!value) {
                value = [];
                additionalStores[entityName] = value;
            }
            value.push(storeConfig);
            return self;
        };

        /**
         * Imposta lo store per l'inserimento di nuove istanze del tipo di entità
         * specificato
         */
        this.setInsertStore = function (entityName,storeConfig) {
            insertStores[entityName] = [storeConfig];
            return self;
        };

        this.$get = [
            'StoreComposite','$injector',
            function (StoreComposite,$injector) {

            var stores = {};

            var getStore = function (entityName) {
                if (entityName==null) {
                    return $injector.get(loginStore||defaultStore);
                }
                var store = stores[entityName];
                if (store == null) {
                    store = createStore(entityName);
                    stores[entityName] = store;
                }
                return store;
            };

            var createStore = function(entityName) {

                var retriveStores = [configuredStores[entityName]||defaultStore];
                var addStores = additionalStores[entityName];
                if (addStores) {
                    Array.prototype.push.apply(retriveStores,addStores);
                }

                return new StoreComposite({
                    insertStore: insertStores[entityName],
                    retriveStores: retriveStores
                },defaultStore);
            };

            var authWithPassword = function (user) {
                return getStore(null).authWithPassword(user);
            };

            var retrieveData = function (entityName, filters) {
                return getStore(entityName).retrieveData(entityName, filters);
            };

            var getEntityById = function (entityName, entityId) {
                return getStore(entityName).getEntityById(entityName, entityId);
            };

            var getEntityProperty = function (entityName, entityId, property) {
                return getStore(entityName).getEntityProperty(entityName, entityId, property);
            };

            var getEntityProperties = function (entityName, entityId, properties, separator) {
                return getStore(entityName).getEntityProperties(entityName, entityId, properties, separator);
            };

            var saveEntity = function (entityName, entityBean) {
                return getStore(entityName).saveEntity(entityName, entityBean);
            };

            var deleteEntity = function (entityName,entityBean) {
                return getStore(entityName).deleteEntity(entityName, entityBean);
            };

            return {
                authWithPassword: authWithPassword,

                /**
                 * Recupera tutte le entità di un certo tipo, con dei filtri
                 */
                retrieveData: retrieveData,

                /**
                 * Recuopera una singola entità di un certo tipo tramite una sua chiave:
                 * se li parametro id è di tipo string => usa proprietà id
                 * altrimenti può essere un object con:
                 * { keyName:.. keyValue: ..}
                 */
                getEntityById: getEntityById,

                getEntityProperty: getEntityProperty,
                getEntityProperties: getEntityProperties,
                saveEntity: saveEntity,
                deleteEntity: deleteEntity
            };
        }];
    }])

    /**
     * Store Facade che gestisce un'entità associata a store multipli
     */
    .factory('StoreComposite',['$injector','$q',function($injector,$q){

        var markEntitiesWithOriginStore = function(store,entities) {
            if (!entities) return;
            for (var i=0; i<entities.length; i++) {
                entities[i]._originStore = store.storeName;
                entities[i]._readonly = store.storeReadonly;
            }
        };

        var StoreComposite = function(storesConfig,defaultStore) {
            var self = this;
            if (!storesConfig.retriveStores || storesConfig.retriveStores.length===0) {
                storesConfig.retriveStores = [defaultStore];
            }
            this.retriveStores = storesConfig.retriveStores;
            this.insertStore = storesConfig.insertStore || defaultStore;

            this.innerStores = [];
            this.retriveStores.forEach(function(val){
                var storeInstance = self.createStoreInstance(val);
                self.innerStores.push(storeInstance);
            });
            this.insertStore = this.createStoreInstance(this.insertStore);
        };

        StoreComposite.prototype.createStoreInstance = function(storeConfig) {
            var service;
            if (angular.isString(storeConfig)) {
                service = $injector.get(storeConfig);
            } else if (angular.isObject(storeConfig) && storeConfig.storeName) {
                service = $injector.get(storeConfig.storeName);
            } else {
                console.error("La storeConfig passata non è valida ",storeConfig);
                return null;
            }
            if (service.getInstance) {
                return service.getInstance(storeConfig);
            } else {
                return service;
            }
        };

        StoreComposite.prototype.retrieveData = function(entityName, filters){
            var allData = [];
            var promises = [];
            angular.forEach(this.innerStores,function(store){
                var promise = store.retrieveData(entityName, filters).then(function(result){
                    markEntitiesWithOriginStore(store,result);
                    Array.prototype.push.apply(allData, result);
                });
                promises.push(promise);
            },this);
            return $q.all(promises).then(function(){
                return allData;
            },function(){
                return allData;
            });
        };

        StoreComposite.prototype.getEntityById = function(entityName, entityKey){
            var deferred = $q.defer();
            var promises = [];
            var resolved = false;
            angular.forEach(this.innerStores,function(store){
                var promise = store.getEntityById(entityName,entityKey)
                .then(function(entity){
                    if (entity!=null) {
                        markEntitiesWithOriginStore(store,[entity]);
                        deferred.resolve(entity);
                        resolved = true;
                    }
                });
                promises.push(promise);
            },this);
            $q.all(promises).then(function(){
                if (!resolved) {
                    deferred.resolve(null);
                }
            },function(){
                if (!resolved) {
                    deferred.resolve(null);
                }
            });
            return deferred.promise;
        };

        StoreComposite.prototype.getEntityProperty = function(entityName, entityKey, property){
            return this.getEntityById(entityName, entityKey)
                .then(function (ent) {
                    return ent ? ent[property] : $q.reject(null);
                });
        };

        StoreComposite.prototype.getEntityProperties = function(entityName, entityKey, properties, separator){
            return this.getEntityById(entityName, entityKey)
                .then(function (ent) {
                    var result;
                    if (ent) {
                        for (var index in properties) {
                            properties[index] = ent[properties[index]];
                        }
                        result = properties.join(" ");
                    } else {
                        result = $q.reject(null);
                    }
                    return result;
                });
        };

        StoreComposite.prototype.saveEntity = function(entityName, entityBean){
            var originStore = this.getEntitySaveStore(entityBean);
            if (!originStore) {
                return $q.reject("Cannot find OriginStore of entity for saving");
            }
            return originStore.saveEntity(entityName,entityBean);
        };

        StoreComposite.prototype.deleteEntity = function(entityName, entityBean){
            var originStore = this.getEntityOriginStore(entityBean);
            if (!originStore) {
                return $q.reject("Cannot find OriginStore of entity for deleting");
            }
            return originStore.deleteEntity(entityName,entityBean);
        };

        // used for delete
        StoreComposite.prototype.getEntityOriginStore = function(entity) {
            var storeName = entity._originStore;
            if (storeName) {
                for (var i=0; i<this.innerStores.length; i++) {
                    if (this.innerStores[i].storeName===storeName) {
                        return this.innerStores[i];
                    }
                }
            }
            return null;
        };

        // used for save
        StoreComposite.prototype.getEntitySaveStore = function(entity) {
            var storeName = entity._originStore;
            if (storeName) {
                for (var i=0; i<this.innerStores.length; i++) {
                    if (this.innerStores[i].storeName===storeName) {
                        return this.innerStores[i];
                    }
                }
            }
            return this.insertStore;
        };

        return StoreComposite;
    }])

    /**
     * Store basato su dizionario, solo ReadOnly.
     * Tipo Base per gli store codedPagesStore e codedActivitiesStore
     */
    .factory('DictionaryStore',['engApplication','$q',function(engApplication,$q){

        var DictionaryStore = function(storeName,dictionary,entityKeyProperty) {
            this.storeName = storeName;
            this.storeReadonly = true;
            this.dictionary = dictionary;
            this.entityKeyProperty = entityKeyProperty;
        };

        DictionaryStore.prototype.retrieveData = function (entityName, filters) {
            var self = this;
            var values = Object.keys(this.dictionary)
                .map(function(key) {
                    return self.dictionary[key];
                });
            return $q.when(values);
        };

        DictionaryStore.prototype.getEntityById = function (entityName, entityKey) {
            var deferred = $q.defer();
            if (entityKey.keyName===this.entityKeyProperty) {
                deferred.resolve(this.dictionary[entityKey.keyValue]);
            } else {
                console.error("this store support only '"+this.entityKeyProperty+"' key property");
                deferred.reject();
            }
            return deferred.promise;
        };

        DictionaryStore.prototype.getEntityProperty = function (entityName, entityKey, property) {
            return this.getEntityById(entityName,entityKey).then(function(ent){
                return ent?ent[property]:null;
            });
        };

        return DictionaryStore;
    }])

;