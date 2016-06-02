'use strict';

angular.module('engModule')

    .config(['datastoreProvider',function(datastoreProvider) {

        datastoreProvider
            .addConfiguredStore('pages', 'codedPagesStore')
            .addConfiguredStore('activities', 'codedActivitiesStore')
            .addConfiguredStore('entities', 'codedEntitiesStore')
        ;

    }])

    .factory('codedPagesStore',['engApplication','DictionaryStore',function(engApplication,DictionaryStore){
        return new DictionaryStore('codedPagesStore',engApplication.getRegisteredPageDefs(),'name');
    }])

    .factory('codedActivitiesStore',['engApplication','DictionaryStore',function(engApplication,DictionaryStore){
        return new DictionaryStore('codedActivitiesStore',engApplication.getRegisteredActivityDefs(),'name');
    }])

    .factory('codedEntitiesStore',['engApplication','DictionaryStore',function(engApplication,DictionaryStore){
        return new DictionaryStore('codedEntitiesStore',engApplication.getRegisteredEntityDefs(),'name');
    }])

;