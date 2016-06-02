'use strict';

angular.module('engModule')

    /**
     * Direttiva per la configurazione dell'activity stdEdit
     */
    .directive('stdEditConfigDir',['editPersistersRegistry',function(editPersistersRegistry){
        return {
            restrict: 'E',
            scope: {
                activityDef: "="
            },
            templateUrl: '/eng-app-src/eng/stdEdit/stdEditConfigDir.html',
            link : function($scope, element, attrs) {

                $scope.possibleEditPersisters = [];
                angular.forEach(editPersistersRegistry.getAllPersisters(),function(value,key){
                    $scope.possibleEditPersisters.push({
                        value: value.persisterName,
                        text: value.label||value.persisterName,
                        tooltip: value.description
                    });
                });

                $scope.$watch("activityDef.persister",function(newVal){
                    var persisterConfig = editPersistersRegistry.getPersister(newVal);
                    if (persisterConfig) {
                        if (!$scope.activityDef.persisterConfig) {
                            $scope.activityDef.persisterConfig = {};
                        }
                        $scope.persisterConfigDirective = persisterConfig.configDirective;
                    } else {
                        $scope.persisterConfigDirective = null;
                    }
                });

            }
        };
    }])

    /**
     * Componente per la registrazione dei persister usabili nelle maschere di stdEdit
     */
    .provider('editPersistersRegistry',[function() {

        var provider = this;
        var stdEditPersisters = {};

        this.registerPersister= function(persisterName,obj) {
            obj.persisterName = persisterName;
            stdEditPersisters[persisterName] = obj;
            return provider;
        };

        this.$get = ['$injector',
            function ($injector) {

                var getPersister = function(persisterName){
                    return stdEditPersisters[persisterName];
                };

                var getPersisterServiceInstance = function(persisterConfig,activity){
                    var service,serviceName,regName;
                    if (angular.isString(persisterConfig)) {
                        regName = persisterConfig;
                    } else if (angular.isObject(persisterConfig) && persisterConfig.persisterName) {
                        regName = persisterConfig.persisterName;
                    } else {
                        console.error("La persisterConfig passata non è valida ",persisterConfig);
                        return null;
                    }
                    var regConfig = stdEditPersisters[regName];
                    if (regConfig && regConfig.service) {
                        serviceName = regConfig.service;
                    } else {
                        serviceName = regName;
                    }
                    service = $injector.get(serviceName);
                    if (service && service.getInstance) {
                        return service.getInstance(activity,persisterConfig);
                    } else {
                        return service;
                    }
                };

                var getAllPersisters = function(){
                    return stdEditPersisters;
                };

                return {
                    registerPersister: provider.registerPersister,
                    getPersister: getPersister,
                    getPersisterServiceInstance: getPersisterServiceInstance,
                    getAllPersisters: getAllPersisters
                };
            }
        ];
    }])

;