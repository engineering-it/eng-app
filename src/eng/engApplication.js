'use strict';

angular.module('engModule')

    /**
     * Servizio Facade per la piattaforma.
     * Espone i metodi di:
     *  - registrazione pagine e activity
     *  - apertura pagine e activity/navigazione
     */
    .provider('engApplication',[function() {

        var provider = this;

        var pageDefs = {};
        var activityDefs = {};
        var entitiesDefs = {};

        this.currentTheme = null;
        this.addPage = function(pageConfig) {
            pageDefs[pageConfig.name]= pageConfig;
            return provider;
        };

        this.addActivity = function (activityConfig) {
            activityDefs[activityConfig.name] = activityConfig;
            return provider;
        };

        this.addEntity = function (entityDef) {
            entitiesDefs[entityDef.name] = entityDef;
            return provider;
        };

        this.getPageDefs = function () {
            return pageDefs;
        };
        this.getActivityDefs = function () {
            return activityDefs;
        };
        this.getEntityDefs = function () {
            return entitiesDefs;
        };

        this.getPageDef = function(pageName) {
            return pageDefs[pageName];
        };
        this.getActivityDef = function(activityName) {
            return activityDefs[activityName];
        };

        var getPageDefByType = function(type) {
            var find = null;
            angular.forEach(pageDefs,function(k){
                if (!find && k[type]) {
                    find = k;
                }
            });
            return find;
        };

        this.getLoginPageDef = function() {
            return getPageDefByType('loginPage');
        };

        this.getHomePageDef = function() {
            return getPageDefByType('homePage');
        };


        // 'engApplication'
        this.$get = ['Page','Activity','engLoginManager','datastore','$q','$rootScope',
            function(Page,Activity,engLoginManager,datastore,$q,$rootScope) {

            var pagesStack = [];

            var setLoggedUser = function(user) {
                return engLoginManager.setCurrentUser(user);
            };

            var getLoggedUser = function() {
                return engLoginManager.getCurrentUser();
            };

            var getPagesStack = function() {
                return pagesStack;
            };

            var closeAllPages = function() {
                var cp = getCurrentPage();
                if(cp!=null) {
                    return cp.close(true).then(function(){
                        return closeAllPages();
                    });
                } else {
                    return $q.when(null);
                }
            };

            var openRootPage = function(pageName,params) {
                var self = this;
                return closeAllPages().then(function(){
                    return openPage(pageName,params);
                });
            };

            var openPage = function(pageName,params) {
                return getPageDef(pageName).then(function(pageDef){
                    var newPage = new Page(pageDef,getCurrentPage(),params);
                    pagesStack.push(newPage);
                    $rootScope.$broadcast('engPageOpened',newPage);
                    return newPage.start();
                });
            };

            var getCurrentPage = function() {
                return pagesStack[pagesStack.length-1];
            };

            var openActivity = function(activityName,params) {
                var cp = getCurrentPage();
                return cp.openActivity(activityName,params);
            };

            var openRootActivity = function(activityName,params) {
                var cp = getCurrentPage();
                return cp.openRootActivity(activityName,params);
            };

            var closeCurrentActivity = function() {
                var cp = getCurrentPage();
                return cp.closeCurrentActivity();
            };

            var getCurrentActivity = function(pageName) {
                var cp = getCurrentPage();
                return cp?cp.getCurrentActivity():null;
            };

            var openHomePage = function() {
                return getHomePageDef().then(function(homePageDef){
                    return openRootPage(homePageDef.name);
                });
            };

            var openLoginPage = function() {
                return getLoginPageDef().then(function(loginPageDef){
                    return openRootPage(loginPageDef.name);
                });
            };

            var internalRemovePage = function(pag) {
                var indexOf = pagesStack.indexOf(pag);
                if (indexOf!=-1){
                    pagesStack.splice(indexOf,1);
                }
            };

            //-----------------//

            var getPageDefs = function () {
                return datastore.retrieveData('pages');
            };
            var getActivityDefs = function () {
                return datastore.retrieveData('activities');
            };

            var getPageDef = function(pageName) {
                return datastore.getEntityById('pages',{keyName:'name',keyValue:pageName});
            };
            var getActivityDef = function(activityName) {
                return datastore.getEntityById('activities',{keyName:'name',keyValue:activityName});
            };

            var getLoginPageDef = function() {
                return $q.when(provider.getLoginPageDef());
            };

            var getHomePageDef = function() {
                return $q.when(provider.getHomePageDef());
            };

            return {
                appTitle: "EngApp",
                currentTheme: provider.currentTheme,

                /**
                 * Restituisce le Definizioni di Pagine registrate via codice su engApplication
                 * (non tutte quelle presenti nel datastore)
                 */
                getRegisteredPageDefs: provider.getPageDefs,

                /**
                 * Restituisce le Definizioni di Activity registrate via codice su engApplication
                 * (non tutte quelle presenti nel datastore)
                 */
                getRegisteredActivityDefs: provider.getActivityDefs,

                /**
                 * Restituisce le Definizioni di Entity registrate via codice su engApplication
                 * (non tutte quelle presenti nel datastore)
                 */
                getRegisteredEntityDefs: provider.getEntityDefs,

                addPage: provider.addPage,
                addActivity: provider.addActivity,

                getPageDefs: getPageDefs,
                getPageDef: getPageDef,
                getActivityDefs: getActivityDef,
                getActivityDef: getActivityDef,
                getHomePageDef: getHomePageDef,
                getLoginPageDef: getLoginPageDef,

                getPagesStack: getPagesStack,

                openRootPage: openRootPage,
                openPage: openPage,
                openActivity: openActivity,
                openRootActivity: openRootActivity,
                closeCurrentActivity: closeCurrentActivity,
                getCurrentActivity: getCurrentActivity,
                getCurrentPage: getCurrentPage,

                setLoggedUser: setLoggedUser,
                getLoggedUser: getLoggedUser,

                _internalRemovePage: internalRemovePage,
                openHomePage: openHomePage,
                openLoginPage: openLoginPage
            };
        }];
    }])

;