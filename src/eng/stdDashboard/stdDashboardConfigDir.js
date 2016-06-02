'use strict';

angular.module('engModule')

    /**
     * Direttiva per la configurazione dell'activity stdDashboard
     */
    .directive('stdDashboardConfigDir',[function(){
        return {
            restrict: 'E',
            scope: {
                activityDef: "="
            },
            templateUrl: '/eng-app-src/eng/stdDashboard/stdDashboardConfigDir.html',
            link : function(scope, element, attrs) {
            }
        };
    }])

;