'use strict';

angular.module('configModule',['engModule'])

    .config(['engApplicationProvider', function(engApplicationProvider) {

        engApplicationProvider
            .addPage({
                name: 'configurationPage',
                icon: 'settings',
                title: 'Configurazione',
                imageResource: 'imgs-configuration',
                showInHomePage: true,
                showInAppMenu: true,
                activities: [{
                    activity:'configuration',
                    initial: true
                },{
                    activity:'configuration.themes'
                }]
            })
            .addActivity({
                name: 'configuration',
                title: 'Impostazioni',
                icon: 'settings',
                templateUrl : '/eng-app-src/config/config.html',
                controller : 'ConfigurationCtrl'
            })
            .addActivity({
                name: 'configuration.themes',
                title: 'Temi',
                icon: 'settings',
                templateUrl : '/eng-app-src/config/configThemes.html',
                controller : 'ConfigurationThemesCtrl'
            })
            .addActivity({
                name: 'configuration.theme.edit',
                title: 'Tema',
                titleTpl: 'Tema {{editItem.name}}',
                templateUrl : '/eng-app-src/config/themeEdit.html',
                controller : 'ThemeEditCtrl',
                extends : 'stdEditActivity',
                entity : 'configuration.theme'
            })
            .addActivity({
                name: 'configuration.theme.list',
                title: 'Temi personalizzati',
                extends : 'stdListActivity',
                entity : 'configuration.theme',
                openItemActivity: "configuration.theme.edit",
                itemTitleProperty: "name"
            });
    }])
;
