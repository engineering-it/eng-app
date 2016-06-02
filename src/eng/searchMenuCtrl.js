'use strict';

angular.module('engModule')

.controller('searchMenuCtrl',
    ['$scope', '$mdSidenav', 'engApplication','engLoginManager','$timeout',
    function ($scope, $mdSidenav, engApplication, engLoginManager, $timeout) {

        var init = function () {

        };

        $scope.searchInput = null;
        $scope.appSearchResults = [];

        var searchScheduled = null;

        var doSearch = function() {
            console.log("searching..");
            var sr = [];
            var m = Math.random()*8;
            for (var i=0; i<m; i++) {
                sr.push({
                    title: 'item '+(new Date().getTime())
                });
            }
            $scope.appSearchResults = sr;
        };

        $scope.$watch('searchInput',function(){
            if (searchScheduled!=null) {
                console.log("cancel ",$timeout.cancel(searchScheduled));
            }
            searchScheduled = $timeout(function(){
                doSearch();
                searchScheduled=null;
            },200);
        });

        init();
    }])
;