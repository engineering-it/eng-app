'use strict';

angular.module('utilsModule', ['commonModule'])

angular.module('engModule')

    .factory('appResources',['$injector',function($injector){

        var staticAppResources = $injector.has('staticAppResources')?
            $injector.get('staticAppResources'):null;

        return {
            getDataUrl : function(resourceName) {
                if (staticAppResources) {
                    var res = staticAppResources[resourceName];
                    return res?('data:image/'+res.type+';base64,'+res.data):null;
                }
                console.warn("staticAppResources service not Found!");
                return null;
            }
        };

    }])

    /**
     * Servizio di utility per le operazioni schedulate e bufferizzate
     */
    .factory('engScheduler',['$timeout',function($timeout){

        var makeScheduled = function(fn,jitterTime) {
            var scheduled=null;
            return function() {
                if (scheduled!=null) {
                    $timeout.cancel(scheduled);
                }
                scheduled = $timeout(fn,jitterTime);
            };
        };

        return {
            /**
             * Crea una funzione schedulata passandogli la funzione originale e un jitterTime
             * in modo che anche se invocata ripetutamente la funzione risultante viene eseguito
             * "al più" ogni jitterTime
             */
            makeScheduled: makeScheduled
        };

    }])

    /**
     * Servizio per la generazione di id univoci
     */
    .factory('idGenerator',[function(){
        var count=0;
        return {
            getNewId: function() {
                count++;
                return "id_"+count;
            }
        };
    }])

    /**
     * Servizio per iniettare gli script nell'applicazione
     */
    .factory('scriptInjector',['$q','$timeout','$templateCache',function($q,$timeout,$templateCache){

        var injectScript = function(scriptName,stringCode) {
            var deferred = $q.defer();
            var script = $("<script></script>");
            //script.attr("src","data:text/javascript," + encodeURIComponent(stringCode));
            var scriptNameTag = scriptName?"//# sourceURL="+scriptName+".js\n\n":"";
            script.text(scriptNameTag+stringCode);
            $("head").append(script);
            $timeout(function(){
                console.log("injected script: ",scriptNameTag);
                deferred.resolve();
            });
            return deferred.promise;
        };

        var injectTemplate = function(templateName,templateCode) {
            var deferred = $q.defer();
            $templateCache.put(templateName+'.html', templateCode);
            console.log("injected template: ",templateName);
            deferred.resolve();
            return deferred.promise;
        };

        return {
            injectScript: injectScript,
            injectTemplate: injectTemplate
        };

    }])

    /**
     * Servizio di utility per rendere un modulo angular Lazy
     * ovvero rende disponibili in tale modulo le funzioni
     * per registrare service/controller/factory/value/directive
     * anche dopo che il modulo è started
     */
    .provider('lazyModule',[
        '$controllerProvider', '$provide', '$compileProvider' ,
        function($controllerProvider, $provide, $compileProvider ){

            var makeLazyFn = function(app) {

                // Let's keep the older references.
                app._controller = app.controller;
                app._service = app.service;
                app._factory = app.factory;
                app._value = app.value;
                app._directive = app.directive;

                // Provider-based controller.
                app.controller = function( name, constructor ) {
                    $controllerProvider.register( name, constructor );
                    return( this );
                };

                // Provider-based service.
                app.service = function( name, constructor ) {
                    $provide.service( name, constructor );
                    return( this );
                };

                // Provider-based factory.
                app.factory = function( name, factory ) {
                    $provide.factory( name, factory );
                    return( this );
                };

                // Provider-based value.
                app.value = function( name, value ) {
                    $provide.value( name, value );
                    return( this );
                };

                // Provider-based directive.
                app.directive = function( name, factory ) {
                    $compileProvider.directive( name, factory );
                    return( this );
                };
                // NOTE: You can do the same thing with the "filter"
                // and the "$filterProvider"; not implemented here
            };

            var self = this;
            this.makeLazy = function(moduleName) {
                var module = angular.module(moduleName);
                makeLazyFn(module);
            };
            this.$get = [function(){
                return {
                    makeLazy: self.makeLazy
                }
            }];
        }])


    /*
     * This directive is a workaround for the md-component-id attribute of the
     * mdSidenav directive.
     *
     * The mdSidenav directive, in its controller function, registers the element
     * using the md-component-id attribute. If we need this value to be an
     * expression to be evaluated in the scope, we can't do
     *
     * <md-sidenav md-component-id="{{ expr }}" [...]>
     *
     * because the curly braces are replaced in a subsequent stage. To work around
     * this, this directive replace the value of md-component-id with the value of
     * that expression in the scope. So the previous example becomes
     *
     * <md-sidenav md-component-id="expr" eval-attr-as-expr="mdComponentId" [...]>
     */
    .directive('evalAttrAsExpr', function evalAttrAsExpr() {
        return {
            restrict: 'A',
            controller: function($scope, $element, $attrs) {
                var attrToEval = $attrs.evalAttrAsExpr;
                $attrs[attrToEval] = $scope.$eval($attrs[attrToEval]);
            },
            priority: 9999
        };
    })

;

