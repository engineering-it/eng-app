'use strict';

angular.module('engModule')

    /**
     * Direttiva per la configurazione dell'activity stdList
     */
    .directive('stdListConfigDir',['datastore','stdListResultsViews','listLoadersRegistry',
     function(datastore,stdListResultsViews,listLoadersRegistry){
        return {
            restrict: 'E',
            scope: {
                activityDef: "="
            },
            templateUrl: '/eng-app-src/eng/stdList/stdListConfigDir.html',
            link : function(scope, element, attrs) {

                scope.$watch('activityDef.entity',function(newVal,oldVal){
                    if (newVal) {
                        datastore.getEntityById('entities',{keyName:'name',keyValue:newVal})
                            .then(function(entityDef) {
                                if (entityDef) {
                                    var vals = [];
                                    entityDef.properties.forEach(function(val){
                                        vals.push({
                                            text: val.propertyLabel||val.propertyName,
                                            value: val.propertyName,
                                            tooltip: val.propertyHints
                                        });
                                    });
                                    scope.entityProperties = vals;
                                }
                            });
                    } else {
                        scope.entityProperties = [];
                    }
                });

                var resViewsChoices = [];
                angular.forEach(stdListResultsViews.getAllResultsViewDefs(),function(val,key){
                    resViewsChoices.push({
                        text: val.description||val.name,
                        value: val.name,
                        tooltip: val.tooltip
                    });
                });
                scope.resultsViewsChoices = resViewsChoices;

                scope.possibleListLoaders = [];
                angular.forEach(listLoadersRegistry.getAllLoaders(),function(value,key){
                    scope.possibleListLoaders.push({
                        value: value.loaderName,
                        text: value.label||value.loaderName,
                        tooltip: value.description
                    });
                });

                scope.$watch("activityDef.loader",function(newVal){
                    var loaderConfig = listLoadersRegistry.getLoader(newVal);
                    if (loaderConfig) {
                        if (!scope.activityDef.loaderConfig) {
                            scope.activityDef.loaderConfig = {};
                        }
                        scope.loaderConfigDirective = loaderConfig.configDirective;
                    } else {
                        scope.loaderConfigDirective = null;
                    }
                });

            }
        };
    }])

    /**
     * Componente per la registrazione dei loader usabili nelle maschere di stdList
     */
    .provider('listLoadersRegistry',[function() {

        var provider = this;
        var stdListLoaders = {};

        this.registerLoader= function(loaderName,obj) {
            obj.loaderName = loaderName;
            stdListLoaders[loaderName] = obj;
            return provider;
        };

        this.$get = ['$injector',
            function ($injector) {

                var getLoader = function(loaderName){
                    return stdListLoaders[loaderName];
                };

                var getLoaderServiceInstance = function(loaderConfig,activity){
                    var service,serviceName,regName;
                    if (angular.isString(loaderConfig)) {
                        regName = loaderConfig;
                    } else if (angular.isObject(loaderConfig) && loaderConfig.loaderName) {
                        regName = loaderConfig.loaderName;
                    } else {
                        console.error("La loaderConfig passata non è valida ",loaderConfig);
                        return null;
                    }
                    var regConfig = stdListLoaders[regName];
                    if (regConfig && regConfig.service) {
                        serviceName = regConfig.service;
                    } else {
                        serviceName = regName;
                    }
                    service = $injector.get(serviceName);
                    if (service && service.getInstance) {
                        return service.getInstance(activity,loaderConfig);
                    } else {
                        return service;
                    }
                };

                var getAllLoaders = function(){
                    return stdListLoaders;
                };

                return {
                    registerLoader: provider.registerLoader,
                    getLoader: getLoader,
                    getLoaderServiceInstance: getLoaderServiceInstance,
                    getAllLoaders: getAllLoaders
                };
            }
        ];
    }])

;