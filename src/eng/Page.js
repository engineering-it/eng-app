'use strict';

angular.module('engModule')

.factory('Page',
    ['idGenerator','$rootScope','$q','$injector','Activity','$templateRequest','$compile','$controller','$animate',
    function(idGenerator,$rootScope,$q,$injector,Activity,$templateRequest,$compile,$controller,$animate)
{

    var Page = function(pageDef,parentPage,params) {
        this.id = idGenerator.getNewId();
        this.pageDef = pageDef;
        this.parentPage = parentPage;
        this.params = params;
        if (params && params.mainObject) {
            this.mainObject=params.mainObject;
        }
        this.icon = pageDef.icon||'folder';
        this.activityStack = [];
        var engApplication = $injector.get('engApplication');
        this.engApplication = engApplication;
        this.activityDefs = {};
        this.menu = [];
        this.loadActivitiesDefs(pageDef.activities);
        
        this.initializationPromise = $q.defer();
        var self = this;
        if (pageDef.extends) {
            engApplication.getPageDef(pageDef.extends).then(function(extendsPageDef){
                self.extendsDef = extendsPageDef;
                self.pageDef = angular.extend({},extendsPageDef,pageDef);
                
                var pd = self.pageDef;
                pd.headerDirective=pd.headerDirective?pd.headerDirective:extendsPageDef.headerDirective;
                
                self.initializationPromise.resolve();
            });
        } else {
            self.initializationPromise.resolve();
        }
    };

    Page.prototype.loadActivitiesDefs = function(activities) {
    	var self = this;
    	angular.forEach(activities,function(actConfig){
            if (angular.isString(actConfig)) {
                actConfig = {
                    activity: actConfig
                };
            }
            self.menu.push(actConfig.activity);
            self.engApplication.getActivityDef(actConfig.activity).then(function(activityDef){
            	self.activityDefs[actConfig.activity]=activityDef;
            	self.menu[self.menu.indexOf(actConfig.activity)] = activityDef;
            });
        });
    };
    
    Page.prototype.start = function() {
        if (this.parentPage) {
            this.parentPage.pause();
        }
        this.state="running";

        var target = angular.element('#content');
        var self=this;
        this.showInto(target).then(function(){

            var initialActivityName = self.getInitialActivityName();
            if (initialActivityName!=null) {
                self.openActivity(initialActivityName);
            } else {
                throw "Impossibile individuare activityIniziale nella pagina: "+self.pageDef.name;
            }

        });
    };

    Page.prototype.pause = function() {
        this.state="paused";
        var ca = this.getCurrentActivity();
        if (ca) {
            ca.pause();
        }
    };

    Page.prototype.resume = function() {
        this.state="running";
        var ca = this.getCurrentActivity();
        if (ca) {
            ca.resume();
        }
    };

    Page.prototype.close = function(preventOpenHome) {
        var self = this;
        return this.__closeAllPageActivities().then(function(){
            if (self.view!=null) {
                self.view.remove();
            }
            self.state="closed";
            var wasRootPage = self.isRootPage();
            self.engApplication._internalRemovePage(self);
            if (wasRootPage && preventOpenHome!==true) {
                self.engApplication.openHomePage();
            }
        });
    };

    Page.prototype.__closeAllPageActivities = function() {
        var self = this;
        if (this.getCurrentActivity()!=null) {
            return this.internalCloseCurrentActivity().then(function(){
                return self.__closeAllPageActivities();
            });
        } else {
            return $q.when(null);
        }
    };

    Page.prototype.getInitialActivityName = function() {
        if (this.params && this.params.initialActivity) {
            return this.params.initialActivity;
        }
        return this.pageDef.activities[0].activity;
    };

    Page.prototype.getActivityDefByType = function(type) {
        var find = null;
        angular.forEach(this.activityDefs,function(k){
            if (!find && k[type]) {
                find = k;
            }
        });
        return find;
    };

    /**
     * Propaga un evento in basso $broadcast e in altro $emit
     */
    Page.prototype.fireEvent = function(name) {
        var sc = this.$scope;
        if (sc) {
            var args = Array.prototype.slice.call(arguments, 1);
            sc.$broadcast.apply(sc,[name].concat(args));
            sc.$emit.apply(sc,[name].concat(args));
        }
    };

    Page.prototype.openActivity = function(activityName,params) {
        var self = this;
        return this.engApplication.getActivityDef(activityName).then(function(activityDef){

            if (activityDef==null) {
                throw "Activity con nome: "+activityName+" non trovata.";
            }
            var newActivity = new Activity({
                activityDef: activityDef,
                parentActivity: self.getCurrentActivity(),
                params: params,
                page: self
            });

            var onOpen = self.onOpenActivity(newActivity);
            if (!onOpen) {
                return;
            }

            return $q.when(onOpen).then(function(){
                self.activityStack.push(newActivity);
                self.activityOpened(newActivity);
                return self.getView().then(function(pageView) {
                    var target = pageView.find('.page-content');
                    return newActivity.showInto(target).then(function(){
                        newActivity.start();
                        return newActivity;
                    });
                });
            });
        });
    };

    Page.prototype.onOpenActivity = function(newActivity) {
        return true;
    };

    Page.prototype.activityOpened = function(newActivity) {

    };

    Page.prototype.openRootActivity = function(activityName,params) {
        var self = this;
        return self.__closeAllPageActivities().then(function(){
            return self.openActivity(activityName,params);
        });
    };

    Page.prototype.getActivityDefs = function() {
        return this.activityDefs;
    };

    Page.prototype.getActivityStack = function() {
        return this.activityStack;
    };

    Page.prototype.internalCloseCurrentActivity = function() {
        var curAct = this.getCurrentActivity();
        var indexOf = this.activityStack.indexOf(curAct);
        if (indexOf!=-1){
            return curAct.stop();
        } else {
            return $q.when(null);
        }
    };

    /**
     * Se è correntemente la pagina root dell'applicazione
     * @returns {boolean}
     */
    Page.prototype.isRootPage = function() {
        return this.parentPage==null;
    };

    /**
     * Se l'activity Corrente è la root di questa pagina
     * @returns {boolean}
     */
    Page.prototype.isRootActivity = function() {
        var curAct = this.getCurrentActivity();
        var indexOf = this.activityStack.indexOf(curAct);
        return indexOf===0;
    };

    Page.prototype.isHomeActivity = function() {
        var curAct = this.getCurrentActivity();
        return curAct && curAct.activityDef.homeActivity;
    };

    Page.prototype.closeCurrentActivity = function() {
        var curAct = this.getCurrentActivity();
        if (curAct && curAct.isRoot()) {
            return this.close();
        } else {
            return this.internalCloseCurrentActivity();
        }
    };

    Page.prototype.getCurrentActivity = function() {
        return this.activityStack[this.activityStack.length-1];
    };

    Page.prototype.showInto = function(target) {
        var self = this;
        return this.getView().then(function(pageView) {
            $animate.enter(pageView,target);
            return self;
        });
    };

    Page.prototype.resolveDeps = function() {
        var defer = $q.defer();
        if (this.pageDef.require!=null) {
            require(this.pageDef.require, function () {
                defer.resolve();
            });
        } else {
            defer.resolve();
        }
        return defer.promise;
    };

    Page.prototype.ensureInitialized = function() {
        return this.initializationPromise.promise;
    };
    
    Page.prototype.getView = function() {
        var self= this;
        return this.ensureInitialized().then(function(){
            return self.resolveDeps();
        }).then(function(){
            return self.__getView();
        });
    };
    
    Page.prototype.__getTemplate = function() {
        if (this.pageDef.templateUrl) {
            return $templateRequest(this.pageDef.templateUrl);
        }
        return "<div layout='column' flex layout-fill class='page-content' ></div>";
    };
    
    Page.prototype.__getView = function() {
        var defer = $q.defer();
        if (this.view!=null) {
            defer.resolve(this.view);
            return defer.promise;
        } else {
            var self = this;
            var locals = angular.extend({}, this.pageDef.resolve);
            var template = self.__getTemplate();
            locals['$template'] = template;
            return $q.all(locals).then(function(locals){

                var newScope = $rootScope.$new(true);
                newScope.page = self;
                locals.$scope = newScope;
                self.$scope = newScope;
                return applyControllersToScope(self.pageDef,locals,self.engApplication).then(function(){

                    var elem = angular.element("<div layout='column' flex layout-fill ng-show=\"page.state=='running'\" >"+locals['$template']+"</div>");
                    var link = $compile(elem);
                    self.view = link(newScope);
                    elem.on('$destroy',function(){
                        newScope.$destroy();
                    });
                    return self.view;
                });
            });
        }
    };
    
    var applyControllersToScope = function(pageDef,locals,engApplication) {
        var pre;
        if (pageDef.extends) {
            pre = engApplication.getPageDef(pageDef.extends)
                .then(function (extendPageDef) {
                    return applyControllersToScope(extendPageDef, locals, engApplication);
                });
        } else {
            pre = $q.when(null);
        }
        return pre.then(function(){
            if (pageDef.controller) {
                console.log("Apply To Page Scope Controller ",pageDef.controller);
                var controller = $controller(pageDef.controller, locals);
            }
        });
    };

    Page.prototype.getMenu = function() {
        return this.menu;
    };

    return Page;
}])

;