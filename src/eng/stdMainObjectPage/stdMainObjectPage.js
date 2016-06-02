'use strict';

angular.module('engModule')

/**
 * Controller della pagina
 */
.controller('StdMainObjectPageCtrl',['$scope',function($scope){

	//Empty Ctrl
	
}])


/**
 * Direttiva di Header della pagina
 */
.directive('stdMainObjectPageHeaderDir',['datastore', function(datastore) {
    return {
        restrict: 'E',
        scope: {
            page: '='
        },
        templateUrl: "/eng-app-src/eng/stdMainObjectPage/stdMainObjectPageHeaderDir.html",
        link: function ($scope, element, attrs) {
        	
            element.css('display', 'flex');
            element.css('flex-direction', 'row');
            element.css('align-items', 'center');
            
            $scope.mainObjectImgSrcFn = function() {
            	return null;
            };
            
            $scope.mainObjectProperties = function() {
            	return $scope.page.pageDef.showMainObjectProperties;
            };
            
            $scope.hasList = function() {
            	return false;
            };
            
            $scope.prev = function() {
            };
            
            $scope.next = function() {
            };
            
        }
    }
}])

/**
 * Direttiva di configurazione per la pagine di tipo  StdMainObjectPageCtrl
 */
.directive('stdMainObjectPageConfigDir',['datastore', function(datastore) {
    return {
        restrict: 'E',
        scope: {
            pageDef: '='
        },
        templateUrl: "/eng-app-src/eng/stdMainObjectPage/stdMainObjectPageConfigDir.html",
        link : function($scope, element, attrs) {

        	$scope.$watch('pageDef.mainObjectEntity',function(newVal,oldVal){
                if (newVal) {
                    datastore.getEntityById('entities',{keyName:'name',keyValue:newVal})
                        .then(function(entityDef) {
                            if (entityDef) {
                                var vals = [];
                                entityDef.properties.forEach(function(val){
                                    vals.push({
                                        text: val.propertyLabel||val.propertyName,
                                        value: val.propertyName,
                                        tooltip: val.propertyHints
                                    });
                                });
                                $scope.mainObjectEntityProperties = vals;
                            }
                        });
                } else {
                    scope.mainObjectEntityProperties = [];
                }
            });
        }
    }
}])

    
;