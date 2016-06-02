'use strict';

angular.module('engModule')

.factory('engLoginManager', ['$injector','$q','localstore','datastore','$rootScope',
    function ($injector,$q,localstore,datastore,$rootScope)
    {

        var currentUser = null;

        var afterUserChange = function(){
            localstore.putObject('loggedUser',currentUser);
            $rootScope.$broadcast("loggedUserChanged",currentUser);
            var engApplication = $injector.get('engApplication');
            if (!currentUser) {
                return engApplication.openLoginPage();
            } else {
                return engApplication.openHomePage();
            }
        };

        var setCurrentUser = function(user) {
            var prev = currentUser;
            currentUser = user;
            if (!prev || prev!==user) {
                return afterUserChange();
            }
            return currentUser;
        };

        var checkUser = function(user) {
            var deferred = $q.defer();
            if (!user) {
                deferred.reject("Utente non specificato");
            } else {

                datastore.getEntityById("users",{
                    keyName: 'username',
                    keyValue: user.username
                }).then(function(userBean) {
                    if (!userBean) {
                        console.log("User by username ",user.username," not found");
                        deferred.reject("User not found");
                        return;
                    }
                    if (userBean.password===user.password) {
                        deferred.resolve({
                            password: userBean.password,
                            username: userBean.username,
                            ruoli: userBean.ruoli,
                        });
                    } else {
                        console.log("Incorrect password for username ",user.username);
                        deferred.reject("Incorrect password");
                        return;
                    }
                },function(error){
                    deferred.reject(error);
                });

            }
            return deferred.promise;
        };

        var checkLoggedUser = function() {
            var u = localstore.getObject('loggedUser');
            return checkUser(u).then(function(user){
                return setCurrentUser(user);
            },function() {
                return setCurrentUser(null);
            });
        };

        return {
            checkUser: checkUser,
            checkLoggedUser: checkLoggedUser,
            getCurrentUser : function() {
                return currentUser;
            },
            setCurrentUser : setCurrentUser
        };

    }])

;