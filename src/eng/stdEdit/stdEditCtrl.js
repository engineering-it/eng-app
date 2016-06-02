'use strict';

angular.module('engModule')

    /**
     * Controller per l'activity Standard di Edit di un Bean
     */
    .controller('StdEditCtrl',
        ['$scope','editPersistersRegistry','engApplication','datastore','$mdSidenav','$filter','engScheduler','$mdToast','$mdDialog','$q',
        function($scope,editPersistersRegistry,engApplication,datastore,$mdSidenav,$filter,engScheduler,$mdToast,$mdDialog,$q) {

            var def = $scope.activity.activityDef;
            var params = $scope.activity.params||{};
            var persister = null;

            /*
             * i PropertyModels che descrivono le proprietà del bean
             */
            $scope.propertyModels = [];

            var init = function() {
                persister = getActivityPersister();
                if (params.persister) {
                    angular.extend(persister,params.persister);
                }

                persister.onInit($scope.activity);
                $scope.loadEditItem();
            };

            $scope.loadEditItem = function() {
                $q.when(persister.load(params.editItem,$scope.activity)).then(function(editItem){
                    finishInit(editItem);
                });
            };

            var finishInit = function(editItem) {

                $scope.editItem = editItem;
                $scope.readonly = params.readonly||$scope.editItem._readonly;

                calcPropertyModels();
                initActions();

                $scope.activity.closingFn = function() {
                    if ($scope.activity.dirtyCheck) {
                        return doAskClose();
                    } else {
                        return $q.when(null);
                    }
                };
                $scope.$on("engFieldChange",function(evt){
                    persister.onChange(evt,$scope.activity);
                    evt.stopPropagation();
                });
                $scope.activity.dirtyCheck = false;
            };

            var getActivityPersister = function() {
                return editPersistersRegistry.getPersisterServiceInstance(def.persister||"default",$scope.activity);
            };

            var initActions = function() {
                var saveAction = {
                	name: "saveAction",	
                    enabled: function() {
                        return !$scope.readonly;
                    },
                    icon: 'check',
                    tooltip: 'Salva il Dato',
                    fn: function() {
                        return doStartSave();
                    }
                };
                var deleteAction = {
                    name: "deleteAction",	
                    enabled: function() {
                        return !$scope.readonly;
                    },
                    icon: 'delete',
                    tooltip: 'Cancella il Dato',
                    fn: function() {
                    	return doStartDelete();
                    }
                };
                $scope.activity.actions.push(saveAction);
                $scope.activity.actions.push(deleteAction);
            };

            var onEntityDefLoaded = function() {
                if (!$scope.entityDef) {
                    return;
                }
                if ($scope.entityDef.titleTpl) {
                    $scope.activity.titleTpl = $scope.entityDef.titleTpl;
                }
                $scope.activity.dirtyCheck = false;
            };

            var getBeanProperties = function() {
                if (def.beanProperties) {
                    return $q.resolve(def.beanProperties);
                } else if (def.entity) {
                    return datastore.getEntityById('entities',{keyName:'name',keyValue:def.entity})
                        .then(function(entityDef){
                            $scope.entityDef = entityDef;
                            onEntityDefLoaded();
                            return entityDef?entityDef.properties:null;
                        });
                } else {
                    // todo auto create propertyModels based on object keys??
                    return $q.resolve([]);
                }
            };

            var calcPropertyModels = function() {
                $scope.models = {};
                return getBeanProperties().then(function(beanProperties){
                    if (!beanProperties) return;
                    var buildModels = {};
                    for (var i=0;  i<beanProperties.length; i++) {
                        var prop = beanProperties[i];
                        buildModels[prop.propertyName]=prop;
                    }
                    $scope.propertyModels = buildModels;
                });
            };

            $scope.addProperty = function() {
                var propertyName = "property_"+(new Date().getTime());
                var propertyModel = {
                    propertyName: propertyName
                };
                $scope.propertyModels[propertyName] = propertyModel;
                $scope.startEditProperty(propertyModel);
            };

            var stdErrorFn = function(reason){
                var msg = "Errore";
                if (reason) {
                    msg+=": "+reason;
                }
                $mdToast.show($mdToast.simple().textContent(msg));
            };

            var doStartSave = function() {
                var beforeSaveResult = persister.beforeSave($scope.editItem,$scope.activity);
                if (!beforeSaveResult) {
                    return false;
                }
                var saveResult = persister.save($scope.editItem,$scope.activity);
                if (saveResult) {
                    return $q.when(saveResult).then(function(){
                        var toast = $mdToast.simple()
                        	.textContent("Saved")
                        	.hideDelay(1000);
                        $mdToast.show(toast);
                        resetDirtyCheck();
                    },stdErrorFn);
                }
                return saveResult;
            };

            $scope.doStartSave = doStartSave;

            var doStartDelete = function($event) {
                var confirm = $mdDialog.confirm()
                    .title('Conferma cancellazione')
                    .textContent('Vuoi cancellare il Record?')
                    .targetEvent($event)
                    .ok('Ok')
                    .cancel('Annulla');

                return $mdDialog.show(confirm).then(doPerformStartDelete).then(function(deleteResult){
                    if (deleteResult) {
                        return $q.when(deleteResult).then(function(){
                            var toast = $mdToast.simple()
                            	.textContent("Deleted")
                            	.hideDelay(1000);
                            $mdToast.show(toast);
                            return engApplication.closeCurrentActivity();
                        },stdErrorFn);
                    }
                    return deleteResult;
                });
            };

            var doPerformStartDelete = function() {
                return persister['delete']($scope.editItem,$scope.activity);
            };

            var doAskClose = function($event) {
                var deferred = $q.defer();
                var confirm = $mdDialog.confirm()
                    .title('Ci sono modifiche non salvate')
                    .textContent('Vuoi uscire comunque dalla funzionalità?')
                    .targetEvent($event)
                    .ok('Ok')
                    .cancel('Annulla');

                $mdDialog.show(confirm).then(function(){
                    deferred.resolve();
                },function(){
                    deferred.reject();
                });
                return deferred.promise;
            };

            var resetDirtyCheck = function() {
                $scope.activity.dirtyCheck = false;
            };

            init();
    }])

;
