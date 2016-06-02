'use strict';

angular.module('engModule', ['ngMaterial', 'ngRoute', 'ngMdIcons','ngSanitize','commonModule','utilsModule','pascalprecht.translate'])

    /**
     * Blocco config di registrazione delle due Activity di base
     * di Edit e di Lista, estendibili e configurabili
     */
    .config(['engApplicationProvider','stdListResultsViewsProvider','datastoreProvider', function(engApplicationProvider,stdListResultsViewsProvider,datastoreProvider) {

        engApplicationProvider
            .addEntity({
                "name": "users",
                "description": "Entita' Utente del sistema",
                "properties": [{
                    "propertyName": "id",
                    "readonly": true,
                    "fixed": true
                },{
                    "propertyName": "username",
                    "propertyType": "STRING"
                },{
                    "propertyName": "password",
                    "propertyType": "PASSWORD"
                },{
                    "propertyName":"ruoli",
                    "propertyType":"LOOKUP",
                    "multiple": true,
                    "refEntityName":"roles",
                    "refEntityListActivity":"rolesList",
                    "lookupShowedProperty":"name"
                }
                ]
            })
            .addEntity({
                "name": "roles",
                "description": "Entita' Ruolo del sistema",
                "properties": [{
                    "propertyName": "id",
                    "readonly": true,
                    "fixed": true
                },{
                    "propertyName": "name",
                    "propertyType": "STRING"
                },{
                    "propertyName": "description",
                    "propertyType": "STRING"
                }
                ]
            });

        datastoreProvider
	        .addConfiguredStore('roles',{
	            storeName: 'mockedstore',
	            mockdata: [{
	            	id: 'eng.role.developer#159330725',
	            	name: 'DEVELOPER',
	            	description: 'Sviluppatore'
	            },{
	            	id: 'eng.role.profiler#951770385',
	            	name: 'PROFILER',
	            	description: 'Configuratore'
	            }]
	        });

        engApplicationProvider
            .addActivity({
                name: 'stdListActivity',
                description: 'Attività standard Lista',
                templateUrl: '/eng-app-src/eng/stdList/stdList.html',
                controller: 'StdListCtrl',
                extendable: true,
                configDirective: 'stdListConfigDir'
            })
            .addActivity({
                name: 'stdEditActivity',
                description: 'Attività standard Edit',
                templateUrl: '/eng-app-src/eng/stdEdit/stdEdit.html',
                controller: 'StdEditCtrl',
                extendable: true,
                configDirective: 'stdEditConfigDir'
            })
            .addActivity({
                name: 'stdDashboardActivity',
                description: 'Attività standard Dashboard',
                templateUrl: '/eng-app-src/eng/stdDashboard/stdDashboard.html',
                controller: 'StdDashboardCtrl',
                extendable: true,
                configDirective: 'stdDashboardConfigDir'
            })
            .addActivity({
                name: 'stdDashboardEditActivity',
                description: 'Attività standard di personalizzazione utente della Dashboard',
                extends: 'stdEditActivity',
                title: 'Configura la Dashboard',
                templateUrl: '/eng-app-src/eng/stdDashboard/stdEditDashboard.html',
                controller: 'StdEditDashboardCtrl',
                extendable: false
            });

        engApplicationProvider
	        .addPage({
	            name: 'stdPage',
	            description: 'Pagina std',
	            extendable: true,
	            controller: 'StdPageCtrl'
	        })
	        .addPage({
	            name: 'stdMainObjectPage',
	            description: 'Main Object Page',
	            extendable: true,
	            controller: 'StdMainObjectPageCtrl',
                configDirective: 'stdMainObjectPageConfigDir',
	            headerDirective: 'stdMainObjectPageHeaderDir'
	        });
        
        stdListResultsViewsProvider
            .addResultsViewDef({
                name: 'stdListView',
                description: 'Vista di tipo Lista',
                icon: 'list',
                tooltip: 'Vista a Lista',
                directive: 'engStdListView'
            },true)
            .addResultsViewDef({
                name: 'stdBadgesView',
                description: 'Vista di tipo Badges',
                icon: 'view_module',
                tooltip: 'Vista a Badges',
                directive: 'engStdBadgesView'
            });

    }])

    .config(['$mdThemingProvider', '$translateProvider', '$provide', function($mdThemingProvider,$translateProvider,$provide) {

        $mdThemingProvider.generateThemesOnDemand(true);
        $mdThemingProvider.alwaysWatchTheme(true);
        $provide.value('themeProvider', $mdThemingProvider);

        $translateProvider.useStaticFilesLoader({
            prefix: 'i18n/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('it');

    }])

    /**
     * Blocco di run in cui vengono scaricate e iniettati tutti gli script
     * e i templates applicativi pubblicati
     */
    .run(['datastore','scriptInjector','engThemingService',function(datastore,scriptInjector,engThemingService){

        //todo recuperare solo i published quando saranno implementate le query
        datastore.retrieveData('codes',{}).then(function(result){
            result.forEach(function(code){
                var scriptName = "engData/codes/"+code.name;
                scriptInjector.injectScript(scriptName,code.content);
            });
        });

        //todo recuperare solo i published quando saranno implementate le query
        datastore.retrieveData('templates',{}).then(function(result){
            result.forEach(function(template){
                var templateName = "engData/templates/"+template.name;
                scriptInjector.injectTemplate(templateName,template.content);
            });
        });

        engThemingService.init();
    }])
    
    .controller('StdPageCtrl',['$scope',function($scope){
    	
    	//Empty Ctrl
    	
    }])

;