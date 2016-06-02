'use strict';

angular.module('engModule')

    /**
     * Blocco config di registrazione delle direttive di editing più comuni dei campi
     */
    .config(['fieldsEditorsProvider',function(fieldsEditorsProvider){

        fieldsEditorsProvider.registerFieldEditor('STRING',{
            shortName: "Testo",
            fieldDirective: "engTextField",
            configDirective: "engTextFieldConfigDir",
            tooltip: "Campo di Testo"
        });
        fieldsEditorsProvider.registerFieldEditor('PASSWORD',{
            shortName: "Password",
            fieldDirective: "engPasswordField",
            tooltip: "Campo Password"
        });
        fieldsEditorsProvider.registerFieldEditor('BOOLEAN',{
            shortName: "Booleano",
            fieldDirective: "engBooleanField",
            configDirective: null,
            tooltip: "Campo Booleano"
        });
        fieldsEditorsProvider.registerFieldEditor('NUMBER',{
            shortName: "Numero",
            fieldDirective: "engNumberField",
            configDirective: "engNumberFieldConfigDir",
            tooltip: "Campo Numerico"
        });
        fieldsEditorsProvider.registerFieldEditor('DATE',{
            shortName: "Data",
            fieldDirective: "engDateField",
            configDirective: null,
            tooltip: "Campo Data"
        });
        fieldsEditorsProvider.registerFieldEditor('ARRAY',{
            shortName: "Lista",
            fieldDirective: "engListField",
            configDirective: "engListFieldConfigDir",
            tooltip: "Campo per la gestione di una Lista di Oggetti"
        });
        fieldsEditorsProvider.registerFieldEditor('LOOKUP',{
            shortName: "Lookup",
            fieldDirective: "engLookupField",
            configDirective: "engLookupFieldConfigDir",
            tooltip: "Campo di tipo lookup"
        });
        fieldsEditorsProvider.registerFieldEditor('CHOICE',{
            shortName: "Scelta Valori",
            fieldDirective: "engChoiceField",
            configDirective: "engChoiceFieldConfigDir",
            tooltip: "Campo di scelta di uno o più valori"
        });
        fieldsEditorsProvider.registerFieldEditor('BEAN',{
            shortName: "Bean",
            fieldDirective: "engInnerBeanField",
            configDirective: "engInnerBeanFieldConfigDir",
            tooltip: "Campo per l'inclusione di un Bean innestato"
        });
        fieldsEditorsProvider.registerFieldEditor('BEAN_REF',{
            shortName: "BeanRef",
            fieldDirective: "engReferenceBeanField",
            configDirective: "engReferenceBeanFieldConfigDir",
            tooltip: "Campo per il riferimento 1-1 a un altra entità"
        });
        fieldsEditorsProvider.registerFieldEditor('VALUE_REF_DISPLAY',{
            shortName: "Display Value",
            fieldDirective: "engDisplayValue",
            configDirective: "engDisplayValueConfigDir",
            tooltip: "Campo che permette di visualizzare un valore"
        });
        fieldsEditorsProvider.registerFieldEditor('CODE',{
            shortName: "Programming",
            fieldDirective: "engCodeEditField",
            configDirective: "engCodeEditFieldConfigDir",
            tooltip: "Campo che permette di editare uno script o un template html"
        });
        fieldsEditorsProvider.registerFieldEditor('IMG_EMBEDDED',{
            shortName: "Image",
            fieldDirective: "engImgEmbeddedField",
            //configDirective: "engCodeEditFieldConfigDir",
            tooltip: "Campo che permette di inserire un immagine"
        });
        fieldsEditorsProvider.registerFieldEditor('ICON',{
            shortName: "Icon",
            fieldDirective: "engIconField",
            tooltip: "Campo che permette di inserire una icona"
        });
        /*
        fieldsEditorsProvider.registerFieldEditor('DEFINITION',{
            shortName: "Definizione Bean",
            fieldDirective: "engDefinitionField",
            tooltip: "Campo che permette di definire la struttura di un bean",
            configDirective: null
        });
        */


    }])

    /**
     * Componente per la registrazione delle direttive di editing dei vari tipi di campi
     */
    .provider('fieldsEditors',[function() {

        var provider = this;
        var fieldEditors = {};

        this.registerFieldEditor = function(fieldTypeName,config) {
            config.fieldTypeName = fieldTypeName;
            fieldEditors[fieldTypeName] = config;
        };

        this.$get = ['$injector',
        function ($injector) {

            var getFieldEditor = function(fieldTypeName){
                if (fieldTypeName==null) {
                    fieldTypeName = 'STRING';
                }
                return fieldEditors[fieldTypeName];
            };

            var getFieldEditors = function(){
                return fieldEditors;
            };

            return {
                registerFieldEditor: provider.registerFieldEditor,
                getFieldEditor: getFieldEditor,
                getFieldEditors: getFieldEditors
            };
        }];
    }])

    /**
     * Direttiva per un componente editor di una qualsiasi proprietà di un bean.
     * Viene configurato passandogli un oggetto di tipo PropertyModel.
     */
    .directive('fieldEditor',['fieldsEditors',function(fieldsEditors) {
        return {
            restrict: 'E',
            templateUrl: '/eng-app-src/eng/fieldEditors/fieldEditor.html',
            scope: {
                propertyModel: '=',
                beanModel: '='
            },
            link : function(scope, element, attrs) {

                scope.editFieldDirective = null;

                var init = function() {
                    scope.$watch('propertyModel.propertyType',function(newVal,oldVal){
                        var fieldEditorConfig = fieldsEditors.getFieldEditor(newVal);
                        scope.editFieldDirective = fieldEditorConfig.fieldDirective;
                    });
                };

                init();
            }
        };
    }])

    /**
     * Componente per centralizzare alcune logiche comuni a tutti i Fields
     */
    .factory('engCommonFields',['$parse',function($parse){

        var link = function(scope,noEmitFieldChange) {

            var valueModel = null;
            scope.$watch("fieldModel.propertyName",function(propertyName){
                if (propertyName) {
                    valueModel = $parse(propertyName);
                } else {
                    valueModel = null;
                }
            });

            scope.label = function () {
                if (!scope.fieldModel) {
                    return null;
                }
                return scope.fieldModel.propertyLabel || scope.fieldModel.propertyName;
            };

            scope.isFieldReadonly = function() {
                if (!scope.fieldModel) {
                    return false;
                }
                return scope.fieldModel.readonly || (scope.beanModel && scope.beanModel._readonly);
            };

            var getValue = function() {
                if (!scope.beanModel || !scope.fieldModel) {
                    //console.warn("scope.beanModel or scope.fieldModel is null");
                    return null;
                }
                if (scope.fieldModel.propertyName==='this') {
                    return scope.beanModel;
                }
                return valueModel?valueModel(scope.beanModel):null;
                //scope.beanModel[scope.fieldModel.propertyName];
            };

            var setValue = function(val) {
                //scope.beanModel[scope.fieldModel.propertyName] = val;
                if (valueModel) {
                    valueModel.assign(scope.beanModel,val);
                }
                return val;
            };

            scope.value = function(newValue) {
                return arguments.length?
                    setValue(newValue):getValue();
            };
            scope.getValue = getValue;
            scope.setValue = setValue;


            if (noEmitFieldChange) {

            } else {
                scope.$watch('getValue()',function(newVal,oldVal){
                    if (newVal==oldVal) {
                        //
                    } else {
                        scope.$emit("engFieldChange",{
                            fieldChanged: scope.fieldModel
                        });
                    }
                });
            }
        };

        return {
            link: link
        }
    }])

;