'use strict';

angular.module('engModule')

    .config(['$httpProvider',function($httpProvider) {
        $httpProvider.interceptors.push('commErrorWarningInterceptor');
        $httpProvider.interceptors.push('authHeaderInterceptor');
    }])

    .factory('authHeaderInterceptor', ['$injector',function($injector) {

        var loginManager=null;

        return {
            'request': function(config) {
                if (loginManager==null) {
                    loginManager=$injector.get('engLoginManager');
                }
                var cu = loginManager.getCurrentUser();
                if (cu!=null) {
                    if (!config.headers) {
                        config.headers = {};
                    }
                    config.headers.user= cu.username+'#'+cu.password;
                }
                return config;
            }
        };
    }])

    .factory('commErrorWarningInterceptor', ['$q','$injector',
        function($q,$injector)
        {

            var $mdToast = null;
            var engApplication = null;

            return {

                responseError: function (rejection) {

                    if (!$mdToast) {
                        $mdToast = $injector.get('$mdToast');
                        engApplication =  $injector.get('engApplication');
                    }

                    console.log(rejection);
                    if (rejection.status === 403) {
                        var toast = $mdToast.simple()
                            .textContent("Errore 403, nella comunicazione con il server.")
                            .hideDelay(2000);
                        $mdToast.show(toast);
                        engApplication.loading = false;
                        rejection.shown=true;
                    }
                    else if (rejection.status <= 0) {
                        var toast = $mdToast.simple()
                            .textContent("Errore di comunicazione con i Servizi. Controlla la url nella configurazione.")
                            .hideDelay(2000);
                        $mdToast.show(toast);
                        engApplication.loading = false;
                        rejection.shown=true;
                    }
                    return $q.reject(rejection);
                }
            };
        }])
;