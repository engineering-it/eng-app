'use strict';

angular.module('engModule')

    .directive('engImgEmbeddedField',['engCommonFields',function(engCommonFields) {
        return {
            restrict: 'E',
            templateUrl: '/eng-app-src/eng/fieldEditors/imgembedded/engImgEmbeddedField.html',
            scope: {
                fieldModel: '=',
                beanModel: '='
            },
            link : function(scope, element, attrs) {
                engCommonFields.link(scope);

                var fileInput = element.find('.fileInput');

                var updateProgress = function(progressEvent) {
                    scope.$apply(function(){
                        if (progressEvent.lengthComputable) {
                            var percentLoaded = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                            if (percentLoaded < 100) {
                                scope.progress = percentLoaded;
                            }
                        }
                    });
                };

                var updateModel = function() {
                    var reader = new FileReader();
                    reader.onload = function(onLoadEvent) {
                        //console.log("load result ",onLoadEvent.target.result);
                        scope.$apply(function(){
                            scope.beanModel[scope.fieldModel.propertyName]=onLoadEvent.target.result;
                        });
                    };

                    reader.onprogress = updateProgress;
                    /*
                    reader.onerror;
                    reader.onabort;
                    reader.onloadstart;
                    */

                    reader.readAsDataURL(fileInput[0].files[0]);
                };

                fileInput.bind('change', updateModel);

                scope.progress = 100;

                scope.onFileClick = function() {
                    fileInput.click();
                };
            }
        };
    }])

;