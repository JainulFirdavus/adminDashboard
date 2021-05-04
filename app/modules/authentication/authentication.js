angular.module('Authentication').controller('LoginCtrl', ['$scope', '$timeout', 'apiService', '$state', function ($scope, $timeout, apiService, $state) {
    var lc = this;


    lc.login = function () {
        apiService.apiRequest('/admin/login', 'POST', { username: lc.username, password: lc.password }).then(function (data) {
            if (data.status == 0) {
                lc.status = 0
            } else {
                // $http.defaults.headers.common['Authorization'] = data.authdata;
                window.localStorage.removeItem("token");
                data.response.logindate = Date.now()
                window.localStorage.setItem("token", JSON.stringify(data.response));
                $state.go("admin.dashboard", { reload: true });
            }
        })
    }


}]);