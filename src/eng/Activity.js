'use strict';

angular.module('engModule')

.factory('Activity',
    ['idGenerator','$rootScope','$q','$templateRequest','$compile','$controller','$animate','$injector',
    function(idGenerator,$rootScope,$q,$templateRequest,$compile,$controller,$animate,$injector)
{

    var Activity = function(config) {

        //args
        var activityDef = config.activityDef;
        var parentActivity = config.parentActivity;
        var params= config.params;
        var page = config.page;

        var self = this;
        this.id = idGenerator.getNewId();
        var engApplication = $injector.get('engApplication');
        this.engApplication = engApplication;
        var datastore = $injector.get('datastore');
        this.datastore = datastore;
        this.params = params;
        this.page = page;
        this.parentActivity = parentActivity;
        this.actions = [];
        this.applyedControllers=[];

        this.initializationPromise = $q.defer();
        if (activityDef.extends) {
            engApplication.getActivityDef(activityDef.extends).then(function(extendsActivityDef){
                self.extendsDef = extendsActivityDef;
                self.activityDef = angular.extend({},extendsActivityDef,activityDef);
                self.initializationPromise.resolve();
            });
        } else {
            self.initializationPromise.resolve();
        }
        this.activityDef = activityDef;
        this.titleTpl = activityDef.titleTpl || activityDef.title;
    };

    Activity.prototype.onOpenEmbeddedActivity = function(newActivity) {
        return this.page.onOpenActivity(newActivity);
    };

    Activity.prototype.stop = function() {
        var self = this;
        return this.__stop().then(function(){

            var page = self.page;
            var indexOf = page.activityStack.indexOf(self);
            if (indexOf!=-1) {
                page.activityStack.splice(indexOf, 1);
            }

            var prev = self.getPrevious();
            if (prev) {
                return prev.resume();
            } else {
                return $q.when(null);
            }
        });
    };

    Activity.prototype.__removeView = function() {
        if (this.view!=null) {
            this.view.remove();
        }
    };

    Activity.prototype.__stop = function() {
        var self = this;
        if (this.closingFn) {
            return this.closingFn().then(function(){
                self.__removeView();
            });
        } else {
            self.__removeView();
            return $q.when(null);
        }
    };

    Activity.prototype.getPrevious = function() {
        if (this.parentActivity) {
            return this.parentActivity;
        } else if (this.page.parentPage) {
            return this.page.parentPage;
        }
    };

    Activity.prototype.pause = function() {
        this.state="paused";
        return $q.when(null);
    };

    Activity.prototype.resume = function() {
        this.state="running";
        return $q.when(null);
    };

    Activity.prototype.start = function() {
        var prev = this.getPrevious();
        if (prev) {
            prev.pause();
        }
        this.state="running";
        return $q.when(null);
    };

    Activity.prototype.showInto = function(target) {
        var self = this;
        return this.getView().then(function(activityView) {
            $animate.enter(activityView,target);
            return self;
        });
    };

    Activity.prototype.resolveDeps = function() {
        var defer = $q.defer();
        if (this.activityDef.require!=null) {
            require(this.activityDef.require, function () {
                defer.resolve();
            });
        } else {
            defer.resolve();
        }
        return defer.promise;
    };

    Activity.prototype.ensureInitialized = function() {
        return this.initializationPromise.promise;
    };

    Activity.prototype.getView = function() {
        var self= this;
        return this.ensureInitialized().then(function(){
            return self.resolveDeps();
        }).then(function(){
            return self.__getView();
        });
    };

    Activity.prototype.__getTemplate = function() {
        if (this.activityDef.templateResource) {
            return $templateRequest("engData/templates/"+this.activityDef.templateResource+".html");
        }
        if (this.activityDef.templateUrl) {
            return $templateRequest(this.activityDef.templateUrl);
        }
        return "<div>Activity without templete</div>";
    };

    Activity.prototype.__getView = function() {
        var defer = $q.defer();
        if (this.view!=null) {
            defer.resolve(this.view);
            return defer.promise;
        } else {
            var self = this;
            var locals = angular.extend({}, this.activityDef.resolve);
            var template = self.__getTemplate();
            locals['$template'] = template;
            return $q.all(locals).then(function(locals){

                var newScope = self.page.$scope.$new(true);
                newScope.activity = self;
                locals.$scope = newScope;
                self.$scope = newScope;
                return applyControllersToScope(self,self.activityDef,locals,self.engApplication).then(function(){

                    var elem = angular.element("<div layout='column' flex layout-fill ng-show=\"activity.state=='running'\" >"+locals['$template']+"</div>");
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

    var applyControllersToScope = function(activity,activityDef,locals,engApplication) {
        var pre;
        if (activityDef.extends) {
            pre = engApplication.getActivityDef(activityDef.extends)
                .then(function (extendActivityDef) {
                    return applyControllersToScope(activity,extendActivityDef, locals, engApplication);
                });
        } else {
            pre = $q.when(null);
        }
        return pre.then(function(){
            if (activityDef.controller && !activity._isControllerApplyed(activityDef.controller)) {
                console.log("Apply To Activity Scope Controller ",activityDef.controller);
                var controller = $controller(activityDef.controller, locals);
                activity._setControllerApplyed(activityDef.controller);
            }
        });
    };

    Activity.prototype._setControllerApplyed = function(controllerName) {
    	this.applyedControllers.push(controllerName);
    };
    
    Activity.prototype._isControllerApplyed = function(controllerName) {
    	return this.applyedControllers.indexOf(controllerName)!=-1;
    };
    
    Activity.prototype.isRoot = function() {
        return this.parentActivity==null;
    };

    Activity.prototype.isPageRoot = function() {
        return this.page.activityStack.length>=0 && this.page.activityStack[0]===this;
    };

    Activity.prototype.getActionByName = function(actionName) {
    	return this.actions.find(function(act){
    		return act.name===actionName;
    	});
    };

    Activity.prototype.wrapActivityAction = function(actionName, wrappingFunction) {
    	var action = this.getActionByName(actionName);
    	var wrappedFunction = action.fn;
    	action.fn = function() {
    		return wrappingFunction(wrappedFunction);
    	};
    	return action;
    };
    
    return Activity;
}])

;