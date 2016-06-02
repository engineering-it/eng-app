'use strict';

angular.module('configModule')

    /**
     * Controller che gestisce l'Activity di gestione della configurazione
     */
    .controller('ConfigurationCtrl',
        ['$scope','engApplication','engLoginManager','localstore','$rootScope','$translate',
        function($scope,engApplication,engLoginManager,localstore,$rootScope,$translate){

            var init = function() {
                $scope.appConfig = localstore.getObject("appConfig")||{};
            };

            $scope.activity.actions = [{
                icon: 'done',
                fn: function() {
                    localstore.putObject("appConfig",$scope.appConfig);
                    $rootScope.$broadcast("appConfigChanged",$scope.appConfig);
                }
            },{
                icon: 'refresh',
                fn: function() {
                    init();
                }
            }];

            var langs = ['it','en'];
            var idxLang = 0;

            $scope.currLang = function() {
                return langs[idxLang];
            };

            $scope.changeLanguage = function (langKey) {
                idxLang++;
                if (idxLang>=langs.length) {
                    idxLang=0;
                }
                $translate.use($scope.currLang());
            };

            init();

        }])

    .controller('ConfigurationThemesCtrl',
        ['$scope','engApplication','engLoginManager','datastore','$rootScope','$mdTheming','engThemingService',
            function($scope,engApplication,engLoginManager,datastore,$rootScope,$mdTheming,engThemingService){

                var init = function() {
                    $scope.editItem={
                        currentTheme: engApplication.currentTheme
                    };
                    console.log($mdTheming);

                    $scope.availableApplicationThemes = engThemingService.getAvailableApplicationThemes();

                    $scope.$watch("editItem.currentTheme",function(val){
                        engApplication.currentTheme = val;
                    });

                };

                $scope.createNewTheme = function() {
                	engApplication.openActivity('configuration.theme.edit');
                };

                $scope.showThemes = function() {
                	engApplication.openActivity('configuration.theme.list');
                };

                init();

            }])
;