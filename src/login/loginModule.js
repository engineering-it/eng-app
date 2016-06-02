'use strict';

angular.module('loginModule',['engModule'])

    .config(['engApplicationProvider', function(engApplicationProvider) {

        engApplicationProvider
            .addPage({
                name: 'loginPage',
                title: 'Login',
                showInHomePage: false,
                showInAppMenu: false,
                loginPage: true,
                activities: [{
                    activity:'login'
                }]
            })
            .addActivity({
                name: 'login',
                initial: true,
                title: 'Login',
                templateUrl: '/eng-app-src/login/login.html',
                controller: 'LoginCtrl',
                showInPageMenu: false,
                showBack: false,
                showMenu: false
            });

    }])
;
