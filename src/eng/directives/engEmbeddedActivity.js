'use strict';

angular.module('engModule')

    /**
     * Direttiva che include una activity embedded all'interno di un'altra activity
     *
     */
    .directive('engEmbeddedActivity',['engApplication','datastore','$q','Activity',
        function(engApplication,datastore,$q,Activity) {

        var openEmbeddedActivity = function(containerActivity,containerPage,activityName,params,targetElement) {

            return engApplication.getActivityDef(activityName).then(function(activityDef){

                if (activityDef==null) {
                    throw "Activity con nome: "+activityName+" non trovata.";
                }
                var newActivity = new Activity({
                    activityDef: activityDef,
                    parentActivity: null,
                    containerActivity: containerActivity,
                    params: params,
                    page: containerActivity?containerActivity.page:containerPage
                });

                if (containerActivity) {
                    var onOpen = containerActivity.onOpenEmbeddedActivity(newActivity);
                    if (!onOpen) {
                        return;
                    }
                }

                return $q.when(onOpen).then(function(){
                    return newActivity.showInto(targetElement).then(function(){
                        newActivity.start();
                        return newActivity;
                    });
                });
            });

        };


        return {
            restrict: 'E',
            template: "<div></div>",
            scope: {
                containerActivity: "=",
                containerPage: "=",
                activityName: "=",
                bindActivityTo: "="
            },
            link: function(scope,element,attrs) {

                var containerActivity = scope.containerActivity;
                var containerPage = scope.containerPage;
                var params = {};
                var targetElement = element;

                openEmbeddedActivity(
                    containerActivity,
                    containerPage,
                    scope.activityName,
                    params,
                    targetElement).then(function(embedActivity){
                        if (scope.bindActivityTo) {
                            scope.bindActivityTo = embedActivity;
                        }
                });
            }
        };

    }])

;
