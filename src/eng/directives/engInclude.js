'use strict';

angular.module('engModule')

/**
 * Direttiva generica che include dinamicamente un'altra
 * direttiva il cui nome viene passato sull'attributo
 * directive
 *
 * oppure compila e include un template passatu sull'attrubuto
 * template
 *
 * gli attributi alla direttiva inclusa possono essere passati usando attributi con prefisso: 'include-attr-'
 * il prefisso viene tolto prima di passare gli attributi alla direttiva inclusa
 *
 */
.directive('engInclude',['$compile',function($compile) {
    return {
        restrict: 'E',

        link: function (scope, element, attrs) {

            var bodyElement = element;
            var childScope = null;

            var toSnakeCase = function(str) {
                if (angular.isString(str)) {
                    var newStr = str[0].toLowerCase() + str.slice(1);
                    return newStr.replace(/([A-Z])/g, function($1){
                        return '-'+$1.toLowerCase();
                    });
                }
                return null;
            }

            var createNewChildScope = function() {
                if (attrs.inScope!=null) {
                    var providedParent = scope.$eval(attrs.inScope);
                    if (providedParent) {                    	
                    	return providedParent.$new();
                    }
                }
                return scope.$new();
            };

            var includeDirective = function(directiveName) {
                if (!directiveName) {
                    destroyChildScope(null);
                    bodyElement.replaceWith("<span></span>"); // Replacing
                    bodyElement=el;
                    return;
                }
                var snDirName = toSnakeCase(directiveName);0
                var html = angular.element("<"+snDirName+"></"+snDirName+">");
                angular.forEach(attrs.$attr,function(attrName){
                    if (attrName.indexOf("include-attr-")===0) {
                        html.attr(attrName.substring(13),element.attr(attrName))
                    }
                });
                var newChildScope = createNewChildScope();
                var el = $compile(html)(newChildScope);
                destroyChildScope(newChildScope);
                bodyElement.replaceWith(el); // Replacing
                bodyElement=el;
            };

            var includeTemplate = function(templateText) {
                if (!templateText) {
                    destroyChildScope(null);
                    bodyElement.replaceWith("<span></span>"); // Replacing
                    bodyElement=el;
                    return;
                }
                var newChildScope = createNewChildScope();
                var html = angular.element("<span>"+templateText+"</span>");
                var el = $compile(html)(newChildScope);
                destroyChildScope(newChildScope);
                bodyElement.replaceWith(el); // Replacing
                bodyElement=el;
            };

            var destroyChildScope = function(newChildScope) {
                if (childScope!=null) {
                    childScope.$destroy();
                }
                childScope = newChildScope;
            };

            attrs.$observe('directive', function(val) {
                if (val) {
                    includeDirective(val);
                } else {
                    destroyChildScope(null);
                    var el = angular.element("<div style='display:none'></div>");
                    bodyElement.replaceWith(el);
                    bodyElement = el;
                }
            });

            attrs.$observe('template', function(val) {
                if (val) {
                    includeTemplate(val);
                } else {
                    destroyChildScope(null);
                    var el = angular.element("<div style='display:none'></div>");
                    bodyElement.replaceWith(el);
                    bodyElement = el;
                }
            });

        }
    }
}])

;