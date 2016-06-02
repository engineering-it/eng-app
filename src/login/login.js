'use strict';

angular.module('loginModule')

    .controller('LoginCtrl',[ '$scope','engApplication','engLoginManager','$mdToast',
        function($scope,engApplication,engLoginManager,$mdToast) {

        $scope.user = {};

        $scope.activity.actions = [{
            icon: 'settings',
            fn: function() {
                engApplication.openPage('configurationPage');
            }
        }];

        $scope.login = function() {
            if (!$scope.user.username) {
                showError("Inserisci il Nome Utente");
            } else if (!$scope.user.password) {
                showError("Inserisci la Passworde");
            } else {
                engApplication.loading = true;
                engLoginManager.checkUser($scope.user).then(function(user){
                    $scope.loading = false;
                    engLoginManager.setCurrentUser(user);
                    engApplication.loading = false;
                },function(err){
                    showError(err);
                    engApplication.loading = false;
                });
            }
        };

        var showError = function(errText) {
            if (errText && errText.shown) {
                return;
            }
            var toast = $mdToast.simple()
                .textContent(errText)
                .hideDelay(3000);
            $mdToast.show(toast);
        };

    }])
;