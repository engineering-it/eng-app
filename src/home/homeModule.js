'use strict';

angular.module('homeModule',['engModule'])

    .config(['engApplicationProvider', function(engApplicationProvider) {

        engApplicationProvider
            .addPage({
                name: 'homePage',
                title: 'Home',
                showInHomePage: false,
                showInAppMenu: false,
                homePage: true,
                activities: [{
                    activity:'home'
                }]
            })
            .addActivity({
                name: 'home',
                description: 'Activity della pagina di Home dell\'applicazione',
                initial: true,
                title: 'Home',
                templateUrl : '/eng-app-src/home/home.html',
                controller : 'HomeCtrl',
                showInPageMenu: false,
                showBack: false,
                showMenu: false
            })
            .addActivity({
                name: 'pageHomeActivity',
                title: 'Home',
                icon: 'home',
                templateUrl : '/eng-app-src/home/pageHome.html',
                controller : 'PageHomeActivityCtrl',
                showInHomePage: false,
                initial: true
            });

    }])
;
