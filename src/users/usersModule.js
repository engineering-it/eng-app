'use strict';

angular.module('usersModule',['engModule'])

    .config(['engApplicationProvider', function(engApplicationProvider) {

        engApplicationProvider
            .addPage({
                name: 'usersPage',
                title: 'Users',
                icon: 'people_outline',
                imageResource: 'imgs-users',
                showInHomePage: true,
                showInAppMenu: true,
                activities: [{
                    activity:'usersList'
                },{
                    activity:'rolesList'
                }],
                enabledRoles: [
                    'eng.role.profiler#951770385'	// PROFILER
                ]
            })
            .addActivity({
                extends: "stdListActivity",
                name: 'usersList',
                icon: 'people_outline',
                initial: true,
                title: 'Users',
                entity: "users",
                openItemActivity: "userEdit",
                itemTitleProperty: "username",
                itemSubtitleProperty: "ruoli",
                showItemProperties: []
            })
            .addActivity({
                name: 'userEdit',
                extends: "stdEditActivity",
                title: 'User',
                entity: "users",
                titleTpl: '{{editItem.username}}'
            })
            .addActivity({
                name: 'rolesList',
                extends: "stdListActivity",
                title: 'Roles',
                icon: 'star',
                entity: "roles",
                openItemActivity: "rolesEdit",
                itemTitleProperty: "name",
                itemSubtitleProperty: "description",
                showItemProperties: []
            })
            .addActivity({
                name: 'rolesEdit',
                extends: "stdEditActivity",
                title: 'Role',
                entity: "roles",
                titleTpl: '{{editItem.name}}'
            });

    }])
;
