'use strict';

angular.module('configModule')

    /**
     * Servizio per la gestione della configurazione utente
     *
     * //TODO finire l'implementazione
     */
    .provider('configuration',['$windowProvider',function($windowProvider){

        var LOCSTORAGE = $windowProvider.$get().localStorage;
        var provider = this;
        var defaultValues = {};

        var getURLParameter = function(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
        };

        this.getConfigData = function(configKey,defaultValue) {
            var overwrittenVal= getURLParameter(configKey);
            if (overwrittenVal) {
                return overwrittenVal;
            }

            var value = LOCSTORAGE.getItem("configData/"+configKey);
            if (value==null) {
                value=defaultValues[configKey];
            }
            if (value==null) {
                if (defaultValues[configKey]==null) {
                    defaultValues[configKey]=defaultValue;
                }
                value= defaultValues[configKey];
            }
            return value;
        };

        this.setConfigData = function(configKey,value) {
            LOCSTORAGE.setItem("configData/"+configKey,value);
        };

        this.$get = [
            'StoreComposite','$injector',
            function (StoreComposite,$injector) {

                return {
                    getConfigData: provider.getConfigData,
                    setConfigData: provider.setConfigData,
                };
            }];
    }])

    .factory('engThemingService', ['datastore','engApplication','$mdTheming','themeProvider',function(datastore,engApplication,$mdTheming,themeProvider) {
    	var init = function() {
			datastore.retrieveData('configuration.theme',{}).then(function(result){
	        	result.forEach(function(config){
	            	register(config);
	            });
	        });

	        engApplication.currentTheme = 'default';
	        $mdTheming.generateTheme('default');
		};

		var register = function(config) {
			//TODO - gestire il cambio al volo: se già registrato unregistrare e registrare con id diverso (progressivo a suffisso), dopodiché se corrispondente al tema corrente risettare il tema corrente
			var theme = themeProvider.theme(config.id);
			if (config.primaryPalette) {
				theme.primaryPalette(config.primaryPalette);
			}
			if (config.accentPalette) {
				theme.accentPalette(config.accentPalette);
			}
			if (config.warnPalette) {
				theme.warnPalette(config.warnPalette);
			}
			if (config.dark) {
				theme.dark();
			}
			theme.engDescription = config.name;
			$mdTheming.generateTheme(config.id);
			$mdTheming.THEMES = angular.extend({}, themeProvider._THEMES);
		};

		var unregister = function(config) {
			delete themeProvider._THEMES[config.id];
			$mdTheming.THEMES = angular.extend({}, themeProvider._THEMES);
		};

		var getAvailableApplicationThemes = function() {
			var availableApplicationThemes = [];
			angular.forEach($mdTheming.THEMES, function(theme) {
            	availableApplicationThemes.push({
            		text: theme.engDescription ? theme.engDescription : theme.name,
    				value: theme.name
            	});
            });
			return availableApplicationThemes;
		};

		return {
    		init: init,
    		register: register,
    		unregister: unregister,
    		getAvailableApplicationThemes: getAvailableApplicationThemes
    	};
    }])

    .factory('engModuleService', ['engLoginManager',function(engLoginManager) {
    	var showInHomePage = function(module) {
    		return module.showInHomePage && isModuleEnabled(module,engLoginManager.getCurrentUser());
    	};

    	var isModuleEnabled = function(module,currentUser) {
    		return !module.enabledRoles || module.enabledRoles.find(function(currentValue,index,arr) {
    			return currentUser.ruoli.indexOf(currentValue) != -1;
    		});
    	};

    	return {
    		showInHomePage: showInHomePage
    	}
    }])
;