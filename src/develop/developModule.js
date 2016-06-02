'use strict';

angular.module('developModule',['engModule','ui.ace'])

    .config(['engApplicationProvider',function(engApplicationProvider) {

        engApplicationProvider

            .addPage({
                name: 'developPage',
                title: 'Develop',
                icon: 'developer_mode',
                showInHomePage: true,
                showInAppMenu: true,
                imageResource: 'imgs-development',
                activities: [{
                    activity: 'entitiesList'
                },{
                    activity:'pagesList'
                },{
                    activity:'activitiesList'
                },{
                    activity:'codesList'
                },{
                    activity:'templatesList'
                },{
                    activity:'datastoreConfig'
                }],
                enabledRoles: [
                    'eng.role.developer#159330725', // DEVELOPER
                ]
            })

            .addActivity({
                name: 'entitiesList',
                extends: "stdListActivity",
                initial: true,
                title: 'Entities',
                icon: 'extension',
                entity: "entities",
                openItemActivity: "entityEdit",
                itemTitleProperty: "name",
                itemSubtitleProperty: 'description',
                showItemProperties: [],
                itemsSelectable: false,
                pageSize: 200
            })
            .addActivity({
                name: 'entityEdit',
                extends: 'stdEditActivity',
                title: 'Entity',
                entity: "entities",
                templateUrl: '/eng-app-src/develop/entityEdit.html',
                titleTpl: '{{ editItem.name }}'
            })
            .addActivity({
                name: 'entityPropertyEdit',
                description: 'Activity di Edit del tipo di una Proprietà',
                extends: 'stdEditActivity',
                title: 'Property',
                templateUrl: '/eng-app-src/develop/entityPropertyEdit.html',
                titleTpl: '{{ editItem.propertyName }}'
            })

            .addActivity({
                name: 'pagesList',
                extends: "stdListActivity",
                icon: 'insert_drive_file',
                title: 'Pages',
                entity: "pages",
                openItemActivity: "pageEdit",
                itemTitleProperty: "name",
                itemSubtitleProperty: 'description',
                showItemProperties: [],
                itemsSelectable: false,
                controller: 'developer.pagesListCtrl',
                pageSize: 200
            })
            .addActivity({
                name: 'pageEdit',
                extends: 'stdEditActivity',
                title: 'Page',
                entity: 'pages',
                templateUrl: '/eng-app-src/develop/pageEdit.html',
                controller: 'developer.pageEditCtrl',
                titleTpl: '{{ editItem.name }}'
            })

            .addActivity({
                name: 'activitiesList',
                extends: "stdListActivity",
                title: 'Activities',
                icon: 'content_paste',
                entity: "activities",
                itemTitleProperty: "name",
                itemSubtitleProperty: 'description',
                showItemProperties: [],
                openItemActivity: "activityEdit",
                itemsSelectable: false,
                controller: 'developer.activitiesListCtrl',
                pageSize: 200
            })
            .addActivity({
                name: 'activityEdit',
                extends: 'stdEditActivity',
                title: 'Activity',
                entity: 'activities',
                templateUrl: '/eng-app-src/develop/activityEdit.html',
                controller: 'developer.activityEditCtrl',
                titleTpl: '{{ editItem.name }}'
            })

            .addActivity({
                name: 'codesList',
                extends: "stdListActivity",
                title: 'Codes',
                icon: 'developer_mode',
                entity: "codes",
                itemTitleProperty: "name",
                itemSubtitleProperty: 'description',
                showItemProperties: [],
                openItemActivity: "codeEdit",
                itemsSelectable: false
                //controller: 'developer.codesListCtrl'
            })
            .addActivity({
                name: 'codeEdit',
                extends: 'stdEditActivity',
                title: 'Code',
                entity: 'codes',
                templateUrl: '/eng-app-src/develop/codeEdit.html',
                controller: 'developer.codeEditCtrl',
                titleTpl: '{{ editItem.name }}'
            })

            .addActivity({
                name: 'templatesList',
                extends: "stdListActivity",
                title: 'Templates',
                icon: 'panorama',
                entity: "templates",
                itemTitleProperty: "name",
                itemSubtitleProperty: 'description',
                showItemProperties: [],
                openItemActivity: "templateEdit",
                itemsSelectable: false
                //controller: 'developer.codesListCtrl'
            })
            .addActivity({
                name: 'templateEdit',
                extends: 'stdEditActivity',
                title: 'Template',
                entity: 'templates',
                templateUrl: '/eng-app-src/develop/templateEdit.html',
                controller: 'developer.templateEditCtrl',
                titleTpl: '{{ editItem.name }}'
            })

            .addActivity({
                name: 'datastoreConfig',
                title: 'Datastore Config',
                icon: 'settings_input_component',
                templateUrl: '/eng-app-src/develop/datastoreConfig.html',
                controller: 'developer.datastoreConfigCtrl'
            })

            .addActivity({
                name: 'develop.iconsList',
                extends: "stdListActivity",
                title: 'Icons',
                icon: 'panorama',
                itemTitleProperty: "name",
                itemIconProperty: "name",
                loader: "iconsLoader"
            })

        ;

    }])

    .controller('developer.activityEditCtrl',
        ['$scope','engApplication',function($scope,engApplication){

        var init= function() {

            $scope.extendActivityConfigDirective = null;
            $scope.possibleActivityExtensions = [];

            angular.forEach(engApplication.getRegisteredActivityDefs(),function(value,key){
                if (value.extendable) {
                    $scope.possibleActivityExtensions.push({
                        value: value.name,
                        text: value.description
                    });
                }
            });

            $scope.$watch('editItem.extends',function(newVal,oldVal){
                if (newVal==null) return;
                engApplication.getActivityDef(newVal).then(function(extendActivityDef){
                    $scope.extendActivityConfigDirective = extendActivityDef.configDirective;
                });
            });

            $scope.activity.actions.push({
                name: 'testRun',
                icon: 'play_circle_outline',
                tooltip: 'Test Run this activity',
                class: 'md-fab md-mini md-primary',
                fn: function() {
                    launchTestRun();
                }
            });
        };

        var launchTestRun = function() {
            engApplication.openActivity($scope.editItem.name,{
                testRun: true
            });
        };

        init();
    }])

    .controller('developer.activitiesListCtrl',
        ['$scope','engApplication',function($scope,engApplication){

        var init= function() {
            $scope.itemActions.push({
                name: 'testRun',
                icon: 'play_circle_outline',
                tooltip: 'Test Run this activity',
                class: 'md-fab md-mini md-primary',
                fn: function(item) {
                    launchTestRun(item);
                }
            });
        };

        var launchTestRun = function(item) {
            engApplication.openActivity(item.name,{
                testRun: true
            });
        };

        init();
    }])

    .controller('developer.datastoreConfigCtrl',
    ['$scope','engApplication','engFileService','localstore','restservicestore','$http','$mdDialog','configuration',
    function($scope,engApplication,engFileService,localstore,restservicestore,$http,$mdDialog,configuration){

        $scope.launchCodeExport = function() {
            engFileService.serveForDownload(localstore.exportEngData());
        };

        $scope.launchCodeImport = function($event) {
            var confirm = $mdDialog.confirm()
                .title('Conferma import del file icuApp.js')
                .textContent('Questo sovrascriverà tutti i tuoi dati locali')
                .targetEvent($event)
                .ok('Ok')
                .cancel('Annulla');

            $mdDialog.show(confirm).then(doPerformCodeImport,function(){});
        };

        $scope.launchCodeImportRestService = function($event) {
            var confirm = $mdDialog.confirm()
                .title('Conferma import del file icuApp.js')
                .textContent('Import delle entità individuate nel file icuApp.js nel restservicestore')
                .targetEvent($event)
                .ok('Ok')
                .cancel('Annulla');

            $mdDialog.show(confirm).then(doPerformResterviceStoreImport,function(){});
        };

        var doPerformCodeImport = function() {
            $http.get("icuApp.json").then(function(data){
                //console.log("recuperato icuApp.json ",data.data);
                localstore.importEngData(data.data);
            });
        };

        var doPerformResterviceStoreImport = function() {
            $http.get("icuApp.json").then(function(data){
                //console.log("recuperato icuApp.json ",data.data);
                restservicestore.importEngData(data.data);
            });
        };

        $scope.getConfigKeyValue = function(configKey) {
            return configuration.getConfigData(configKey);
        };

        $scope.showPromptCambiaUrl = function(ev,configKey) {
            var confirm = $mdDialog.prompt()
                .title('Inserisci il valore')
                .textContent("Specifica un valore per l\'url dei servizi a cui si collega il restserviceDatastore")
                .placeholder($scope.getConfigKeyValue(configKey))
                .targetEvent(ev)
                .ok('Okay!')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function(result) {
                configuration.setConfigData(configKey,result);
            }, function() {});
        };

    }])

    .controller('developer.pagesListCtrl',
    ['$scope','engApplication','engFileService','localstore','$http','$mdDialog',
    function($scope,engApplication,engFileService,localstore,$http,$mdDialog){

        var init= function() {

            $scope.itemActions.push({
                name: 'testRun',
                icon: 'play_circle_outline',
                tooltip: 'Test Run this Page',
                class: 'md-fab md-mini md-primary',
                fn: function(item) {
                    launchTestRun(item);
                }
            });

        };

        var launchTestRun = function(item) {
            engApplication.openPage(item.name,{
                testRun: true
            });
        };

        init();
    }])

    .controller('developer.pageEditCtrl',
        ['$scope','engApplication',function($scope,engApplication){

            var init= function() {
            	
            	 $scope.extendPageConfigDirective = null;
                 $scope.possiblePageExtensions = [];

                 angular.forEach(engApplication.getRegisteredPageDefs(),function(value,key){
                     if (value.extendable) {
                         $scope.possiblePageExtensions.push({
                             value: value.name,
                             text: value.description,
                             tooltip: value.description
                         });
                     }
                 });

                 $scope.$watch('editItem.extends',function(newVal,oldVal){
                     if (newVal==null) return;
                     engApplication.getPageDef(newVal).then(function(extendPageDef){
                         $scope.extendPageConfigDirective = extendPageDef.configDirective;
                     });
                 });
            	
                $scope.activity.actions.push({
                    name: 'testRun',
                    icon: 'play_circle_outline',
                    tooltip: 'Test Run this Page',
                    class: 'md-fab md-mini md-primary',
                    fn: function() {
                        launchTestRun();
                    }
                });
            };

            var launchTestRun = function() {
                engApplication.openPage($scope.editItem.name,{
                    testRun: true
                });
            };

            init();
        }])

    .controller('developer.codeEditCtrl',
    ['$scope','engApplication','scriptInjector','$mdToast',function($scope,engApplication,scriptInjector,$mdToast){

        var init= function() {

            $scope.activity.actions.push({
                name: 'injectCode',
                icon: 'publish',
                tooltip: 'Inject Script into the Page',
                fn: function() {
                    injectCode();
                }
            });
        };

        var injectCode = function() {
            var scriptName = "engData/codes/"+$scope.editItem.name;
            scriptInjector.injectScript(scriptName,$scope.editItem.content).then(function(){
                $mdToast.show($mdToast.simple().textContent("Script '"+scriptName+"' injected"));
            });
        };

        init();
    }])

    .controller('developer.templateEditCtrl',
    ['$scope','engApplication','scriptInjector','$mdToast',function($scope,engApplication,scriptInjector,$mdToast){

        var init= function() {

            $scope.activity.actions.push({
                name: 'injectTemplate',
                icon: 'publish',
                tooltip: 'Inject Template into the Page',
                fn: function() {
                    injectTemplate();
                }
            });
        };

        var injectTemplate = function() {
            var templateName = "engData/templates/"+$scope.editItem.name;
            scriptInjector.injectTemplate(templateName,$scope.editItem.content).then(function(){
                $mdToast.show($mdToast.simple().textContent("Template '"+templateName+"' injected"));
            });
        };

        init();
    }])

    .factory('engFileService',['$window','$filter','$q','$timeout',function($window,$filter,$q,$timeout){

        var serveForDownload = function(stringData) {
            var downloadWinName = "DownloadWin_"+(new Date()).getTime();
            var joined = stringData.join("");
            console.log(joined);
            var link = $("<a></a>");

            var dateTag=$filter('date')(new Date(),"dd-MM-yyyy@h:mm");
            link.attr("download","export["+dateTag+"].json");
            link.attr("href","data:application/octet-stream," + encodeURIComponent(joined));
            $("#printContentElement").append(link);
            link[0].click();
            link.remove();
        };

        return {
            serveForDownload: serveForDownload
        };

    }])

    .factory('iconsLoader',['ngMdIconService','$q',function(ngMdIconService,$q){
        return {
            onInit: function(entity,activity) {},
            loadData: function(entity,filters,activity) {
                var data = [];
                var i=0;
                angular.forEach(ngMdIconService.getShapes(),function(val,key){
                    i++;
                    data.push({
                        name: key
                    });
                });
                return $q.when(data);
            }
        };
    }])

;
