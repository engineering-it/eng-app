'use strict';

angular.module('engModule')

    /**
     * Direttiva che mostra un editor javascript dell'oggetto.
     */
    .directive('engCodeEditField',['engCommonFields',function(engCommonFields) {
        return {
            restrict: 'E',
            templateUrl: '/eng-app-src/eng/fieldEditors/code/codeEditField.html',
            scope: {
                fieldModel: '=',
                beanModel: '='
            },
            link: {
                pre: function(scope, element, attrs) {
                    engCommonFields.link(scope);

                    scope.toggleMaximize = function() {
                        var el = $(element);

                        if (el.hasClass('code-field-maximized')) {
                            el.removeClass('code-field-maximized');
                            el.find(".aceEditorDiv").height(150);
                            scope.editor.resize();
                        } else {
                            el.addClass('code-field-maximized');
                            el.find(".aceEditorDiv").height(600);
                            scope.editor.resize();
                        }
                    };

                    var init = function() {
                    };

                    scope.aceLoaded = function(editor){
                        var session = editor.getSession();
                        editor.$blockScrolling = Infinity;
                        //scope.editor = editor;
                        editor.setReadOnly(scope.isFieldReadonly());
                        //editor.setTheme("ace/theme/monokai");
                        var mode = "ace/mode/"+(scope.fieldModel.codeType||'javascript');
                        session.setMode(mode);
                        scope.editor = editor;
                    };

                    init();
                }
            }
        };
    }])

    /**
     * Direttiva per la configurazione del campo di tipo codice
     */
    .directive('engCodeEditFieldConfigDir',[function(){
        return {
            restrict: 'E',
            scope: {
                propertyModel: "="
            },
            templateUrl: '/eng-app-src/eng/fieldEditors/code/engCodeEditFieldConfigDir.html',
            link : function(scope, element, attrs) {
            }
        };
    }])

;