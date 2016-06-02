'use strict';

angular.module('engModule')

/**
 * Direttiva che viasualizza un eng property template risolvaendo i valori delle proprietà
 */
.directive('engPropertyTemplate',['datastore','$q','$filter',function(datastore,$q,$filter) {
	
	var count=0;
	
	return {
        restrict: 'EA',
        scope: {
        	entityBean: "=",
        	template: "="
        },
        link : function($scope, element, attrs) {
        	
        	var formatValue = function(value) {
        		var textValue = value;
                if (angular.isDate(value)) {
                    textValue = $filter('date')(value,"shortDate");
                }
                if (angular.isArray(value)) {
                    textValue = value.join(",");
                }
                return textValue;
        	};
        	
        	var resolveTemplateElementValue = function(bean,templateDef) {
        		if (!templateDef.template || !templateDef.template.propertyName) {
        			return $q.when("");
        		}
        		var val = bean[templateDef.template.propertyName];
        		if (!templateDef.template.lookup) {
        			return $q.when(val);
        		} else {
        			if (!val) {
        				return $q.when("");
        			}
        			var lookupDef = templateDef.template.lookup;
        			return datastore.getEntityById(lookupDef.sourceEntity,val).then(function(refBean){
        				return resolveTemplateElementValue(refBean,{
        					template: lookupDef
        				});
        			});
        		}
        	};
        	
        	var setTemplateElement = function(templateDef,elId) {
        		resolveTemplateElementValue($scope.entityBean,templateDef).then(function(htmlValue){
        			element.find('#'+elId).html(formatValue(htmlValue));
        		});
			};
        	
        	$scope.$watch('template',function(newVal) {
        		if (newVal) {
        			var tplElements = [];
        			newVal.forEach(function(v){
        				var id = "eltpl_"+(count++);
        				tplElements.push("<span class='el-tpl-value' id='"+id+"'></span>");
        				setTemplateElement(v,id);
        			});
        			element.html(tplElements.join(""));
        		}
        	});
        }
	};
}])

/**
 * Direttiva che consente di visualizzare un Editor per creare un
 * engPropertyTemplate su più proprietà
 */
.directive('engPropertyTemplateField',['engCommonFields','datastore',function(engCommonFields,datastore) {
    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/fieldEditors/propertyTemplate/engPropertyTemplateField.html',
        scope: {
            fieldModel: '=',
            beanModel: '='
        },
        link : function($scope, element, attrs) {
            engCommonFields.link($scope);
        }
    };
}])


/**
 * Direttiva che consente di visualizzare un Editor per creare un
 * engPropertyTemplate su una singola proprietà
 */
.directive('engSinglePropertyTemplateField',['engCommonFields','datastore',function(engCommonFields,datastore) {
    return {
        restrict: 'E',
        templateUrl: '/eng-app-src/eng/fieldEditors/propertyTemplate/engSinglePropertyTemplateField.html',
        scope: {
            fieldModel: '=',
            beanModel: '='
        },
        link : function($scope, element, attrs) {
            engCommonFields.link($scope);
        }
    };
}])

.directive('engEntityPropertySelector',['datastore',function(datastore) {
	 return {
	        restrict: 'E',
	        templateUrl: '/eng-app-src/eng/fieldEditors/propertyTemplate/engEntityPropertySelector.html',
	        scope: {
	            property: '=',
	            sourceEntity: '='
	        },
	        link : function($scope, element, attrs) {
	        	
	        	$scope.sourceEntityDef = null;
	            $scope.sourceEntityProperties = [];
	            
	            $scope.$watch('sourceEntity',function(newVal) {
	            	loadSourceEntityProperties(($scope.property?$scope.property.sourceEntity:false)||$scope.sourceEntity);
	            });
	            $scope.$watch('property.sourceEntity',function(newVal) {
	            	loadSourceEntityProperties(($scope.property?$scope.property.sourceEntity:false)||$scope.sourceEntity);
	            });
	            $scope.$watch('property.propertyName',function(newVal) {
	            	if (newVal) {
	            		var objVal = $scope.sourceEntityProperties.find(function(v){
	            			return v.value==newVal;
	            		});
	            		var pd = objVal.propDescriptor;
	            		if (pd.propertyType=='LOOKUP') {	            			
	            			$scope.property.lookup = {
	            				sourceEntity: pd.refEntityName,
	            				propertyName: null
	            			};
	            		} else {
	            			$scope.property.lookup = null;
	            		}
	            	}
	            });
	               
	            
	            var loadSourceEntityProperties = function(entityName) {
	            	if (entityName) {
	                    datastore.getEntityById('entities',{keyName:'name',keyValue:entityName})
	                        .then(function(entityDef) {
	                        	$scope.sourceEntityDef=entityDef;
	                        	calcSourceEntityProperties();
	                        });
	                } else {
	                	$scope.sourceEntityDef = null;
	                	$scope.mainObjectEntityProperties = [];
	                }
	            };
	            
	            var calcSourceEntityProperties = function(){
	        		if ($scope.sourceEntityDef) {
		                var vals = [];
		                $scope.sourceEntityDef.properties.forEach(function(val){
		                    vals.push({
		                        text: val.propertyLabel||val.propertyName,
		                        value: val.propertyName,
		                        desc: val.propertyType,
		                        tooltip: val.propertyHints,
		                        propDescriptor: val
		                    });
		                });
		                $scope.sourceEntityProperties = vals;
		            } else {
		            	$scope.sourceEntityProperties = [];
	        		}
	            }
	        	
	        }
	 };
}]);



;