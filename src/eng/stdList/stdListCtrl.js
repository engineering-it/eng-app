'use strict';

angular.module('engModule')

.controller('StdListCtrl',
    ['$scope','listLoadersRegistry','engApplication','datastore','$mdSidenav','$filter','engScheduler','stdListResultsViews',
    function($scope,listLoadersRegistry,engApplication,datastore,$mdSidenav,$filter,engScheduler,stdListResultsViews) {

    	var SORTING_MANAGERS = {undefined : function(currentSortings, sorting) {
    								/*
    				            	 * PRIMO CLICK
    				            	 * Se il sorting non è ancora presente tra quelli correnti, viene aggiunto in testa con opzione di ordinamento ascendente
    				            	 */
    				            	currentSortings.splice(0, 0, {
    				            		sorting: sorting,
    				            		direction: 'ASCENDING'
    				            	});
    							},
    							'ASCENDING' : function(currentSortings, sorting) {
					            	/*
					            	 * SECONDO CLICK
					            	 * Se il sorting è già presente tra quelli correnti ed in posizione diversa da zero:
					            	 *
					            	 * 	- viene rimosso (indexOfSorting, 1)
					            	 * 	- il suo posto viene preso dal sorting precedente (indexOfSorting - 1)
					            	 * 	- viene riassegnato alla prima posizione (currentSortings[0] = ) con opzione di ordinamento discendente
					            	 *
					            	 * se già in testa all'array viene solo modificata l'opzione di ordinamento
					            	 */
    								var currentSorting = findCurrentSorting(sorting);
    								var indexOfSorting = currentSortings.indexOf(currentSorting);
    								if (indexOfSorting != 0) {
    					            	currentSortings[0] = currentSortings.splice(indexOfSorting, 1, currentSortings[indexOfSorting - 1])[0];
    				            	}
    								currentSorting.direction = 'DESCENDING';
    							},
    							'DESCENDING' : function(currentSortings, sorting) {
						    		/*
						        	 * TERZO CLICK
						        	 * Se il sorting è già presente con opzione di ordinamento discendente, viene rimosso
						        	 */
    								var currentSorting = findCurrentSorting(sorting);
    								var indexOfSorting = currentSortings.indexOf(currentSorting);
						        	currentSortings.splice(indexOfSorting, 1);
						    	}};

    	var def = $scope.activity.activityDef;
        var params = $scope.activity.params||{};
        var filtersTpl = null;

        /*
        Filtri correnti sul risultato della ricerca
         */
        $scope.filters = {};

        /*
        Le viste disponibili sui risultati della ricerca
         */
        $scope.resultsViews = [];

        $scope.actions = [];

        /*
         Le azioni visualizzate sui singoli item della ricerca
         */
        $scope.itemActions = [];

        /*
         I sorting gestiti dalla lista
         */
        $scope.availableSortings = [];

        /*
         I sorting correntemente applicati dalla lista
         */
        $scope.currentSortings = [];

        /*
         Il risultato della ricerca corrente
         */
        $scope.items = [];

        $scope.pageItems = [];
        $scope.defPageSize = 20;
        $scope.currentPageNum = 0;

        var loader = null;

        var init = function() {

            loader = getActivityLoader();
            if (params.loader) {
                angular.extend(loader,params.loader);
            }
            filtersTpl = buildFiltersTpl();

            if (def.entity) {
                datastore.getEntityById('entities',{
                    keyName: 'name',
                    keyValue: def.entity
                }).then(function(value){
                    $scope.entityDef = value;
                });
            }
            if (def.pageSize) {
            	$scope.defPageSize = def.pageSize;
            }

            initActions();
            initItemActions();
            initSortings();
            initResultsViews();
            $scope.selectView($scope.resultsViews[0]);
            scheduleSearch();

            loader.onInit(def.entity,$scope.activity);
        };

        var getActivityLoader = function() {
            return listLoadersRegistry.getLoaderServiceInstance(def.loader||"default",$scope.activity);
        };

        var initActions = function() {
            $scope.actions.push({
                name: "newItem",
                fn: function() {
                    return doNewItemAction();
                }
            });
        };

        var initItemActions = function() {

            if (def.itemsActions) {
                def.itemsActions.forEach(function(ia){
                	var fn = eval("("+ia.fn+")");
                	var itemAction = {
                		class: ia.class,
                		icon: ia.icon,
                		name: ia.name,
                		tooltip: ia.tooltip,
                		fn: function(item) {
                			fn(item,$scope.activity);
                		}
                	};
                	if (ia.fnVisibility) {
                		var fnVisibility = eval("("+ia.fnVisibility+")");
                		itemAction.fnVisibility = function(item) {
                			return fnVisibility(item);
                		};
                	}
                	if (ia.fnDisabling) {
                		var fnDisabling = eval("("+ia.fnDisabling+")");
                		itemAction.fnDisabling = function(item) {
                			return fnDisabling(item);
                		};
                	}
                	$scope.itemActions.push(itemAction);
                });
            }

            $scope.itemActions.push({
                name: "open",
                mainAction: true,
                fn: function(item) {
                    return doOpenItemAction(item);
                }
            });
            if (params.find2) {
                $scope.itemActions.push({
                    name: "selectFind2",
                    icon: 'reply',
                    class: 'md-icon-button',
                    tooltip: 'Scegli questo elemento',
                    fn: function(item) {
                        return doSelectFind2(item);
                    }
                });
            }
        };

        var initSortings = function() {
        	if (def.sortings) {
        		def.sortings.forEach(function(sorting) {
        			if (sorting.name && (sorting.sortingProperty || sorting.fn)) {
        				var fn;
        				if (sorting.fn) {
        					fn = eval("(" + sorting.fn + ")");
						} else {
							fn = function(item1,item2) {
								return item1[sorting.sortingProperty].toString().localeCompare(item2[sorting.sortingProperty].toString());
							};
						}
        				$scope.availableSortings.push({
        					name: sorting.name,
        					icon: sorting.icon,
        					tooltip: sorting.tooltip,
                            fn: function(item1,item2) {
                            	return fn(item1,item2);
                            }
        				});
        			}
                });
            }
        };

        var initResultsViews = function() {
            if ( def.resultsViews ) {
                def.resultsViews.forEach(function(val){
                    var viewDefinition = stdListResultsViews.getResultsViewDef(val.resultViewName);
                    if (viewDefinition!=null) {
                        $scope.resultsViews.push(viewDefinition);
                    }
                });
            } else {
                //init with default resultsView
                $scope.resultsViews.push(stdListResultsViews.getDefaultResultsViewDef());
            }
        };

        var buildFiltersTpl = function() {
            var defFiltersTpl = angular.isString(def.filters)?$scope.$eval(def.filters):def.filters;
            var paramsFiltersTpl = angular.isString(params.filters)?$scope.$eval(params.filters):params.filters;
            return angular.extend({},defFiltersTpl,paramsFiltersTpl);
        };

        var retrieveErrorFn = function(reason) {
            engApplication.loading = false;
        };

        var applySortings = function() {
        	$scope.items.sort(function(item1, item2) {
        		var stepResult;
        		for (var index in $scope.currentSortings) {
        			stepResult = $scope.currentSortings[index].sorting.fn(item1, item2);
        			if (stepResult != 0) {
        				if ($scope.currentSortings[index].direction == 'DESCENDING') {
        					stepResult *= -1;
        				}
						break;
					}
				}
        		return stepResult;
        	});
        };

        var applyPagination = function() {
        	if (!$scope.items || $scope.items.length==0) {
        		$scope.pageItems = [];
        		$scope.currentPageNum = 0;
        		return;
        	}

        	var startIndex = $scope.currentPageNum*$scope.defPageSize;
        	var endIndex = Math.min(startIndex+$scope.defPageSize,$scope.items.length);
        	$scope.pageItems = $scope.items.slice(startIndex,endIndex);
        };

        $scope.totalPages = function() {
        	return $scope.items?Math.ceil($scope.items.length/$scope.defPageSize):1;
        };

        $scope.setItems = function(allItems) {
        	$scope.items = allItems||[];
        	$scope.currentPageNum = 0;
        	applySortings();
        	applyPagination();
        };

        $scope.hasNextPage = function() {
        	var nextStart = ($scope.currentPageNum+1)*$scope.defPageSize;
        	return nextStart<$scope.items.length;
        };

        $scope.nextPage = function() {
        	if ($scope.hasNextPage()) {
            	$scope.currentPageNum++;
            	applyPagination();
        	}
        };

        $scope.hasPrevPage = function() {
        	var prevStart = ($scope.currentPageNum-1)*$scope.defPageSize;
        	return prevStart>=0;
        };

        $scope.prevPage = function() {
        	if ($scope.hasPrevPage()) {
            	$scope.currentPageNum--;
            	applyPagination();
        	}
        };

        var doSearch = function() {
            engApplication.loading = true;
            applyFiltersTemplates($scope.filters);
            loader.loadData(def.entity,$scope.filters,$scope.activity).then(function(val){
            	$scope.setItems(val);
                engApplication.loading = false;
            },retrieveErrorFn);
        };

        var applyFiltersTemplates = function(filters) {
            if (filtersTpl) {
                angular.forEach(filtersTpl,function(val,key){
                    filters[key] = $scope.$eval(val);
                });
            }
        };

        var scheduleSearch = engScheduler.makeScheduled(doSearch,400);

        $scope.search = function() {
            doSearch();
        };

        $scope.itemsNumber = function() {
            if (!$scope.items) {
                return 'Caricamento';
            }
            return $scope.items.length;
        };

        $scope.toggleSearchSidenav = function() {
            $mdSidenav($scope.activity.id+'_searchSidenav').toggle();
        };

        $scope.selectView = function(view) {
            $scope.selectedResultView = view;
        };

        /*
        Actions
         */

        $scope.getItemActionByName = function(itemActionName) {
            return $scope.itemActions.find(function(el){
                return el.name===itemActionName;
            });
        };

        $scope.getActionByName = function(actionName) {
            return $scope.actions.find(function(el){
                return el.name===actionName;
            });
        };

        $scope.getItemActions = function(item) {
            return $scope.itemActions;
        };

        $scope.isItemActionVisible = function(item,itemAct) {
            return !itemAct.fnVisibility || itemAct.fnVisibility(item);
        };

        $scope.isItemActionDisabled = function(item,itemAct) {
            return itemAct.fnDisabling && itemAct.fnDisabling(item);
        };

        $scope.getExtraItems = function(item) {
            return def.extraItems;
        };

        $scope.itemAction = function(item,actionName) {
            var action = $scope.getItemActionByName(actionName);
            if (action!=null && action.fn) {
                action.fn(item,action);
            }
        };

        $scope.action = function(actionName) {
            var action = $scope.getActionByName(actionName);
            if (action!=null && action.fn) {
                action.fn(action);
            }
        };

        var doOpenItemAction = function(item) {
            if (def.openItemActivity) {
                engApplication.openActivity(def.openItemActivity,{
                    editItem: item
                });
            } else if (def.openItemPage) {
                engApplication.openPage(def.openItemPage,{
                    mainObject: item
                });
            } else {
                console.warn("openItem Activity or Page not specified");
            }
        };

        var doSelectFind2 = function(item) {
            engApplication.closeCurrentActivity().then(function(){
                if (params.onFind2Result) {
                    params.onFind2Result(item);
                }
            });
        };

        var doNewItemAction = function() {
            if (def.openItemActivity) {
                engApplication.openActivity(def.openItemActivity,{
                    entity: def.entity
                });
            } else if (def.openItemPage) {
                engApplication.openPage(def.openItemPage,{
                    entity: def.entity
                });
            } else {
                console.warn("openItem Activity or Page not specified");
            }
        };

        var findCurrentSorting = function(sorting) {
        	return $scope.currentSortings.find(function(current) {
        		return current.sorting.name == sorting.name;
        	});
        };

        $scope.isAscendingActive = function(sorting) {
        	var currentSorting = findCurrentSorting(sorting);
        	return currentSorting != null && currentSorting.direction == 'ASCENDING';
        };

        $scope.isDescendingActive = function(sorting) {
        	var currentSorting = findCurrentSorting(sorting);
        	return currentSorting != null && currentSorting.direction == 'DESCENDING';
        };

        $scope.itemImgSrcFn = function(item) {
            return def.itemImgSrcFn;
        };

        $scope.itemIconProperty = function(item) {
            return def.itemIconProperty;
        };

        $scope.itemIconValue = function(item) {
            return item[$scope.itemIconProperty(item)];
        };

        $scope.itemTitleProperty = function(item){
            if (def.itemTitleProperty) {
                return def.itemTitleProperty;
            } else {
                return "id";
            }
        };

        $scope.itemSubtitleProperty = function(item){
            if (def.itemSubtitleProperty) {
                return def.itemSubtitleProperty;
            } else {
                return "";
            }
        };

        $scope.itemProperties = function(item){
            if (def.showItemProperties) {
                return def.showItemProperties;
            } else {
                return [];
            }
        };

        $scope.itemPropertyLabel = function(item,property){
            return property;
        };

        $scope.itemPropertyValue = function(item,property){
            return $scope.formatValue(item[property]);
        };

        $scope.itemsSelectable = function() {
            return def.itemsSelectable;
        };

        $scope.getCurrentSelection = function() {
            //todo rivedere la gestione della selezione
            var selection = [];
            $scope.items.forEach(function(item){
                if (item._selected) {
                    selection.push(item);
                }
            });
            return selection;
        };

        /*
         * Gestisce i ripetuti click sui bottoni di ordinamento, secondo la seguente logica:
         *
         * 	- al primo click il sorting viene aggiunto in testa all'array dei sorting correnti, con opzione di ordinamento ascendente
         * 	- al secondo click il sorting viene spostato in testa al'array, se necessario, ed impostato con opzione di ordinamento discendente
         * 	- al terzo click il sorting viene rimosso dall'array
         */
        $scope.manageSorting = function(sorting) {
        	var currentSorting = findCurrentSorting(sorting);
        	SORTING_MANAGERS[currentSorting ? currentSorting.direction : undefined]($scope.currentSortings, currentSorting ? currentSorting.sorting : sorting);
        	applySortings();
        	applyPagination();
        };

        init();

    }])

    /**
     * Provider per la registrazione delle viste standard sui risultati di ricerca
     */
    .provider('stdListResultsViews',[function(){

        var provider = this;

        var defaultView = null;
        var resultsViewDefs = {};

        this.addResultsViewDef = function(resultViewDef,isDefault){
            resultsViewDefs[resultViewDef.name] = resultViewDef;
            if (isDefault) {
                defaultView = resultViewDef;
            }
            return this;
        };

        this.getAllResultsViewDefs = function(){
            return resultsViewDefs;
        };

        this.getResultsViewDef = function(resultViewName){
            return resultsViewDefs[resultViewName];
        };

        this.getDefaultResultsViewDef = function() {
            return defaultView;
        };

        this.$get = [function(){
            return {
                getResultsViewDef: provider.getResultsViewDef,
                getAllResultsViewDefs: provider.getAllResultsViewDefs,
                addResultsViewDef: provider.addResultsViewDef,
                getDefaultResultsViewDef: provider.getDefaultResultsViewDef
            };
        }];
    }])

    /**
     * Direttiva per la vista stdListView
     */
    .directive('engStdListView',[function(){
        return {
            restrict: 'E',
            templateUrl: '/eng-app-src/eng/stdList/listViews/stdListView.html',
            controller: ['$scope',function($scope){

            }]
        };
    }])

    /**
     * Direttiva per la vista stdListView
     */
    .directive('engStdBadgesView',[function(){
        return {
            restrict: 'E',
            templateUrl: '/eng-app-src/eng/stdList/listViews/stdBadgesView.html',
            controller: ['$scope','$element',function($scope,$element){

                $($element).closest("md-content").css("background-color","#363636");

                $scope.$on('$destroy',function(){
                    $($element).closest("md-content").css("background-color","transparent");
                });

            }]
        };
    }])

    .directive('engDisplayItemImg',['$q',function($q){
        return {
            restrict: 'E',
            scope: {
            	item: '=',
            	activity: '=',
            	imgSrcFn: '='
            },
            template: "<img ng-if='src' ng-src='{{src}}' class='eng-item-img'>",
            controller: ['$scope',function($scope){
            	var srcFn = eval("("+$scope.imgSrcFn+")");
            	var result = srcFn?srcFn($scope.item,$scope.activity):null;
            	$q.when(result).then(function(value){
            		$scope.src = value;
            	});
            }]
        };
    }])

;
