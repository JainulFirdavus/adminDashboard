angular.module('mjAdmin').controller('UsersCtrl', ['$scope', '$timeout', 'usersresolve', '$rootScope', 'apiService', function ($scope, $timeout, usersresolve, $rootScope, apiService) {

    var uc = this;

    uc.userCount =usersresolve &&  usersresolve[1] ? usersresolve[1] : 0
    uc.activeUser =usersresolve[2] &&  usersresolve[2][0].count ? usersresolve[2][0].count : 0;
    uc.pendingUser =usersresolve[2] &&  usersresolve[2][1].count ? usersresolve[2][1].count : 0;
    var layout = [
        {
            name: 'Profile Image',
            template:
                '<span ><img class="profile-img img-sm" height="80" width="80" ng-src="/files_dashboard/user_avatars/{{content._id}}/{{content.image}}" err-src/></span> ',
        },
        {
            name: 'Username',
            template: ' <small class="text-black font-weight-medium d-block"> {{content.username ? (content.username  | capitalize ):"---"}} </small><span class="text-gray"> {{content.phone}}</span>',
        },
        {
            name: 'Country',
            template: '{{content.country | capitalize }}',
        },
        {
            name: 'OS',
            template: '<small class="text-black font-weight-medium d-block"> {{content.device_type ?( content.device_type | capitalize ) :"---"}} </small>',
        },
        {
            name: 'Status', template: '<span  style="display: inline-flex;" ng-if="!content.username" class="badge badge-pill badge-warning"> {{content.user_status}}</span>' +
                '<span ng-if="content.username"  style="display: inline-flex;" class="badge badge-pill badge-info"> {{ content.user_status }}</span>'
        },
        {
            name: 'Last Login Date',
            template: '{{content.last_login ? (content.last_login | date:"MM/dd/yyyy h:mma") :"--"}} ',
        },
        {
            name: '',
            template: '<div class="" ui-sref="admin.viewUsers({id:content._id})"><i class="fa fa-edit"></i> </div>'
        }
    ];
    uc.table = {};
    uc.table.layout = layout;
    uc.table.tableName = "User List";
    uc.table.data = usersresolve[0];
    uc.table.count = usersresolve[1] || 0;
    uc.table.delete = {
        getData: function (currentPage, itemsPerPage, sort, search, filtervalue) {
            if (currentPage >= 1) {
                var skip = (parseInt(currentPage) - 1) * itemsPerPage;
                var limit = itemsPerPage;
                $rootScope.search = search;
                apiService.apiRequest('/admin/userList', 'POST', { limit: limit, skip: skip, sort: sort, search: search, filterValue: filtervalue }).then(function (respo) {
                    uc.table.data = respo[0];
                    uc.userCount = respo[1] ? respo[1] : 0
                    uc.activeUser = respo[2][0].count ? respo[2][0].count : 0;
                    uc.pendingUser = respo[2][1].count ? respo[2][1].count : 0;
                    angular.forEach(uc.table.data, function (value, key) {
                        if (value.online_offline_status) {
                            uc.table.data[key].online_offline_status = value.online_offline_status;
                        } else {
                            uc.table.data[key].online_offline_status = 0;
                        }
                        if (value.last_seen) {
                            value.last_seen = new Date(value.last_seen)
                        }
                    });
                    uc.table.count = respo[1];

                });
            }
        }
    }

}]).controller('UserViewCtrl', ['$scope', '$timeout', 'usersresolve', '$stateParams', function ($scope, $timeout, usersresolve, $stateParams) {

    var uvc = this;
    uvc.stateParams = $stateParams;
    uvc.userschat = usersresolve.response.userschat[0] ? usersresolve.response.userschat[0].count : 0;
    uvc.userscall = usersresolve.response.userscall[0] ? usersresolve.response.userscall[0].count : 0;
    uvc.usersgroup = usersresolve.response.usersgroup[0] ? usersresolve.response.usersgroup[0].count : 0;
    uvc.user = usersresolve.response.user;

}]);