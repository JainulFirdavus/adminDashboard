angular.module('mjAdmin').controller('AdminCtrl', ['$stateParams', '$scope', '$timeout', 'adminprofileresolve', '$rootScope', 'apiService', function ($stateParams, $scope, $timeout, adminprofileresolve, $rootScope, apiService) {
    var ac = this;
    ac.stateParams = $stateParams;
    ac.user = adminprofileresolve;


}]).controller('AdminListCtrl', ['$scope', '$timeout', 'adminresolve', '$stateParams', function ($scope, $timeout, adminresolve, $stateParams) {

    var ac = this;
    var layout = [
        /*   {
              name: 'Profile Image',
              template: '<span ><img class="profile-img img-sm" height="80" width="80" ng-src="/files_dashboard/user_avatars/{{content._id}}/{{content.image}}" err-src/></span>',
          }, */
        {
            name: 'Username',
            template: '{{content.name}}',
        },
        { name: 'Role', template: '{{content.role}}' },
        {
            name: 'Date',
            template: '{{content.activity.last_login | date:"medium" }}',
        },
        /*  {
             name: 'Last Login Date',
             template: '{{content.last_seen ? (content.last_seen | date:"MM/dd/yyyy h:mma") :"--"}}',
         }, */
        {
            name: '',
            template: '<div class="" ui-sref="admin.adminedit({id:content._id})"><i class="fa fa-edit"></i> </div>'
        }


    ];
    ac.table = {};


    ac.table.layout = layout;
    ac.table.tableName = "Admin List";
    ac.table.data = adminresolve[0];
    ac.table.count = adminresolve[1] || 0;
    ac.table.delete = {
        getData: function (currentPage, itemsPerPage, sort, search, filtervalue) {
            if (currentPage >= 1) {
                var skip = (parseInt(currentPage) - 1) * itemsPerPage;
                var limit = itemsPerPage;
                $rootScope.search = search;
                apiService.apiRequest('/admin/adminlist', 'POST', { limit: limit, skip: skip, sort: sort, search: search, filterValue: filtervalue }).then(function (respo) {
                    ac.table.data = respo[0];
                    angular.forEach(ac.table.data, function (value, key) {
                        if (value.online_offline_status) {
                            ac.table.data[key].online_offline_status = value.online_offline_status;
                        } else {
                            ac.table.data[key].online_offline_status = 0;
                        }
                        if (value.last_seen) {
                            value.last_seen = new Date(value.last_seen)
                        }
                    });
                    ac.table.count = respo[1];

                });
            }
        }
    }

}]);