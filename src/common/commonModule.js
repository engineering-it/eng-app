'use strict';

angular.module('commonModule', [])

    .constant('weekDaysNames',['LUN','MAR','MER','GIO','VEN','SAB','DOM'])

    .constant('getWeekDayNum',function(date) {
        var i = date.getDay();
        return (i===0)?6:i-1;
    })

    .filter('weekDay',['getWeekDayNum','weekDaysNames',function(getWeekDayNum,weekDaysNames) {
        return function(date) {
            if (date instanceof Date) {
                return weekDaysNames[getWeekDayNum(date)];
            }
            return date;
        };
    }])

    .factory('dateUtils',[function(){
        var obj = {};

        obj.now = function() {
            return new Date();
        };

        obj.dayDate = function(date) {
            return new Date(1900+date.getYear(),date.getMonth(),date.getDate());
        };

        obj.today = function() {
            return obj.dayDate(obj.now());
        };

        obj.prevDay = function(date) {
            return new Date(date.getTime()-(1000*60*60*24));
        };
        obj.nextDay = function(date) {
            return new Date(date.getTime()+(1000*60*60*24));
        };

        obj.compareDays = function(date1,date2) {
            date1 = obj.toDate(date1);
            date2 = obj.toDate(date2);
            return obj.dayDate(date2).getTime()-obj.dayDate(date1).getTime();
        };

        obj.toDate = function(input) {
            if (typeof input === 'string') {
                if (input.indexOf("tm@")==0) {
                    return new Date(parseInt(input.substring(3)));
                }
            }
            return input;
        };

        return obj;
    }])

    .filter('dateText',['dateUtils',function (dateUtils) {
        return function (input) {
            return dateUtils.toDate(input);
        }
    }])

    .factory('serializer',[function(){

        var firebaseSerializer = function(k, v){
            if (k) {
                if (k.indexOf('$')==0) {
                    return undefined;
                }
                var val = this[k];
                if (val instanceof Date) {
                    return "tm@" + val.getTime();
                }
            }
            return v;
        };

        var firebaseRiviver = function(k,v){
            if (typeof v === 'string') {
                if (v.indexOf("tm@")==0) {
                    return new Date(parseInt(v.substring(3)));
                }
            }
            return v;
        };

        var toJson= function(obj) {
            return JSON.stringify(obj,firebaseSerializer);
        };

        var fromJson= function(json) {
            return JSON.parse(json,firebaseRiviver);
        };

        var transformRequest = function(data,headersGetter,status) {
            return angular.isObject(data) ? toJson(data) : data;
        };

        var transformResponse = function(data,headersGetter,status) {
            return fromJson(data);
        };

        return {
            toJson: toJson,
            fromJson: fromJson,
            transformRequest: transformRequest,
            transformResponse: transformResponse
        };

    }])

    .directive('ngEnter',[function () {
        return {
            link: function (scope, elements, attrs) {
                elements.bind('keydown keypress', function (event) {
                    if (event.which === 13) {
                        scope.$eval(attrs.ngEnter,{'$event': event});
                        event.preventDefault();
                    }
                });
            }
        };
    }])

    .directive('match',['$parse',function($parse) {
        return {
            require: '?ngModel',
            restrict: 'A',
            link: function (scope, elem, attrs, ctrl) {
                if (!ctrl) {
                    return;
                }

                var matchGetter = $parse(attrs.match);
                var caselessGetter = $parse(attrs.matchCaseless);
                var noMatchGetter = $parse(attrs.notMatch);

                scope.$watch(getMatchValue, function () {
                    ctrl.$$parseAndValidate();
                });

                ctrl.$validators.match = function () {
                    var match = getMatchValue();
                    var notMatch = noMatchGetter(scope);
                    var value;

                    if (caselessGetter(scope)) {
                        value = angular.lowercase(ctrl.$viewValue) === angular.lowercase(match);
                    } else {
                        value = ctrl.$viewValue === match;
                    }
                    /*jslint bitwise: true */
                    value ^= notMatch;
                    /*jslint bitwise: false */
                    return !!value;
                };

                function getMatchValue() {
                    var match = matchGetter(scope);
                    if (angular.isObject(match) && match.hasOwnProperty('$viewValue')) {
                        match = match.$viewValue;
                    }
                    return match;
                }
            }
        };
    }])

;
